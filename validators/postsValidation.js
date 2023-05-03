const Joi = require("joi");

const postsSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string().required(),
});

module.exports = { postsSchema };
