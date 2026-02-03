const Joi = require('joi');

exports.carSchema = Joi.object({
  brand: Joi.string().required(),
  model: Joi.string().required(),
  year: Joi.number().integer().min(1886).max(new Date().getFullYear() + 1).required(),
  price: Joi.number().positive().required(),
  condition: Joi.string().valid('New', 'Used').optional(),
  description: Joi.string().allow('', null).optional(),
  imageUrl: Joi.string().allow('', null).optional(),
  specs: Joi.object().optional(),
  isFeatured: Joi.boolean().optional()
});