const mongoose = require("mongoose")

const imageSchema = new mongoose.Schema({
    url:{
        type: String,
        required: true,
    },

    public_id:{
        type:String,    
    },

    uploadedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"

    },

    room:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"room",
        required:true
    },

    createdAt:{
        type:Date,
        default:Date.now
    },


})

const imageModel = mongoose.model("image", imageSchema)

module.exports = imageModel