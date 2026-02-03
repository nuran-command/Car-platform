require('dotenv').config({ path: __dirname + '/.env' });
const connectDB = require('./config/db');
const app = require('./app');

connectDB();                       

const PORT = process.env.PORT || 5090;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});