const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/mydatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true 
})
.then(() => {
    console.log("Connected to mongodb");
})
.catch((err) => {
    console.error("Failed to connect to mongodb", err);
});

// Set ejs as the template engine
app.set("view engine", "ejs");

const viewsPath = path.join(__dirname, "views");
app.set("views", viewsPath);

// Print the view path on console
console.log(`Views path set to: ${viewsPath}`);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
const indexRouter = require("./routes/index");
app.use("/", indexRouter);

// Start the server 
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
