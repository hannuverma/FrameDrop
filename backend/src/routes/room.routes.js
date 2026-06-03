const roomController = require("../controllers/room.controller")
const express = require("express")

const {protect} = require("../middlewares/auth.middleware")
const {isAdmin, isOwner} = require("../middlewares/room.middleware")
const {createRoom, joinRoom, removeMember, updateSettings, getRoomDetails, getAllUsersRooms, deleteRoom, makeAdmin, makeMember, health} = roomController
const router = express.Router()

router.post("/create", protect, createRoom);
router.post("/join", protect, joinRoom);
router.post("/remove-member", protect, isAdmin, removeMember);
router.post("/update-settings", protect, isAdmin, updateSettings);
router.get("/get-users-rooms", protect, getAllUsersRooms)
router.get("/get-room-details/:roomId", protect, getRoomDetails)
router.post("/delete-room", protect, isOwner, deleteRoom)
router.post("/make-admin", protect, isAdmin, makeAdmin)
router.post("/make-member", protect, isAdmin, makeMember)
router.get("/health", health)
module.exports = router

