const { Joi, celebrate } = require("celebrate");
const validator = require("validator");

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error("string.uri");
};

module.exports.validateCardBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": `The minimum length of the "name" field is 2`,
      "string.max": `The maximum length of the "name" field is 30`,
      "string.empty": `The "name" field must be filled in`,
    }),
    imageUrl: Joi.string().required().custom(validateURL).messages({
      "string.empty": `The "imageUrl" field must be filled in`,
      "string.uri": `The "imageUrl" field must be a valid url`,
    }),
    weather: Joi.string().required().valid("hot", "cold", "warm").messages({
      "any.required": `The "weather" field must be filled in`,
      "any.only": `The "weather" field must be one of the available choices`,
    }),
  }),
});

module.exports.validateCreateUserInfoBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": `The minimum length of the "name" field is 2`,
      "string.max": `The maximum length of the "name" field is 30`,
      "string.empty": `The "name" field must be filled in`,
    }),
    avatar: Joi.string().required().custom(validateURL).messages({
      "string.empty": `The "avatar" field must be filled in`,
      "string.uri": `The "avatar" field must be a valid url`,
    }),
    email: Joi.string().required().email().messages({
      "string.empty": `The "email" field must be filled in`,
      "string.email": `A valid email must be entered`,
    }),
    password: Joi.string().required().messages({
      "string.empty": `The "password" field must be filled in`,
    }),
  }),
});

module.exports.validateLogInUserInfoBody = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email().messages({
      "string.empty": `The "email" field must be filled in`,
      "string.email": `A valid email must be entered`,
    }),
    password: Joi.string().required().messages({
      "string.empty": `The "password" field must be filled in`,
    }),
  }),
});

module.exports.validateId = celebrate({
  params: Joi.object().keys({
    itemId: Joi.string().hex().length(24).messages({
      "string.hex": `ID must be a hexidecimal value`,
      "string.length": `ID must be 24 characters long`,
    }),
  }),
});
