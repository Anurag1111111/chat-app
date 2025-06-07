import express from 'express';
import protect from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

router.get("/", protect, async (req, res) =>{
    try{
        const users = await User.find({_id : {$ne : req.user._id}}).select("-password");
        res.json(users)
    }catch(err){
        res.status(500).json({message : "Error fetching users"});
    }
})

export default router;