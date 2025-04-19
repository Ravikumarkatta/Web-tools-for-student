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

const { sendEmail } = require('../src/services/emailService');

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn((options, callback) => {
      callback(null, { response: 'Email sent successfully' });
    })
  })
}));

describe('Email Service - sendEmail', () => {
  test('should send email successfully', async () => {
    const emailOptions = {
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email.'
    };

    const result = await sendEmail(emailOptions);
    expect(result).toBe('Email sent successfully');
  });

  test('should throw an error if email sending fails', async () => {
    jest.mocked(require('nodemailer').createTransport).mockReturnValueOnce({
      sendMail: jest.fn((options, callback) => {
        callback(new Error('Failed to send email'));
      })
    });

    const emailOptions = {
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email.'
    };

    await expect(sendEmail(emailOptions)).rejects.toThrow('Failed to send email');
  });
});
