const PDFDocument = require('pdfkit');
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');

// Configuration
const SENDGRID_FROM = 'scott.magnacca1@gmail.com';
const SENDGRID_REPLY_TO = 'scott.magnacca1@gmail.com';

// Quiz Scoring Logic
const QUIZ_QUESTIONS = [
  {
    question: 'How are you currently using AI in your sales process?',
    options: [
      { text: 'Not using AI yet', value: 1 },
      { text: 'Experimenting with ChatGPT/tools casually', value: 2 },
      { text: 'Using AI for research, email drafts, objection handling', value: 3 },
      { text: 'Full sales stack integration + buyer intel AI', value: 4 }
    ]
  },
  {
    question: 'How confident are you that your team can compete on AI-selling skills?',
    options: [
      { text: 'Not confident; we\'re behind', value: 1 },
      { text: 'Somewhat confident, but worried', value: 2 },
      { text: 'Moderately confident; we\'re staying current', value: 3 },
      { text: 'Very confident; AI fluency is core to our culture', value: 4 }
    ]
  },
  {
    question: 'How concerned are you about AI shifting buyer expectations?',
    options: [
      { text: 'Very concerned; this is existential', value: 1 },
      { text: 'Moderately concerned; we need a plan', value: 2 },
      { text: 'Concerned, but we\'re adapting', value: 3 },
      { text: 'Excited; we\'re ahead of this curve', value: 4 }
    ]
  },
  {
    question: 'What\'s your strategy for AI upskilling your team?',
    options: [
      { text: 'No strategy yet', value: 1 },
      { text: 'Informal learning; people explore on their own', value: 2 },
      { text: 'Structured curriculum + role-based training', value: 3 },
      { text: 'Structured + accountability + quarterly reviews', value: 4 }
    ]
  }
];

function calculateScore(answers) {
  if (!Array.isArray(answers)) return 0;
  return answers.reduce((sum, answer) => sum + (parseInt(answer.value) || 0), 0);
}

function getRiskCategory(score) {
  if (score >= 4 && score <= 7) return 'HIGH RISK (Laggard)';
  if (score >= 8 && score <= 11) return 'MODERATE RISK (Experimenter)';
  if (score >= 12 && score <= 16) return 'LOW RISK (Modern Leader)';
  return 'UNKNOWN';
}

function getRiskCategoryType(score) {
  if (score >= 4 && score <= 7) return 'laggard';
  if (score >= 8 && score <= 11) return 'experimenter';
  if (score >= 12 && score <= 16) return 'modern';
  return 'unknown';
}

function getPercentile(score) {
  const maxScore = 16;
  return Math.round((score / maxScore) * 100);
}

// PDF Generation using PDFKit
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

    const { firstName, lastName, title, company, email, score, riskCategory, riskType, percentile } = data;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // PAGE 1: THE DIAGNOSIS

    // Header
    doc.fillColor('#0a0e1a');
    doc.fontSize(24).font('Helvetica-Bold').text('AI-SELLING READINESS REPORT', { underline: false });
    doc.fontSize(14).font('Helvetica').text(`Prepared for: ${firstName} ${lastName}`, { margin: [10, 0, 0, 0] });
    if (title) doc.text(`${title}${company ? ` at ${company}` : ''}`, { margin: [2, 0, 0, 0] });
    doc.text(`Date: ${today}`, { margin: [2, 0, 0, 0] });
    doc.fontSize(11).text('Prepared by: Scott Magnacca', { margin: [2, 0, 0, 0] });
    doc.fontSize(10).font('Helvetica-Oblique').text('Adjunct Lecturer, Babson College | Harvard ALM (Psychology)', { margin: [2, 0, 30, 0] });

    // Executive Summary
    doc.fillColor('#0a0e1a');
    doc.fontSize(12).font('Helvetica-Bold').text('Executive Summary', { underline: true });
    doc.fontSize(11).font('Helvetica');

    const summaries = {
      laggard: `You're not alone—70% of sales leaders report feeling behind on AI adoption. The good news: CEOs who shift from reactive scrambling to a structured AI roadmap see a 40% lift in deal-closing velocity within 90 days. This report maps your current state and shows exactly where to start.`,
      experimenter: `Casual AI experimentation creates knowledge without strategy—your team learns tactics but misses the competitive edge. CEOs who move from "people trying ChatGPT" to "structured AI fluency" close 40% more deals because buyers sense the difference. This report reveals what's missing and how to close the gap.`,
      modern: `You're ahead of the curve on AI integration, and your buyers can sense it. The next layer isn't more tools—it's weaponizing Narrative Intelligence to turn AI insights into deal-closing stories. This report validates your momentum and shows how to scale the edge.`
    };

    doc.text(summaries[riskType] || summaries.experimenter, { align: 'left', lineGap: 5 });

    // Your Current State: The Risk Score
    doc.moveDown(1);
    doc.fillColor('#0a0e1a');
    doc.fontSize(12).font('Helvetica-Bold').text('Your Current State: The Risk Score', { underline: true });

    // Risk Badge Box
    doc.rect(40, doc.y + 10, 520, 80).fillOpacity(0.05).fill('#C9A84C');
    doc.fillColor('#C9A84C');
    doc.fontSize(20).font('Helvetica-Bold').text(riskCategory, { x: 60, y: doc.y + 15 });

    doc.fillColor('#0a0e1a');
    doc.fontSize(11).font('Helvetica');
    doc.text(`Score: ${score}/16 | Percentile: ${percentile}%`, { x: 60, y: doc.y + 5, lineGap: 3 });
    doc.fontSize(10).text(`Your team's AI readiness is at the ${percentile}th percentile of sales organizations.`, { x: 60, y: doc.y + 3 });

    doc.moveDown(3);

    // Analysis of the Gap
    doc.fillColor('#0a0e1a');
    doc.fontSize(12).font('Helvetica-Bold').text('Analysis of the Gap: Why Your Current Stage Is Costing You "Narrative Velocity"', { underline: true });

    doc.fontSize(11).font('Helvetica');
    doc.text('Narrative Velocity = the speed at which your sales team moves a buyer from awareness → conviction → decision. AI-enabled selling multiplies this velocity by 3–5x when deployed structurally.', { align: 'left', lineGap: 4, marginBottom: 10 });

    const gapAnalyses = {
      laggard: {
        title: 'Your Gap: Structure',
        content: [
          { heading: '1. Buyer Intelligence Blindness', text: 'Your buyers are researching themselves using AI tools (ChatGPT, Perplexity, Claude). You're entering conversations with generic talking points while they have personalized intel. Cost: You're 2–3 discovery calls behind before you start.' },
          { heading: '2. Speed Disadvantage', text: 'Competitors using AI research tools find buyer pain points 10x faster than manual research. You're still pulling from CRM notes and LinkedIn profiles. Cost: Longer sales cycles, fewer qualified conversations.' },
          { heading: '3. Credibility Tax', text: 'Buyers expect AI-native sellers to speak their language (frameworks, data, insights). You're still using 2019 sales methodology. Cost: 30% lower close rates on first-time buyers.' }
        ]
      },
      experimenter: {
        title: 'Your Gap: Systematization',
        content: [
          { heading: '1. Inconsistency', text: 'Some reps use ChatGPT for emails; others don't. No company standard for how AI intel flows into pitches. Cost: Unpredictable results; can't scale what works.' },
          { heading: '2. Missed Leverage', text: 'You're using AI tactically (one-off prompts) instead of strategically (integrated workflows). Example: Using AI to draft emails, but not to research buyer intent BEFORE the email. Cost: You gain 20% speed, but miss 70% of the insight value.' }
        ]
      },
      modern: {
        title: 'Your Advantage: Narrative Intelligence',
        content: [
          { heading: 'What separates you from the pack', text: 'You research with AI, but you sell with stories. Your team uses AI to uncover buyer pain points, then uses Narrative to make them feel the solution. Buyers sense this difference; it builds trust and urgency.' },
          { heading: 'The opportunity', text: 'Most competitors will stop at "AI for efficiency." You can go to "AI as a storytelling accelerator." That's a 3–5 year competitive moat.' }
        ]
      }
    };

    const analysis = gapAnalyses[riskType] || gapAnalyses.experimenter;
    doc.fillColor('#C9A84C');
    doc.fontSize(11).font('Helvetica-Bold').text(analysis.title);
    doc.fillColor('#0a0e1a');

    analysis.content.forEach(item => {
      doc.fontSize(10).font('Helvetica-Bold').text(item.heading, { marginTop: 5 });
      doc.fontSize(10).font('Helvetica').text(item.text, { align: 'left', lineGap: 3, marginBottom: 6 });
    });

    // Competitive Benchmark
    doc.moveDown(0.5);
    doc.fillColor('#0a0e1a');
    doc.fontSize(12).font('Helvetica-Bold').text('Competitive Benchmark: The AI-Arms Race', { underline: true });

    doc.fontSize(10).font('Helvetica');
    const benchmarkText = `• 62% of enterprise sales leaders have deployed AI into their sales process (McKinsey 2025)
• 78% of buyers now expect sellers to use AI for research (Gartner)
• Average deal cycle time for AI-enabled teams: 34 days
• Average deal cycle time for non-AI teams: 52 days
• Gap: 18 days, or 35% faster closing

Where you sit:
${riskType === 'laggard' ? '• You're in the 28% of sales orgs that haven't moved yet. Buyers are noticing. In 12 months, this will be table stakes.' : ''}
${riskType === 'experimenter' ? '• You're in the 60% that's trying. But "trying" without structure = 30% productivity uplift vs. competitors getting 200%+.' : ''}
${riskType === 'modern' ? '• You're in the 12% with structured AI integration. Maintain this edge or competitors will catch up in 18–24 months.' : ''}`;

    doc.text(benchmarkText, { align: 'left', lineGap: 3 });

    // Page break
    doc.addPage();

    // PAGE 2: THE ROADMAP & RECOMMENDATIONS

    doc.fillColor('#0a0e1a');
    doc.fontSize(14).font('Helvetica-Bold').text('The Three Pillars of AI-Selling Mastery');
    doc.fontSize(11).font('Helvetica').text('Every sales leader who moves from "falling behind" to "competitive advantage" builds these three pillars.', { marginBottom: 15, color: '#666' });

    // Pillar 1
    doc.fillColor('#C9A84C');
    doc.fontSize(12).font('Helvetica-Bold').text('Pillar 1: Curiosity — Use AI to Research Deep Buyer Intent');
    doc.fillColor('#0a0e1a');
    doc.fontSize(10).font('Helvetica');
    doc.text('Before every call, use AI to understand not just what a buyer says they need, but why they're vulnerable to your solution.', { lineGap: 3, marginBottom: 8 });

    doc.fontSize(10).font('Helvetica-Bold').text('Tactical Play (30 minutes, changes the call):');
    doc.fontSize(9).font('Helvetica').text('1. Gather the inputs (3 min): Prospect name + company + role, recent company news, LinkedIn activity, your solution's top 3 use cases.\n2. Use AI to synthesize (5 min): Prompt: "Given [Prospect Name] at [Company], who recently [news], what are the 3 most likely pain points they're experiencing RIGHT NOW?"\n3. Ask hypothesis-driven questions on the call (not discovery questions): Instead of "What challenges are you facing?" ask "I noticed you hired 5 sales ops people last quarter. I'm guessing you're struggling with sales tech integration—am I in the ballpark?"', { lineGap: 2, marginBottom: 8 });

    doc.fontSize(9).font('Helvetica-Bold').text('Impact:');
    doc.fontSize(9).font('Helvetica').text('Calls feel like peer consultations (not vendor pitches). Buyers trust you faster. You close 35–50% faster (Harvard Business Review).', { lineGap: 2, marginBottom: 12 });

    // Pillar 2
    doc.fillColor('#C9A84C');
    doc.fontSize(12).font('Helvetica-Bold').text('Pillar 2: Lifelong Learning — Build an "AI Fluency" Culture');
    doc.fillColor('#0a0e1a');
    doc.fontSize(10).font('Helvetica');
    doc.text('Your team doesn't just use AI tools—they understand why those tools work, and they stay current as AI evolves.', { lineGap: 3, marginBottom: 8 });

    doc.fontSize(9).font('Helvetica-Bold').text('The Structure (quarterly cadence):');
    doc.fontSize(9).font('Helvetica').text('Month 1: Skill Sprint (2 hrs/week) — Topic: "AI for [Role-Specific Task]", format: group learning + rep-led demo.\nMonth 2: Implementation (daily) — Reps use the new skill in real calls; manager spot-checks 2 calls.\nMonth 3: Measurement (quarterly review) — Did the skill move the needle on deal velocity? What % of your team consistently used it?', { lineGap: 2, marginBottom: 12 });

    // Pillar 3
    doc.fillColor('#C9A84C');
    doc.fontSize(12).font('Helvetica-Bold').text('Pillar 3: Adaptive Agility — Move from Textbook Sales to Real-World AI-Enabled Deal-Making');
    doc.fillColor('#0a0e1a');
    doc.fontSize(10).font('Helvetica');
    doc.text('Sales methodology books are written for 2019. Your buyers are in 2025. Adaptive agility is the ability to bend your process in real-time based on what AI tells you about THIS buyer, THIS deal, THIS moment.', { lineGap: 3, marginBottom: 8 });

    doc.fontSize(9).font('Helvetica-Bold').text('Tactical Play: The "Buyer Signal Dashboard"');
    doc.fontSize(9).font('Helvetica').text('Monitor these 5 signals (during the sales cycle): Email engagement (open rate, click rate, response speed), Conversation tenor (tone analysis: enthusiasm, urgency, hesitation), Deal velocity (pace of follow-ups, meeting frequency), Stakeholder involvement (new voices in email threads = consensus building), Budget readiness (explicit budget comments, approval timeline mentions).', { lineGap: 2, marginBottom: 10 });

    // Role-Specific Actions
    doc.moveDown(0.5);
    doc.fillColor('#0a0e1a');
    doc.fontSize(12).font('Helvetica-Bold').text('Your Role-Specific Action Items');
    doc.fontSize(10).font('Helvetica');

    const roleActions = riskType === 'laggard' ? `1. This quarter: Audit your team's AI usage. What % of your reps are using AI in discovery calls? If <60%, make it a KPI. Measure it weekly.
2. Next quarter: Implement the "Pre-Call AI Research Template". Make it non-negotiable. Spot-check 2 calls per month.` : (riskType === 'modern' ? `1. This quarter: Define your AI selling strategy. Are you optimizing for speed (close faster), insight (win larger deals), or volume (handle more deals)?
2. Next quarter: Build an AI fluency onboarding for new hires. Any rep joining your team should graduate from an "AI Selling Bootcamp" in their first 30 days.` : `1. This quarter: Audit your team's AI usage. What % of your reps are using AI in discovery calls? If <60%, make it a KPI. Measure it weekly.
2. Next quarter: Systematize what your team is already doing. If someone found a great ChatGPT prompt, capture it, teach it, measure it.`);

    doc.text(roleActions, { lineGap: 3, marginBottom: 15 });

    // Storyselling Edge
    doc.fillColor('#0a0e1a');
    doc.fontSize(12).font('Helvetica-Bold').text('The "Storyselling" Edge');
    doc.fontSize(10).font('Helvetica');
    doc.text('AI will replace bad selling. The future belongs to sellers who use AI to sell better. Buyers are drowning in data. Competitors can all access the same ChatGPT prompts, the same buyer intelligence, the same email templates. What they can't replicate: Your ability to turn that intelligence into a story that makes the buyer feel something.', { lineGap: 3, marginBottom: 10 });

    // CTA Section
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke('#C9A84C');
    doc.moveDown(1);

    doc.fillColor('#C9A84C');
    doc.fontSize(12).font('Helvetica-Bold').text('Your Next Move: Two Options');
    doc.fillColor('#0a0e1a');
    doc.fontSize(10).font('Helvetica');

    doc.fontSize(10).font('Helvetica-Bold').text('Option A: Strategy Sprint (90 minutes, $500)');
    doc.fontSize(9).font('Helvetica').text('Book a 1-on-1 call with Scott to map your specific AI selling roadmap, aligned to your sales process and team. → calendly.com/scottmagnacca/90-min-sprint', { marginBottom: 10 });

    doc.fontSize(10).font('Helvetica-Bold').text('Option B: Self-Study Course (8 weeks, $297)');
    doc.fontSize(9).font('Helvetica').text('Join the Practical AI & Sales masterclass at salesforlife.ai. Learn the frameworks, implement them with your team, measure the results. → salesforlife.ai', { marginBottom: 15 });

    // Footer
    doc.fontSize(9).font('Helvetica').fillColor('#666');
    doc.text(`Generated on ${today} | Report ID: ${email.replace('@', '_').substring(0, 20)}`, { align: 'center', margin: [20, 0, 0, 0] });

    doc.end();
  });
}

// Main handler
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse form data
    const body = new URLSearchParams(event.body);
    const formPayload = {
      'form-name': body.get('form-name') || 'quiz-leads',
      firstName: body.get('firstName') || '',
      lastName: body.get('lastName') || '',
      email: body.get('email') || '',
      title: body.get('title') || '',
      company: body.get('company') || '',
      source: body.get('source') || '60-Second-AI-Quiz',
      q1: body.get('q1') || '',
      q2: body.get('q2') || '',
      q3: body.get('q3') || '',
      q4: body.get('q4') || ''
    };

    // Validate required fields
    if (!formPayload.email || !formPayload.firstName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: email and firstName' })
      };
    }

    // Build answers array from form data
    const answers = [
      { value: formPayload.q1 },
      { value: formPayload.q2 },
      { value: formPayload.q3 },
      { value: formPayload.q4 }
    ].filter(a => a.value);

    // Calculate score
    const score = calculateScore(answers);
    const riskCategory = getRiskCategory(score);
    const riskType = getRiskCategoryType(score);
    const percentile = getPercentile(score);

    // Generate PDF
    const pdfBuffer = await generatePDFBuffer({
      firstName: formPayload.firstName,
      lastName: formPayload.lastName,
      title: formPayload.title,
      company: formPayload.company,
      email: formPayload.email,
      score,
      riskCategory,
      riskType,
      percentile
    });

    // Convert PDF to base64 for email attachment
    const pdfBase64 = pdfBuffer.toString('base64');

    // Send email with PDF via SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const emailContent = `
      <h2>Your AI-Selling Readiness Report Is Ready</h2>
      <p>Hi ${formPayload.firstName},</p>
      <p>Thanks for taking the CEO Sales 60-Second Quiz. I've analyzed your answers and prepared a personalized <strong>AI-Selling Readiness & Risk Assessment report</strong>—attached below.</p>

      <div style="background:#f0f7ff;padding:15px;border-radius:8px;margin:20px 0;">
        <p style="margin:0;font-weight:bold;">Your Score: ${score}/16</p>
        <p style="margin:8px 0;font-size:14px;color:#666;">Risk Category: <strong>${riskCategory}</strong></p>
      </div>

      <p>This 2-page report shows:</p>
      <ul>
        <li>Your current AI-selling readiness level (and what it's costing you)</li>
        <li>The specific gap between where you are and where you need to be</li>
        <li>A 3-pillar roadmap to close that gap in the next 90 days</li>
      </ul>

      <p>Download and review—then let me know if you want to discuss your next steps.</p>

      <p>Best,<br>
      <strong>Scott Magnacca</strong><br>
      Adjunct Lecturer, Babson College | Harvard ALM (Psychology)<br>
      Creator, Narrative Intelligence Framework</p>

      <hr style="border:0;border-top:1px solid #ddd;margin:30px 0;">

      <p><strong>P.S.</strong> If you want a personalized strategy sprint to implement these recommendations with your team, book 90 minutes here: <a href="https://calendly.com/scottmagnacca/90-min-sprint">calendly.com/scottmagnacca/90-min-sprint</a></p>
      <p><strong>P.P.S.</strong> Or join the free webinar series at <a href="https://salesforlife.ai">salesforlife.ai</a> to dive deeper into AI-driven selling strategy.</p>
    `;

    await sgMail.send({
      to: formPayload.email,
      from: SENDGRID_FROM,
      replyTo: SENDGRID_REPLY_TO,
      subject: `${formPayload.firstName}, Your AI-Selling Readiness Report Is Ready`,
      html: emailContent,
      attachments: [
        {
          content: pdfBase64,
          filename: `AI-Selling-Readiness-Report_${formPayload.lastName || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    });

    // Also send summary to Scott
    await sgMail.send({
      to: 'scott.magnacca1@gmail.com',
      from: SENDGRID_FROM,
      replyTo: SENDGRID_REPLY_TO,
      subject: `✅ Quiz Report Sent: ${formPayload.firstName} ${formPayload.lastName} (Score: ${score})`,
      html: `
        <h3>Quiz Report Sent</h3>
        <p><strong>Contact:</strong> ${formPayload.firstName} ${formPayload.lastName}</p>
        <p><strong>Email:</strong> ${formPayload.email}</p>
        ${formPayload.company ? `<p><strong>Company:</strong> ${formPayload.company}</p>` : ''}
        ${formPayload.title ? `<p><strong>Title:</strong> ${formPayload.title}</p>` : ''}
        <p><strong>Quiz Score:</strong> ${score}/16</p>
        <p><strong>Risk Category:</strong> ${riskCategory}</p>
        <p><strong>Report Sent:</strong> ${new Date().toISOString()}</p>
      `
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
