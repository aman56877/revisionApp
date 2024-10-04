const mongoose = require("mongoose");

const mongoURL = process.env.MONGOURL;

const dbConnection = mongoose.connect(mongoURL)
    .then(()=>{
        console.log("Database connected");
    })
    .catch((error)=>{
        console.log(error);
    })


module.exports = dbConnection;