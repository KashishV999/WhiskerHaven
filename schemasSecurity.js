const Joi = require('joi');
module.exports.ValidateShelterSchema= Joi.object({
     name:Joi.string().required().trim(), //string, required, trim
        location:Joi.string().required().trim(), //string, required, trim
        description:Joi.string().required().trim(), //string, required, trim
        phone:Joi.string().required().trim().pattern(/^\d{10}$/), //string, required, trim, regex for 10 digit phone number
        email:Joi.string().required().trim().email(), //string, required, trim, regex for email
        image:Joi.string().required().trim(), //string, required, trim
        cats:Joi.array().items(Joi.string()) //array of strings, required
}).required();

module.exports.ValidateCatSchema=Joi.object({
    name:Joi.string().required().trim(), //string, required, trim
    breed:Joi.string().required().trim(), //string, required, trim
    age:Joi.number().required().min(0), //number, required, min 0, max 20
    color:Joi.string().required().trim(), //string, required, trim
    weight:Joi.number().required().min(0), //number, required, min 0
    gender:Joi.string().required().valid('Male', 'Female'),
    description:Joi.string().required().trim(), //string, required, trim
    image:Joi.string().required(), //string, required, trim
    shelter:Joi.string(), //string, required, trim
}).required();
