const roomModel = require("../models/room.model")
const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")


async function createRoom(req, res){
    try{
        const {name, description = " "} = req.body;

        const owner = req.user.id;

        if(!name){
            return res.status(400).json({message: "Room name is required"});
        }

        const newRoom = new roomModel({
            name,
            owner,
            description,
            members:[owner],
            admins:[owner]
       })

       await newRoom.save();

       await userModel.findByIdAndUpdate(owner, {
        $addToSet: {rooms: newRoom._id}
       })

       return res.status(201).json({
        message: "Room created successfully",
        room: newRoom
       })

        
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

async function joinRoom(req, res){
    try{
        const {id, password} = req.body;
        const userId = req.user.id;

        if(!id || !password){
            return res.status(400).json({message: "Room id and password are required"});
        }

        const room = await roomModel.findById(id);
        if(!room){
            return res.status(404).json({message: "Room not found"});
        }

        if(room.password !== password){
            return res.status(401).json({message: "Invalid password"});
        }

        if(room.members.includes(userId)){
            return res.status(400).json({message: "User is already a member of this room"});
        }

        await roomModel.updateOne(
            { _id: room._id },
            { $addToSet: { members: userId } }
        );

        await userModel.findByIdAndUpdate(userId, {
            $addToSet: { rooms: room._id }
        });

        return res.status(200).json({
            message: "Room joined successfully",
            room
        })

    }catch(error){
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

async function removeMember(req, res){
    try {
        const { roomId, userId } = req.body;
        const currentUser = req.user.id; 

        if (!roomId || !userId) {
            return res.status(400).json({ message: "Room id and user id are required" });
        }

        const room = await roomModel.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        const isAdmin = room.admins.some(adminId => adminId.toString() === currentUser);
        const isOwner = room.owner && room.owner.toString() === currentUser;

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to remove members from this room" });
        }

        if (userId === currentUser) {
            return res.status(400).json({ message: "You cannot remove yourself from the room" });
        }

        const isMember = room.members.some(memberId => memberId.toString() === userId);
        if (!isMember) {
            return res.status(400).json({ message: "User is not a member of this room" });
        }

        await roomModel.updateOne(
            { _id: room._id },
            { $pull: { members: userId } }
        );

        await userModel.findByIdAndUpdate(userId, {
            $pull: { rooms: room._id }
        });

        return res.status(200).json({
            message: "Member removed successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function updateSettings(req, res){
    try{
        const {roomId} = req.body;
        const { isUploadOpen, allowMembersToInvite, maxPhotosPerUser } = req.body;
        const requesterId = req.user.id;
        
        const room = await roomModel.findById(roomId);

        if(!room){
            return res.status(404).json({message: "Room not found"});
        }

        const isAdmin = room.admins.some(adminId => adminId.toString() === requesterId);
        const isOwner = room.owner && room.owner.toString() === requesterId;

        if(!isOwner && !isAdmin){
            return res.status(403).json({message: "You are not authorized to update settings for this room"});
        }

        if (isUploadOpen !== undefined) room.settings.isUploadOpen = isUploadOpen;
        if (allowMembersToInvite !== undefined) room.settings.allowMembersToInvite = allowMembersToInvite;
        if (maxPhotosPerUser !== undefined) room.settings.maxPhotosPerUser = maxPhotosPerUser;

        await room.save();

        return res.status(200).json({
            message: "Settings updated successfully",
            settings: room.settings
        });
        
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}


module.exports = {createRoom, joinRoom, removeMember, updateSettings}