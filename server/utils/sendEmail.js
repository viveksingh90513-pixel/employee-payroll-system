/**
 * PayRoll Pro – Email Sending Utility
 * Wrapper around Nodemailer transporter for sending emails.
 */

const { transporter, emailTemplates } = require('../config/email');

/**
 * Send an email using the configured transporter.
 * Fails silently with a console warning if email is not configured.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body
 * @param {Array} attachments - Optional email attachments
 * @returns {Promise<boolean>} Whether the email was sent successfully
 */
const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    // Skip if email is not configured
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
      console.warn(`⚠️  Email not sent (not configured): ${subject} → ${to}`);
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `PayRoll Pro <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${subject} → ${to} (${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email: ${subject} → ${to}`, error.message);
    return false;
  }
};

/**
 * Send welcome email to a new employee.
 * @param {string} to - Employee email
 * @param {string} name - Employee name
 * @param {string} tempPassword - Temporary password
 */
const sendWelcomeEmail = async (to, name, tempPassword) => {
  const { subject, html } = emailTemplates.welcome(name, to, tempPassword);
  return sendEmail(to, subject, html);
};

/**
 * Send payslip notification email.
 * @param {string} to - Employee email
 * @param {string} name - Employee name
 * @param {number} month
 * @param {number} year
 * @param {number} netPay
 * @param {string} pdfPath - Optional path to payslip PDF for attachment
 */
const sendPayslipEmail = async (to, name, month, year, netPay, pdfPath = null) => {
  const { subject, html } = emailTemplates.payslip(name, month, year, netPay);
  const attachments = pdfPath ? [{ filename: `Payslip_${month}_${year}.pdf`, path: pdfPath }] : [];
  return sendEmail(to, subject, html, attachments);
};

/**
 * Send leave status update email.
 * @param {string} to - Employee email
 * @param {string} name - Employee name
 * @param {string} leaveType
 * @param {string} startDate
 * @param {string} endDate
 * @param {string} status - 'approved' or 'rejected'
 * @param {string} remarks - Admin remarks
 */
const sendLeaveStatusEmail = async (to, name, leaveType, startDate, endDate, status, remarks) => {
  const { subject, html } = emailTemplates.leaveStatus(name, leaveType, startDate, endDate, status, remarks);
  return sendEmail(to, subject, html);
};

/**
 * Send password reset email.
 * @param {string} to - User email
 * @param {string} name - User name
 * @param {string} resetToken
 */
const sendPasswordResetEmail = async (to, name, resetToken) => {
  const { subject, html } = emailTemplates.passwordReset(name, resetToken);
  return sendEmail(to, subject, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPayslipEmail,
  sendLeaveStatusEmail,
  sendPasswordResetEmail,
};
