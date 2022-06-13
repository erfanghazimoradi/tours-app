const { join } = require('path');
const nodemailer = require('nodemailer');
const { convert } = require('html-to-text');
const pug = require('pug');

class Email {
  constructor(user, url) {
    this.from = `Tours App ${process.env.EMAIL_FROM}`;
    this.to = user.email;
    this.firstname = user.firstname;
    this.url = url;
  }

  generateTransport() {
    if (process.env.NODE_ENV === 'production')
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME_PROD,
          pass: process.env.EMAIL_PASSWORD_PROD
        }
      });

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(subject, template) {
    // 1. create html from pug template

    console.log(this.firstname);
    const html = pug.renderFile(join(__dirname, '../views/emails', `${template}.pug`), {
      firstname: this.firstname,
      url: this.url,
      subject
    });

    // 2. email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html)
    };

    // 3. create transport and send email(nodemailer)
    await this.generateTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('Welcome to the Tours App Family!', 'welcome');
  }

  async sendResetPassword() {
    await this.send('Reset Your Password', 'resetPassword');
  }
}

// await sendEmail({
//   email,
//   subject: 'Tours App: Your password reset token (valid for 10 min)',
//   message: `Forgot your password? \nSubmit a PATCH request with your new password and passwordConfirm to: ${resetURL} \nIf you didn't forget your password, please ignore this email!`,
//   html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 1rem">
//   <h3>Hi username</h3>
//   <p>We got a request to reset your Tours App password.</p>
//   <a
//     href="${resetUrlClient}"
//     style="
//       text-decoration: none;
//       display: block;
//       width: 200px;
//       background-color: #44ad67;
//       padding: 1rem;
//       border-radius: 1rem;
//       color: #f9f9f9;
//       margin: 1rem 0;
//       text-align: center;
//     "
//     >Reset password</a
//   >
//   <p>
//     If you ignore this message, your password will not be change. If you didn't request a
//     password reset, ignore this message.
//   </p>
// </div>
// `
// });
module.exports = { Email };
