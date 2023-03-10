const asyncHandler = require("express-async-handler");
const User = require('../Models/userModel');
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async(req,res)=>{
    
    const {name,email,password,pic} = req.body;
    if(!name || !email || !password){
        res.status(400);
        throw new Error("Please Enter all the required Fields");
    }
    const userExists = await User.findOne({email});

    if(userExists){
        res.status(400);
        throw new Error("User already exists");
    }
    const user = await User.create({
        name,email,password,pic
    });
    if(user){
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            pic:user.pic,
            token:generateToken(user._id)
        })
        console.log("user registered successfully");
    }else{
        res.status(400);
        console.log("Failed to create the user");
        throw new Error("Failed to create the user");
    }
});
const authUser = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(user && (await user.matchPassword(password))){
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            pic:user.pic,
            token:generateToken(user._id)
        })
        console.log("user validated " + user);
    }else{
        res.status(400);
        console.log("Invalid email or password");
        throw new Error("Invalid email or password");
    }
});

// /api/user?search=neha
const allUsers = asyncHandler(async(req,res)=>{
    const keyword = req.query.search ?{
        $or:[
            //options i means including both lower and upper case while finding pattern
            {name:{$regex:req.query.search,$options:"i"}},
            {email:{$regex:req.query.search,$options:"i"}}
        ]
    }:{}; //else do nothing
    // console.log(keyword);

    //we need to find user except the current one in the database with the searched name or email
   
    const users = await User.find(keyword).find({_id:{$ne:req.user._id}});
    res.send(users);
    console.log("users searched" + users);

});
module.exports={registerUser,authUser,allUsers};