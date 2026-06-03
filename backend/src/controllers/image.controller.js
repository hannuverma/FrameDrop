const { v2: cloudinary } = require("cloudinary");
const imageModel = require("../models/image.model");
const roomModel = require("../models/room.model");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(req, res) {
    try {
        const { roomId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        if (!roomId) {
            return res.status(400).json({ message: "Room ID is required" });
        }

        const room = await roomModel.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Upload to cloudinary
        const b64 = Buffer.from(file.buffer).toString("base64");
        let dataURI = "data:" + file.mimetype + ";base64," + b64;
        
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: `framedrop/${roomId}`,
        });

        const newImage = new imageModel({
            url: result.secure_url,
            public_id: result.public_id,
            uploadedBy: req.user.id,
            room: roomId,
        });

        await newImage.save();

        return res.status(201).json({
            message: "Image uploaded successfully",
            image: newImage,
        });
    } catch (error) {
        console.error("Upload image error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getRoomImages(req, res) {
    try {
        const { roomId } = req.params;

        const images = await imageModel.find({ room: roomId })
            .populate("uploadedBy", "username email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            images,
        });
    } catch (error) {
        console.error("Get images error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function deleteImage(req, res) {
    try {
        const { imageId } = req.params;
        const userId = req.user.id;

        const image = await imageModel.findById(imageId).populate("room");
        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }

        const room = image.room;
        const isOwner = room.owner.toString() === userId;
        const isAdmin = room.admins.some(adminId => adminId.toString() === userId);
        const isUploader = image.uploadedBy.toString() === userId;

        if (!isOwner && !isAdmin && !isUploader) {
            return res.status(403).json({ message: "Unauthorized to delete this image" });
        }

        if (image.public_id) {
            await cloudinary.uploader.destroy(image.public_id);
        }

        await imageModel.findByIdAndDelete(imageId);

        return res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        console.error("Delete image error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    uploadImage,
    getRoomImages,
    deleteImage,
};
