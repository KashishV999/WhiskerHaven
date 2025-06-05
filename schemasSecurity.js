// =============================================================================
// Server-Side Validation Schemas
// =============================================================================
// Name: Kashish Verma
// Technologies: Joi, Express.js, MongoDB
// Description: This file defines validation schemas for shelter and cat data using Joi.
// =============================================================================
const Joi = require('joi');

module.exports.ValidateShelterSchema = Joi.object({
  name: Joi.string().required().trim(),
  location: Joi.string().required().trim(),
  description: Joi.string().required().trim(),
  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be exactly 10 digits',
    }),
  email: Joi.string().email().required().trim()
    .messages({
      'string.email': 'Please enter a valid email address',
    }),
  image: Joi.string().trim().allow('').optional(),
  cats: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).default([]),
  hours: Joi.object().default({}), // flexible JSON object for hours
  mission: Joi.string().trim().allow('').default(''),
    lat: Joi.number().messages({
    'number.base': 'Latitude must be a number',
    'any.required': 'Latitude is required',
  }),
  lng: Joi.number().messages({
    'number.base': 'Longitude must be a number',
    'any.required': 'Longitude is required',
  }),
}).required();

module.exports.ValidateCatSchema = Joi.object({
  name: Joi.string().required().trim(), // string, required, trim
  breed: Joi.string().required().trim(), // string, required, trim
  age: Joi.number().required().min(0), // number, required, min 0
  color: Joi.string().required().trim(), // string, required, trim
  weight: Joi.number().required().min(0), // number, required, min 0
  gender: Joi.string().required().valid('Male', 'Female'),
  description: Joi.string().required().trim(), // string, required, trim
  image: Joi.string().trim().allow('').optional(),
  shelter: Joi.string(), // string, required, trim

  status: Joi.string().valid('Available', 'Pending', 'Adopted').default('Available'),
  arrival_date: Joi.date().default(() => new Date()),
  adoption_fee: Joi.number().min(0).default(0),

  spayed_neutered: Joi.boolean().default(false),
  vaccinated: Joi.boolean().default(false),
  microchipped: Joi.boolean().default(false),
  special_needs: Joi.boolean().default(false),
  house_trained: Joi.boolean().default(false),

  activity_level: Joi.string().valid('Low', 'Moderate', 'High').default('Moderate'),
  coat_length: Joi.string().valid('Short', 'Medium', 'Long').default('Short'),

  good_with_children: Joi.boolean().allow(null).default(null),
  good_with_cats: Joi.boolean().allow(null).default(null),
  good_with_dogs: Joi.boolean().allow(null).default(null),

  story: Joi.string().trim().allow('').default('')
}).required();