    import { Router, Request, Response } from "express";
    import User from "../models/User"; 
    import { verifyToken } from "../middleware/auth"; 

    const router = Router();

    router.post("/fcm-token", verifyToken, async (req: Request, res: Response) => {
        try {
            const { fcmToken } = req.body;
            const userId = (req as any).user.id;

            if (
                !fcmToken ||                        
                typeof fcmToken !== 'string' ||     
                fcmToken.trim() === ''              
            ) {
                return res.status(400).json({ message: "Geçersiz FCM Token formatı" });
            }

            await User.findByIdAndUpdate(userId, {
                $addToSet: { fcmTokens: fcmToken }
            });

            console.log(`✅ FCM Token eklendi. User: ${userId}`);
            return res.status(200).json({ message: "FCM Token saved successfully" });

        } catch (error) {
            console.error("FCM Token Add Error:", error);
            return res.status(500).json({ message: "Server error adding token" });
        }
    });


    router.post("/remove-fcm-token", verifyToken, async (req: Request, res: Response) => {
        try {
            const { fcmToken } = req.body;
            const userId = (req as any).user.id;

            if (!fcmToken) {
                return res.status(400).json({ message: "fcmToken is missing" });
            }

            await User.findByIdAndUpdate(userId, {
                $pull: { fcmTokens: fcmToken }
            });

            console.log(`🗑️ FCM Token silindi. User: ${userId}`);

            return res.status(200).json({ message: "FCM Token removed successfully" });

        } catch (error) {
            console.error("FCM Token Remove Error:", error);
            return res.status(500).json({ message: "Server error removing token" });
        }
    });

    export default router;