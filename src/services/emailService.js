const nodemailer = require('nodemailer');

// Create a transporter using your email service credentials.
// For example, using Gmail:
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'kattaravi000@gmail.com',
    pass: process.env.EMAIL_PASS || '29060815'
  }
});

/**
 * Send a notification email.
 * @param {object} options - Email options.
 * @param {string} options.subject - Email subject.
 * @param {string} options.message - Email message body.
 * @param {string} [options.to] - Recipient email address. Defaults to EMAIL_DEFAULT_RECIPIENT.
 * @returns {Promise} Resolves when the email is sent.
 */
function sendNotificationEmail({ subject, message, to }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'kattaravi000@gmail.com',
    to: to || process.env.EMAIL_DEFAULT_RECIPIENT || 'kattaravi000@gmail.com',
    subject,
    text: message
  };

  return transporter.sendMail(mailOptions)
    .then(info => {
      console.log('Email sent:', info.response);
      return info;
    })
    .catch(err => {
      console.error('Error sending email:', err);
      throw err;
    });
}

module.exports = {
  sendNotificationEmail
};
