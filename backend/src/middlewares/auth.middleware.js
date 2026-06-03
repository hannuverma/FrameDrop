const jwt = require("jsonwebtoken")

async function protect(req, res, next){
    try{
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({message: "Unauthorized"});
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();

    }catch(error){
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

module.exports = {protect}