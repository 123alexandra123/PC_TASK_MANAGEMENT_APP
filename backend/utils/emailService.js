const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Poate fi parola aplicației dacă ai 2FA activ
  }
});

/**
 * Trimite o notificare prin email pentru un task nou
 * 
 * @param {string} to - Adresa de email a destinatarului
 * @param {string} subject - Subiectul emailului
 * @param {string} htmlContent - Conținutul HTML al emailului
 */
const sendTaskNotification = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `"Task App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    });
    console.log(' Email trimis cu succes catre', to);
  } catch (error) {
    console.error(' Eroare trimitere email:', error);
  }
};

module.exports = { sendTaskNotification };
