import nodemailer from 'nodemailer'


async function sendOtpEmail(to, otp) {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          border: 1px solid #ddd;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #4caf50;
          color: white;
          text-align: center;
          padding: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .body {
          padding: 20px;
          color: #333;
        }
        .otp {
          font-size: 32px;
          font-weight: bold;
          color: #4caf50;
          text-align: center;
          margin: 20px 0;
        }
        .footer {
          background-color: #f4f4f4;
          text-align: center;
          padding: 15px;
          font-size: 12px;
          color: #666;
        }
        .footer a {
          color: #4caf50;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Verify Your Account</h1>
        </div>
        <div class="body">
          <p>Dear User,</p>
          <p>We received a request to verify your account. Use the OTP below to complete the verification process:</p>
          <div class="otp">${otp}</div>
          <p>Please note that this OTP is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>Need help? <a href="mailto:support@example.com">Contact Support</a></p>
          <p>&copy; ${new Date().getFullYear()} MERN CHAT. All Rights Reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    try {
        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: "gmail", // Use Gmail or another email service
            auth: {
                user: process.env.EMAIL_USER, // Replace with your email
                pass: process.env.EMAIL_PASS, // Replace with your email password or app password
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender email
            to, // Recipient email
            subject: "Your OTP for Verification",
            text: `Your OTP is ${otp}`, // Plain text fallback
            html: htmlContent, // HTML content
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log(`OTP email sent: ${info.messageId}`);
    } catch (error) {
        console.error("Error sending OTP email:", error.message);
    }
}

export default sendOtpEmail;
