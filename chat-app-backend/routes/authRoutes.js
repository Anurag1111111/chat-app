import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post("/register", async(req, res)=>{
    const {username, email, password} = req.body;

    try{
        const existing = await User.findOne({email});
        if (existing) return res.status(400).json({"message": "Email is already registered"});

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username, 
            email,
            password : hashedPassword
        });

        const token = jwt.sign({id : user._id}, process.env.JWT_SECRET, {expiresIn: "7d"});

        res.status(201).json({user : {_id : user._id, username : user.username}, token});
    }
    catch(err){
        res.status(500).json({message: "Server Error"});
    }
})

router.post("/login", async(req, res)=>{
    const {email, password}  = req.body;

    try{
        const user = await User.findOne({email});
        if (!user) return res.status(400).json({message : "User not found"});

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({message: "Invalid credentials"});

        const token = jwt.sign({id : user._id}, process.env.JWT_SECRET, {expiresIn : "7d"});

        res.json({user : {_id : user._id, username: user.username}, token});
    }
    catch(err){
        res.status(500).json({message : "Server Error"});
    }
})

export default router;