// load environment variables from .env file into process.env
require("dotenv").config();

// import the app module
const app = require("./app");

// we define the port the server will listen on
const PORT = process.env.PORT || 3001;

// start the server and listen on the defined port
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on http://localhost:${PORT}`);
});