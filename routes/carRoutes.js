const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); 
const validate = require('../middleware/validateMiddleware'); 
const { carSchema } = require('../validators/carValidator');
const {
  createCar,
  getCars,
  getCarById,
  updateCar,
  deleteCar
} = require('../controllers/carController');

router.post('/', auth, validate(carSchema), createCar);

router.get('/', getCars); 
router.get('/:id', getCarById);

router.put('/:id', auth, validate(carSchema), updateCar);
router.delete('/:id', auth, deleteCar);

module.exports = router;