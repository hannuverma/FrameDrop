const roomModel = require("../models/room.model")
const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")

async function health(req, res){
    try{
        return res.status(200).json({
            status: "healthy"
        })
    }catch(error){
        console.error(error);
        return res.status(500).json({
            status: "unhealthy",
            message: "Internal server error"
        })
    }
}

async function createRoom(req, res){
    try{
        const {name, description = " ", password} = req.body;

        const owner = req.user.id;

        if(!name){
            return res.status(400).json({message: "Room name is required"});
        }
        const hash = await bcrypt.hash(password, 10)
        const newRoom = new roomModel({
            name,
            owner,
            description,
            password:hash,
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
        const isPasswordValid = await bcrypt.compare(password, room.password)
        if(!isPasswordValid){
            return res.status(401).json({message: "Invalid password"});
        }

        const isAlreadyMember = room.members.some(memberId => memberId.toString() === userId);
        if (isAlreadyMember) {
            return res.status(400).json({ message: "User is already a member of this room" });
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
        const { userId } = req.body;
        const currentUser = req.user.id; 

        if (!userId) {
            return res.status(400).json({ message: "Room id and user id are required" });
        }

        const room = req.room

        if (userId === currentUser) {
            return res.status(400).json({ message: "You cannot remove yourself from the room" });
        }

        if (room.owner.toString() === userId) {
            return res.status(403).json({ message: "You cannot remove the owner of the room" });
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
        const { isUploadOpen, allowMembersToInvite, maxPhotosPerUser } = req.body;
        
        const room = req.room

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


async function getRoomDetails(req, res){
    try{
        const { roomId } = req.params;
        const room = await roomModel.findById(roomId).populate('members', 'username email');
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        return res.status(200).json({
            room
        })
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

async function getAllUsersRooms(req, res){
    try{
        const userId = req.user.id;
        const rooms = await roomModel.find({members: userId});
        return res.status(200).json({
            rooms
        })
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

async function deleteRoom(req, res){
    try{
        const roomId = req.body.roomId;

        if(!roomId){
            return res.status(400).json({message: "Room id is required"});
        }

        const room = await roomModel.findByIdAndDelete(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        await userModel.updateMany(
            { rooms: roomId },
            { $pull: { rooms: roomId } }
        );
        
        return res.status(200).json({
            message: "Room deleted successfully"
        })
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

async function makeAdmin(req, res){
    try{
        const { userId } = req.body;
        const room = req.room;

        if(!userId){
            return res.status(400).json({message: "User id is required"});
        }

        if(room.admins.includes(userId)){
            return res.status(400).json({message: "User is already an admin"});
        }

        const isMember = room.members.some(memberId => memberId.toString() === userId);
        if (!isMember) {
            return res.status(400).json({ message: "User is not a member of this room" });
        }

        await roomModel.updateOne(
            { _id: room._id },
            { $addToSet: { admins: userId } }
        );

        return res.status(200).json({message: "User is now an admin"});
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

async function makeMember(req, res){
    try{
        const { userId } = req.body;
        const room = req.room;

        if(!userId){
            return res.status(400).json({message: "User id is required"});
        }

        if (room.owner.toString() === userId) {
            return res.status(403).json({ message: "Cannot demote the owner of the room" });
        }

        if(!room.admins.includes(userId)){
            return res.status(400).json({message: "User is not an admin"});
        }

        await roomModel.updateOne(
            { _id: room._id },
            { $pull: { admins: userId } }
        );

        return res.status(200).json({message: "Admin successfully demoted to member"});
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

module.exports = {createRoom, joinRoom, removeMember, updateSettings, getRoomDetails, getAllUsersRooms, deleteRoom, makeAdmin, makeMember, health}