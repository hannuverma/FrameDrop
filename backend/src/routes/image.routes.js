const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { isMember } = require("../middlewares/room.middleware");
const { upload } = require("../middlewares/multer.middleware");
const { uploadImage, getRoomImages, deleteImage } = require("../controllers/image.controller");

const router = express.Router();

router.post("/upload", protect, upload.single("image"), isMember, uploadImage);
router.get("/:roomId", protect, getRoomImages);
router.delete("/:imageId", protect, deleteImage);

module.exports = router;
