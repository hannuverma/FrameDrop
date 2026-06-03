const mongoose = require("mongoose")


const roomSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,    
    },

    description:{
        type: String,
        required: false,
    },

    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },


    password:{
        type: String,
        required:true
    },

    admins:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    }],

    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    }],

    createdAt:{
        type: Date,
        default: Date.now
    },

    settings:{
        isUploadOpen:{
            type:Boolean,
            default: true
        },

        allowMembersToInvite:{
            type: Boolean,
            default: true
        },

        
    }
    
})

const roomModel = mongoose.model("room", roomSchema)

module.exports = roomModel