import { Router, Request, Response } from 'express';
import User from '../models/User';
import { verifyToken } from '../middleware/auth';
import Call from '../models/Call';
const router = Router();

// GET /api/users/search?query=sefa
router.get('/users/search', verifyToken, async (req: any, res: Response) => {
    try {
        const keyword = req.query.query as string;
        const currentUserId = req.user.id; 

        if (!keyword) {
            return res.status(400).json({ message: "Arama metni gerekli." });
        }

        const users = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, 
                {
                    $or: [ 
                        { username: { $regex: keyword, $options: "i" } },
                    ]
                }
            ]
        })
            .select("-password -rsa_private -recoveryRsa") 
            .limit(10);

        res.json(users);

    } catch (error) {
        console.error("Arama hatası:", error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
});





router.get('/users/calls', verifyToken, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;

        const calls = await Call.find({
            $or: [{ caller: userId }, { receiver: userId }]
        })
            .populate('caller', 'username avatar')   
            .populate('receiver', 'username avatar') 
            .sort({ createdAt: -1 }) 
            .limit(50); 

        res.status(200).json(calls);
    } catch (error) {
        console.error("Arama geçmişi hatası:", error);
        res.status(500).json({ message: "Arama geçmişi alınamadı" });
    }
});
router.get('/users/call/:callId', verifyToken, async (req: any, res: Response) => {
    console.log("Fetching call with ID:", req.params.callId);
    try {
        const call = await Call.findById(req.params.callId);
        if (!call) return res.status(404).json({ message: "Arama bulunamadı" });
        res.json(call);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

router.post('/users/call/reject', verifyToken, async (req: any, res: Response) => {
    try {
        const { callId, to } = req.body;    
        const userId = req.user.id;     

        console.log(`⛔ API üzerinden Reddedildi: ${userId} -> ${to}`);

        if (callId) {
            await Call.findByIdAndUpdate(callId, {
                status: 'rejected',
                duration: 0
            });
        }

        const io = require('../socket/socket').getIO();
        io.to(to).emit("call_rejected", { from: userId });

        res.status(200).json({ message: "Arama reddedildi" });
    } catch (error) {
        console.error("Reddetme hatası:", error);
        res.status(500).json({ error: error });
    }
});







export default router;