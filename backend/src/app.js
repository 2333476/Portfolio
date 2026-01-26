//import express module
const express = require("express");

//create an express application
//IT IS NOT A SERVER(just a machine that will respond to requests)
const app = express();
//global middleware to read json bodies(POST/PUT requests)
app.use(express.json());

//simple route to test if the server is running
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
