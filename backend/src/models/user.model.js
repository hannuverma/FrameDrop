const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    username: {
        type : String,
        required: true,
        unique: true,
        trim:true
    },

    email:{
        type: String,
        required: true,
        unique:true,
        trim: true
    },

    about:{
        type: String,
        required: false,
    },

    profilePicture:{
        type: String,
        required: false
    },

    password:{
        type: String,
        required:false
    },

    rooms:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"room"
    }],

    createdAt:{
        type:Date,
        default:Date.now
    }
})

const userModel = mongoose.model("user", userSchema)

module.exports = userModel