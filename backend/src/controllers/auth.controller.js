const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")


async function registerUser(req, res){
    const{username, email, password, role = "user"} = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or: [
            {username},
            {email}
        ]
    })
    if(isUserAlreadyExists){
        return res.status(409).json({message: "User already exists"})
    }

    const hash = await bcrypt.hash(password, 10)


    const user = await userModel.create({
        username,
        email,
        password : hash,
        role
    });

    const token = jwt.sign({
        id: user._id,
        role: user.role,
    },  process.env.JWT_SECRET)

    res.cookie("token", token)


    return res.status(201).json({message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
}

async function loginUser(req, res){
    const {email , username, password } = req.body;

    if((!email && !username )|| !password ){
        return res.status(400).json({message: "Email and password are required"})
    }

    const user = await userModel.findOne({
        $or: [
            {email},
            {username}
        ]
    })

    if(!user){
        return res.status(404).json({message: "User not found"})
    }

    const isPasswordValid = await bcrypt.compare(password, user. password)

    if(!isPasswordValid){
        return res.status(401).json({message: "Invalid password"})
    }
    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET)

    res.cookie("token", token)

    return res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    })
}

module.exports = {registerUser, loginUser}