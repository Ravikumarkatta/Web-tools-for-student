// Load environment variables from the project root
require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');

console.log({
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_DEFAULT_RECIPIENT: process.env.EMAIL_DEFAULT_RECIPIENT,
});

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: process.env.EMAIL_DEFAULT_RECIPIENT,
  subject: 'Test Email',
  text: 'Hello, this is a test email from Node.js!',
}, (error, info) => {
  if (error) {
    return console.error('Test email error:', error);
  }
  console.log('Test email sent:', info.response);
});
