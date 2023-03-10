const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../Models/userModel");

const protect = asyncHandler(async(req,res,next)=>{
    let token;
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ){
        try{
            token = req.headers.authorization.split(" ")[1];
            //decodes token id
            const decoded = jwt.verify(token,process.env.JWT_SECRET);

            //store it in req.user without a password
            req.user = await User.findById(decoded.id).select("-password");
            console.log(token);
            next();
        }catch(error){
            res.status(401);
            console.log("error in generating token");
            throw new Error("Not authorized , token failed");
        }    
    }
    if(!token){
        res.status(401);
        console.log("error in generating token, failed")
        throw new Error("Not authorized , token failed");
    }
})

module.exports = protect;