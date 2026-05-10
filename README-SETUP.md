# AI-Selling Readiness Report — Post-Quiz Fulfillment Setup

## Overview
This project generates personalized 2-page PDF reports that are automatically sent via SendGrid immediately after a user completes the **CEO Sales 60-Second Quiz** (ceo-sales-60-second-quiz-outreach.netlify.app).

## System Architecture

```
[Quiz Submission] 
    ↓
[Netlify Form → submission-created.js in quiz project]
    ↓
[Forwards to: Google Sheets + Report Fulfillment Function]
    ↓
[Quiz Answers Extracted]
    ↓
[PDF Generated + Sent via SendGrid]
```

## Functions

### `netlify/functions/quiz-submission.js`
Handles incoming quiz submissions from the CEO Sales 60-Second Quiz:
- Receives: firstName, lastName, email, title, company, q1, q2, q3, q4
- Calculates: Quiz score (4–16), Risk category (Laggard/Experimenter/Modern Leader)
- Generates: 2-page personalized PDF report
- Sends: Email with PDF attachment via SendGrid
- Also sends: Summary email to scott.magnacca1@gmail.com

## Environment Variables Required

Set these in Netlify UI (Site Settings → Build & Deploy → Environment):

```
SENDGRID_API_KEY = <your SendGrid API key>
REPORT_FULFILLMENT_ENDPOINT = https://practical-ai-quiz-emails.netlify.app/.netlify/functions/quiz-submission
```

The second variable is needed for the quiz project's submission-created.js to call this function.

## Setup Steps

1. **Install dependencies locally** (for local testing):
   ```bash
   npm install
   ```

2. **Set environment variables in Netlify**:
   - Go to Netlify site settings
   - Build & Deploy → Environment
   - Add SENDGRID_API_KEY
   - Add REPORT_FULFILLMENT_ENDPOINT (or it will use default)

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Configure the Quiz Project** (cowork-60secondaiquiz):
   - The form now includes hidden fields: q1, q2, q3, q4, title, company
   - The submission-created.js has been updated to call this report function
   - No additional setup needed on the quiz side

## Testing

### Local Testing
```bash
netlify dev
```

Then POST to `http://localhost:3000/.netlify/functions/quiz-submission` with:
```
form-data:
  firstName: "John"
  lastName: "Doe"
  email: "john@example.com"
  title: "VP Sales"
  company: "Acme Corp"
  q1: "1"
  q2: "2"
  q3: "3"
  q4: "4"
```

### Test Email
To test the full flow, submit the quiz with your own email and verify:
1. You receive the PDF report email
2. PDF opens and displays correctly
3. Score and risk category are correct (expected: 10/16, MODERATE RISK)

## Report Content

The 2-page PDF includes:

**Page 1:**
- Executive Summary (tailored to risk category)
- Risk Score (visual badge showing category)
- Analysis of the Gap (specific to their stage)
- Competitive Benchmark (market context)

**Page 2:**
- Three Pillars of AI-Selling Mastery (with tactics)
- Role-Specific Action Items
- The "Storyselling" Edge
- CTAs (Strategy Sprint booking + course link)

## PDF Generation Details

- **Library**: pdfkit (Node.js PDF generation)
- **Personalization**: All reports include contact name, score, risk category, date
- **Colors**: Babson Green (#006644), Gold (#C9A84C), Navy (#0a0e1a)
- **Format**: 8.5" × 11" (Letter size), 40px margins

## Troubleshooting

### Report not being generated
- Check that quiz answers (q1–q4) are being sent from the quiz
- Verify SENDGRID_API_KEY is set in Netlify
- Check function logs in Netlify dashboard

### Email not being sent
- Verify SendGrid API key is correct
- Check that email address is valid
- Check SendGrid usage/limits
- Look at function logs for errors

### PDF looks wrong
- Verify fonts are embedded correctly (PDFKit includes them)
- Check that color codes are correct
- Ensure margin/padding values match spec

## Updating the Report Template

To modify the report content:
1. Edit `netlify/functions/quiz-submission.js` → `generatePDFBuffer()` function
2. Sections are divided by risk category (laggard, experimenter, modern)
3. Test locally with `netlify dev` before deploying

## Analytics / Tracking

The function sends a summary email to scott.magnacca1@gmail.com with:
- Contact name & email
- Quiz score & risk category
- Timestamp

This can be used to track quiz completion and report delivery rates.

## Future Enhancements

- [ ] Track open rates (via SendGrid webhooks)
- [ ] A/B test different email subject lines
- [ ] Add quiz answers to Google Sheets for further analysis
- [ ] Implement follow-up email sequences based on risk category
- [ ] Create video version of report (Remotion)
