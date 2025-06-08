// Description: This module handles sending emails using Nodemailer.
const nodemailer= require('nodemailer');

let transporter= nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// The 'from' field must be your authenticated email to prevent spoofing;
// user’s email goes in 'replyTo' so replies go to them directly.
function setEmailOptions(nameGiven, emailgiven, subjectGiven, textGiven){

    const mailOptions={
        from: `"Whisker Haven" <${process.env.EMAIL_USER}>`,  // your verified sender email (your SMTP user)
        to: process.env.EMAIL_USER,
        subject: subjectGiven,
        text: `From: ${nameGiven} <${emailgiven}>\n\n${textGiven}`,  // include user info inside the message
        replyTo: emailgiven 
    }
    return mailOptions;
}

function sendEmail(mailOptions){
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = {
    sendEmail,
    setEmailOptions
};