const express = require("express");
const router = express.Router();
const AppError = require("../AppError");
const {setEmailOptions, sendEmail}= require("../config/emailService");

router.post("/", async (req,res)=>{
    console.log(req.body);
    const {name, email, subject, message}= req.body;
    //console.log("Email:", email);
    const options= setEmailOptions(name, email,subject, message);
    sendEmail(options);
    res.json({ message: 'Email sent successfully!' });
    
})

module.exports = router;