const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    const { section, payload } = JSON.parse(event.body);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"AvalonFlow" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: `New Submission – ${section}`,
      html: `
        <h2>${section}</h2>
        <pre>${JSON.stringify(payload, null, 2)}</pre>
      `
    });

    return {
      statusCode: 200,
      body: "Sent"
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: err.toString()
    };
  }
};
