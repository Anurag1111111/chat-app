import express from 'express';
import protect from '../middleware/authMiddleware.js';
import Message from '../models/Message.js';

const router = express.Router();

router.get("/:userId", protect, async(req, res)=>{
    try{
        const messages = await Message.find({
            $or: [
                {sender : req.user._id, receiver : req.params.userId},
                {sender : req.params.userId, receiver : req.user._id}
            ]
        }).sort({createdAt : 1});
        res.json(messages)
    }
    catch(err){
        res.status(500).json({message : "Error fetching messages"})
    }
})

export default router;