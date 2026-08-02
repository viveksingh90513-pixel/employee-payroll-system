/**
 * PayRoll Pro – Email Configuration
 * Nodemailer transporter with reusable HTML email templates.
 */

const nodemailer = require('nodemailer');

/**
 * Create the Nodemailer transporter using SMTP credentials from .env
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  // Increase timeout for slow SMTP servers
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

/**
 * Verify the transporter connection on startup.
 * Logs a warning instead of crashing if email is not configured.
 */
const verifyEmailConnection = async () => {
  try {
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
      console.warn('⚠️  Email not configured. Update EMAIL_USER and EMAIL_PASSWORD in .env');
      return false;
    }
    await transporter.verify();
    console.log('✅ Email transporter is ready');
    return true;
  } catch (error) {
    console.warn('⚠️  Email transporter verification failed:', error.message);
    console.warn('   Email notifications will not work until SMTP is configured.');
    return false;
  }
};

/**
 * Base HTML email template with professional styling.
 * @param {string} title - Email subject/title
 * @param {string} body - HTML body content
 * @returns {string} Complete HTML email
 */
const emailTemplate = (title, body) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; }
    .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 5px; }
    .body { padding: 30px; color: #374151; line-height: 1.7; }
    .body h2 { color: #1f2937; font-size: 20px; margin-bottom: 15px; }
    .body p { margin-bottom: 12px; font-size: 15px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 10px 15px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .info-table td:first-child { font-weight: 600; color: #4b5563; width: 40%; background: #f9fafb; }
    .btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 15px 0; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #9ca3af; font-size: 12px; }
    .highlight { background: #eef2ff; border-left: 4px solid #6366f1; padding: 15px; border-radius: 0 8px 8px 0; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💼 PayRoll Pro</h1>
      <p>Employee Payroll Management System</p>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      <p>${process.env.COMPANY_NAME || 'PayRoll Pro Pvt. Ltd.'}</p>
      <p>${process.env.COMPANY_ADDRESS || ''}</p>
      <p style="margin-top: 10px;">This is an automated email. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Email template definitions for various notification types.
 */
const emailTemplates = {
  /**
   * Welcome email for newly created employees.
   */
  welcome: (employeeName, email, tempPassword) => ({
    subject: 'Welcome to PayRoll Pro – Your Account Has Been Created',
    html: emailTemplate('Welcome', `
      <h2>Welcome aboard, ${employeeName}! 🎉</h2>
      <p>Your employee account has been created on PayRoll Pro. Here are your login credentials:</p>
      <table class="info-table">
        <tr><td>Email</td><td>${email}</td></tr>
        <tr><td>Temporary Password</td><td><strong>${tempPassword}</strong></td></tr>
        <tr><td>Portal URL</td><td><a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a></td></tr>
      </table>
      <div class="highlight">
        <p>⚠️ <strong>Important:</strong> Please change your password after your first login for security.</p>
      </div>
      <a href="${process.env.CLIENT_URL}/login" class="btn">Login to PayRoll Pro</a>
    `),
  }),

  /**
   * Payslip notification email with optional PDF attachment.
   */
  payslip: (employeeName, month, year, netPay) => ({
    subject: `PayRoll Pro – Payslip for ${month}/${year}`,
    html: emailTemplate('Payslip Generated', `
      <h2>Hi ${employeeName},</h2>
      <p>Your payslip for <strong>${month}/${year}</strong> has been generated.</p>
      <table class="info-table">
        <tr><td>Pay Period</td><td>${month}/${year}</td></tr>
        <tr><td>Net Pay</td><td><strong>₹${Number(netPay).toLocaleString('en-IN')}</strong></td></tr>
      </table>
      <p>You can download your detailed payslip from the PayRoll Pro portal.</p>
      <a href="${process.env.CLIENT_URL}/payroll" class="btn">View Payslip</a>
    `),
  }),

  /**
   * Leave status update notification (approved/rejected).
   */
  leaveStatus: (employeeName, leaveType, startDate, endDate, status, remarks) => ({
    subject: `PayRoll Pro – Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html: emailTemplate('Leave Update', `
      <h2>Hi ${employeeName},</h2>
      <p>Your leave request has been <strong style="color: ${status === 'approved' ? '#10b981' : '#ef4444'}">${status.toUpperCase()}</strong>.</p>
      <table class="info-table">
        <tr><td>Leave Type</td><td>${leaveType}</td></tr>
        <tr><td>From</td><td>${startDate}</td></tr>
        <tr><td>To</td><td>${endDate}</td></tr>
        <tr><td>Status</td><td><strong>${status.toUpperCase()}</strong></td></tr>
        ${remarks ? `<tr><td>Remarks</td><td>${remarks}</td></tr>` : ''}
      </table>
      <a href="${process.env.CLIENT_URL}/leaves" class="btn">View Leave Details</a>
    `),
  }),

  /**
   * Password reset email with a one-time reset link.
   */
  passwordReset: (employeeName, resetToken) => ({
    subject: 'PayRoll Pro – Password Reset Request',
    html: emailTemplate('Password Reset', `
      <h2>Hi ${employeeName},</h2>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      <a href="${process.env.CLIENT_URL}/reset-password?token=${resetToken}" class="btn">Reset Password</a>
      <div class="highlight">
        <p>⚠️ This link will expire in <strong>1 hour</strong>. If you didn't request this, please ignore this email.</p>
      </div>
      <p style="font-size: 13px; color: #9ca3af;">If the button doesn't work, copy and paste this URL into your browser:<br>${process.env.CLIENT_URL}/reset-password?token=${resetToken}</p>
    `),
  }),
};

module.exports = { transporter, verifyEmailConnection, emailTemplates };
