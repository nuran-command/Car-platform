const Car = require('../models/Car');
const { getCarSpecs } = require('../services/externalApiService');

exports.createCar = async (req, res) => {
    try {
      const { brand, model, year, imageUrl, isFeatured } = req.body;
  
      let apiSpecs = {};
      try {
          apiSpecs = await getCarSpecs(brand.trim(), model.trim(), year);
          console.log("Specs Found:", apiSpecs); 
      } catch (apiError) {
          console.log("External API failed...");
      }
  
      const car = await Car.create({
        ...req.body,
        owner: req.user.id,           
        specs: apiSpecs || {}, 
        imageUrl: imageUrl || "",
        isFeatured: isFeatured || false
      });
  
      res.status(201).json(car);
    } catch (error) {
      res.status(500).json({ message: "Failed to create car", error: error.message });
    }
};

exports.getCars = async (req, res) => {
    try {
        const { featured, brand, condition, maxPrice, owner } = req.query; 
        let queryObj = {};
        
        if (featured === 'true') queryObj.isFeatured = true;
        if (brand) queryObj.brand = { $regex: brand, $options: 'i' };
        if (condition) queryObj.condition = condition;
        if (maxPrice) queryObj.price = { $lte: Number(maxPrice) };

        if (owner) {
            queryObj.owner = owner;
        }
  
        const cars = await Car.find(queryObj).sort({ createdAt: -1 });
        res.json(cars);
    } catch (error) {
        res.status(500).json({ message: "Error fetching cars" });
    }
};

exports.getCarById = async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) {
    res.status(404);
    throw new Error('Car not found');
  }
  res.json(car);
};

exports.updateCar = async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    res.status(404);
    throw new Error('Car not found');
  }

  if (car.owner.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(updatedCar);
};

exports.deleteCar = async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    res.status(404);
    throw new Error('Car not found');
  }

  if (car.owner.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await car.deleteOne();
  res.json({ message: 'Car removed from showroom' });
};