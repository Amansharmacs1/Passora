import emailjs from '@emailjs/nodejs';

const sendEmail = async (options) => {
  try {
    const templateParams = {
      to_email: options.email,
      email_subject: options.subject,
      // Matches the {{{email_body}}} tag in your EmailJS template
      email_body: options.html || options.message, 
    };

    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );

    console.log('EmailJS Response:', response.status, response.text);
  } catch (error) {
    console.error('Error sending email via EmailJS: ', error);
  }
};

export default sendEmail;
