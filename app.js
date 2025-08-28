const express = require("express");
const nodemailer = require("nodemailer");
const path = require('path');
const app = express();
require('dotenv').config();
const port = 5002;

const email = process.env.RECIPIENT_EMAIL; // Recipient email
const myemail = process.env.SENDER_EMAIL; // Sender email (e.g. Gmail)
const mypassword = process.env.APPLI_PASS; // Gmail app-specific password


// Middleware to parse JSON bodies with a larger size limit
app.use(express.json({ limit: '10mb' }));  // Increase the limit to 10MB
app.use(express.urlencoded({ limit: '10mb', extended: true })); // For form data if needed
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Function to send email using nodemailer
// function sendEmail(filePath) {
function sendEmail(base64Data, filename, contentType) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: myemail,
        pass: mypassword,
      },
    });

    const buffer = Buffer.from(base64Data, 'base64');

    // Email configuration
    const mail_configs = {
      from: myemail,
      to: email,
      subject: 'Your Generated NFC CD Keychain',
      text: 'Attached is the NFC CD Keychain you generated @Gadhouse.',
      attachments: [
        {
          filename: filename,       // ชื่อไฟล์ที่แนบ
          content: buffer,           // ใช้ Buffer เป็นเนื้อหาไฟล์
          encoding: "base64",        // ระบุว่าไฟล์นี้เป็น Base64
        },
      ],
    };

    // Sending email with nodemailer
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log({ error });
        return reject({ message: "An error has occurred while sending email." });
      }
      return resolve({ message: "Email sent successfully!" });
    });
  });
}

app.post("/sendEmail", (req, res) => {
  const { file, filename, contentType } = req.body;

  if (!file || !filename || !contentType) {
    return res.status(400).send("Missing required fields.");
  }

  // ส่งอีเมลพร้อมไฟล์ Base64
  sendEmail(file, filename, contentType)
    .then((response) => {
      res.send({ status: "success", message: response.message });
    })
    .catch((error) => {
      res.status(500).send({ status: "error", message: error.message });
    });
});

app.get("/test", (req, res) => {
  res.send('Hello Gadhouse!')
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

// Start the Express server
app.listen(port, () => {
  console.log(`nodemailerProject is listening at http://localhost:${port}`);
});
