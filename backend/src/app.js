const express = require("express");
const cookieParser = require("cookie-parser")

const authRoutes = require("./routes/auth.routes.js")
const rooomRoutes = require("./routes/room.routes.js")
const imageRoutes = require("./routes/image.routes.js")
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes)
app.use("/api/room", rooomRoutes)
app.use("/api/image", imageRoutes)

module.exports = app; 