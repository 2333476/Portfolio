// load environment variables from .env file into process.env
require("dotenv").config();

// import the app module
// this is the actual server
// it will listen to requests on a specific port and forward those requests to the app module
const app = require("./app");

// we define the port the server will listen on
// (process.env.PORT is used by hosting providers like Vercel to define the port)
// if process.env.PORT is not defined, we use port 3001
const PORT = process.env.PORT || 3001;

// start the server and listen on the defined port
// when the server starts, log a message to the console
// the app variable is an express application that handles requests
// we pass the app variable to the listen method to handle incoming requests
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on http://localhost:${PORT}`);
});
