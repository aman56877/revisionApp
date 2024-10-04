const mongoose = require('mongoose');


const revisionSchema = new mongoose.Schema({
    deviceID:{
        type:String,
        required:true,
    },
    pagesRead:{
        type:Number,
        required:true,
    },
    fromPageToPage:{
        type:String,
        required:true,
    },
    difficulty:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    token:{
        type:String,
        required:true,
    },
    reminder:{
        type:String,
        required:true,
    },
},
    {
        timestamps:true,
    }
);


const revisionModel = mongoose.model('revision', revisionSchema);

module.exports = revisionModel;

