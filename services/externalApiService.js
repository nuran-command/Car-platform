const axios = require('axios');

exports.getCarSpecs = async (brand, model, year) => {
  try {
    const loginRes = await axios.post('https://carapi.app/api/auth/login', {
      api_token: process.env.CAR_API_TOKEN,
      api_secret: process.env.CAR_API_SECRET
    });
    
    const jwt = loginRes.data;

    const searchRes = await axios.get('https://carapi.app/api/trims/v2', {
      params: { make: brand, model: model, year: year },
      headers: { 'Authorization': `Bearer ${jwt}` }
    });

    const basicData = searchRes.data.data?.[0];
    if (!basicData) {
      console.log(`No results found for ${year} ${brand} ${model}`);
      return {};
    }

    const detailRes = await axios.get(`https://carapi.app/api/trims/v2/${basicData.id}`, {
      headers: { 'Authorization': `Bearer ${jwt}` }
    });

    const fullCar = detailRes.data;
    const engine = fullCar.engines?.[0] || {};

    return {
      engine_type: engine.engine_type || "N/A",
      fuel_type: engine.fuel_type || "N/A",
      horsepower_hp: engine.horsepower_hp || "N/A",
      transmission: engine.transmission || "N/A",
      drive_type: engine.drive_type || "N/A",
      trim: fullCar.trim || "Standard Edition"
    };

  } catch (err) {
    console.error("CarAPI v2 Error:", err.response?.data || err.message);
    return {};
  }
};