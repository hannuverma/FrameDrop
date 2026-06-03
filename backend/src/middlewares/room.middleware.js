const roomModel = require("../models/room.model")
const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")

async function isMember(req, res, next) {
    try {
        const roomId = req.body.roomId;
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({message:"Unauthorized"})
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decodedToken.id)
        const room = await roomModel.findById(roomId)

        if(!room){
            return res.status(404).json({message:"Room not found"})
        }

        if(!user.rooms.includes(roomId)){
            return res.status(403).json({message:"User is not a member of this room"})
        }

        req.room = room;
        next()
    } catch (error) {
        console.error("Error in isMember middleware", error)
        res.status(500).json({message:"Internal server error"})
    }
}

async function isAdmin(req, res, next){
    try{
        const roomId = req.body.roomId;
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({message:"Unauthorized"})
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decodedToken.id)
        const room = await roomModel.findById(roomId)

        if(!room){
            return res.status(404).json({message:"Room not found"})
        }

        if(!user.rooms.includes(roomId)){
            return res.status(403).json({message:"User is not a member of this room"})
        }

        if(!room.admins.includes(user._id)){
            return res.status(403).json({message:"User is not an admin of this room"})
        }

        req.room = room;
        next()
    } catch (error) {
        console.error("Error in isAdmin middleware", error)
        res.status(500).json({message:"Internal server error"})
    }
}

async function isOwner(req, res, next){
    try{
        const roomId = req.body.roomId;
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({message:"Unauthorized"})
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decodedToken.id)
        const room = await roomModel.findById(roomId)

        if(!room){
            return res.status(404).json({message:"Room not found"})
        }

        if(!user.rooms.includes(roomId)){
            return res.status(403).json({message:"User is not a member of this room"})
        }

        if(room.owner !== user._id){
            return res.status(403).json({message:"User is not an owner of this room"})
        }

        req.room = room;
        next()
    } catch (error) {
        console.error("Error in isOwner middleware", error)
        res.status(500).json({message:"Internal server error"})
    }
}

module.exports = {isMember, isAdmin, isOwner}