const PDFDocument = require('pdfkit');
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');

// Configuration
const SENDGRID_FROM = 'scott.magnacca1@gmail.com';
const SENDGRID_REPLY_TO = 'scott.magnacca1@gmail.com';

function calculateScore(q1, q2, q3, q4) {
  return parseInt(q1 || 0) + parseInt(q2 || 0) + parseInt(q3 || 0) + parseInt(q4 || 0);
}

function getRiskCategory(score) {
  if (score >= 4 && score <= 7) return 'HIGH RISK (Laggard)';
  if (score >= 8 && score <= 11) return 'MODERATE RISK (Experimenter)';
  if (score >= 12 && score <= 16) return 'LOW RISK (Modern Leader)';
  return 'UNKNOWN';
}

function generatePDFBuffer(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'Letter',
      margin: 40
    });

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { firstName, lastName, title, company, email, score, riskCategory } = data;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Header
    doc.fillColor('#0a0e1a');
    doc.fontSize(24).font('Helvetica-Bold').text('AI-SELLING READINESS REPORT');
    doc.fontSize(14).font('Helvetica').text('Prepared for: ' + firstName + ' ' + lastName);
    if (title) doc.text(title + (company ? ' at ' + company : ''));
    doc.text('Date: ' + today);
    doc.fontSize(11).text('Prepared by: Scott Magnacca');
    doc.fontSize(10).font('Helvetica-Oblique').text('Adjunct Lecturer, Babson College | Harvard ALM (Psychology)');

    // Main content
    doc.moveDown(0.5);
    doc.fillColor('#C9A84C');
    doc.fontSize(16).font('Helvetica-Bold').text('Your Score: ' + score + '/16');
    doc.fillColor('#0a0e1a');
    doc.fontSize(14).font('Helvetica-Bold').text('Risk Category: ' + riskCategory);

    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text('This personalized report is based on your quiz responses and shows your organization readiness for AI-enabled selling.');

    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica-Bold').text('Key Insights:');
    doc.fontSize(10).font('Helvetica').text('- Your current state has been analyzed based on quiz scores');
    doc.text('- Recommended path: ' + (score <= 7 ? 'Build foundational AI selling skills' : score <= 11 ? 'Systematize AI across your team' : 'Strengthen your AI selling edge'));
    doc.text('- Timeline: 90 days to see measurable improvement');

    // CTAs
    doc.moveDown(1);
    doc.fillColor('#C9A84C');
    doc.fontSize(12).font('Helvetica-Bold').text('Next Steps:');
    doc.fillColor('#0a0e1a');
    doc.fontSize(10).font('Helvetica').text('1. Strategy Sprint: 90-minute consultation with Scott');
    doc.fontSize(10).font('Helvetica').text('2. Self-Study: Practical AI & Sales 8-week course');
    doc.fontSize(10).font('Helvetica').text('Visit: salesforlife.ai');

    // Footer
    doc.moveDown(1);
    doc.fontSize(9).font('Helvetica').fillColor('#666');
    doc.text('Generated on ' + today + ' | Email: ' + email);

    doc.end();
  });
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    const {
      firstName = 'User',
      lastName = 'Quiz Taker',
      email = 'test@example.com',
      title = '',
      company = '',
      q1 = 1,
      q2 = 1,
      q3 = 1,
      q4 = 1
    } = body;

    // Calculate score
    const score = calculateScore(q1, q2, q3, q4);
    const riskCategory = getRiskCategory(score);

    // Generate PDF
    const pdfBuffer = await generatePDFBuffer({
      firstName,
      lastName,
      title,
      company,
      email,
      score,
      riskCategory
    });

    const pdfBase64 = pdfBuffer.toString('base64');

    // Set SendGrid API key
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    } else {
      throw new Error('SENDGRID_API_KEY environment variable not set');
    }

    // Send personalized report to user
    await sgMail.send({
      to: email,
      from: SENDGRID_FROM,
      replyTo: SENDGRID_REPLY_TO,
      subject: 'Your AI-Selling Readiness Report - ' + riskCategory,
      html: '<h2>Your AI-Selling Readiness Report</h2><p>Hi ' + firstName + ',</p><p>Attached is your personalized report based on your quiz responses.</p><p><strong>Risk Category:</strong> ' + riskCategory + '</p><p><strong>Score:</strong> ' + score + '/16</p><p>Ready to take action? Visit <a href="https://salesforlife.ai">salesforlife.ai</a> to explore your options.</p><p>Best,<br>Scott Magnacca</p>',
      attachments: [
        {
          content: pdfBase64,
          filename: 'AI-Selling-Readiness-Report_' + lastName + '_' + new Date().toISOString().split('T')[0] + '.pdf',
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    });

    // Send summary email to Scott
    await sgMail.send({
      to: 'scott.magnacca1@gmail.com',
      from: SENDGRID_FROM,
      replyTo: SENDGRID_REPLY_TO,
      subject: 'Quiz Report Sent: ' + firstName + ' ' + lastName + ' (Score: ' + score + ')',
      html: '<h3>Quiz Report Sent</h3><p><strong>Contact:</strong> ' + firstName + ' ' + lastName + '</p><p><strong>Email:</strong> ' + email + '</p><p><strong>Company:</strong> ' + company + '</p><p><strong>Title:</strong> ' + title + '</p><p><strong>Quiz Score:</strong> ' + score + '/16</p><p><strong>Risk Category:</strong> ' + riskCategory + '</p><p><strong>Report Sent:</strong> ' + new Date().toISOString() + '</p>'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Report generated and email sent',
        score,
        riskCategory
      })
    };

  } catch (error) {
    console.error('Quiz submission error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
