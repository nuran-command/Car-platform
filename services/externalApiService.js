const axios = require('axios');

exports.getCarSpecs = async (brand, model, year) => {
  try {
    const response = await axios.get(`https://carapi.app/api/trims`, {
      params: {
        make: brand,
        model: model,
        year: year, 
        verbose: 'yes' 
      },
      headers: {
        'Authorization': `Bearer ${process.env.CAR_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data[0];
    }
    
    return {};
  } catch (err) {
    console.error("External API Error:", err.message);
    return {}; 
  }
};