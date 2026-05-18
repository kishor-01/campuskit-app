import nodemailer from 'nodemailer';

// This creates the connection to Google
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Utility function to send an OTP
 * @param to - The user's email address
 * @param otp - The 6-digit code
 */
export const sendOTPEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: "Your Seniofy OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Verify your account</h2>
        <p>Your 6-digit code is below. It will expire in 10 minutes.</p>
        <div style="background: #f4f4f4; padding: 10px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center;">
          ${otp}
        </div>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};
