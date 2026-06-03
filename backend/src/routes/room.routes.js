const roomController = require("../controllers/room.controller")
const express = require("express")

const router = express.Router()

router.post("/create", roomController.createRoom)
router.post("/join", roomController.joinRoom)
router.post("/remove-member", roomController.removeMember)
router.post("/update-settings", roomController.updateSettings)

module.exports = router

