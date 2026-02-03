const Joi = require('joi');

exports.carSchema = Joi.object({
  brand: Joi.string().required(),
  model: Joi.string().required(),
  year: Joi.number().integer().min(1886).max(new Date().getFullYear() + 1).required(),
  price: Joi.number().positive().required(),
  mileage: Joi.number().min(0).optional(),
  condition: Joi.string().valid('New', 'Used').optional(),
  status: Joi.string().valid('In Stock', 'Sold', 'Pending').optional(),
  color: Joi.string().optional(),
  description: Joi.string().optional(),
  imageUrl: Joi.string().allow('', null)
});