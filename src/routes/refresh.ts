import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { createAccesToken } from "../utils/jwt"; 

const router = Router();

const REFRESH_SECRET = process.env.REFRESH_SECRET as any; 

router.post("/refresh", async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: "missing refreshToken" });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        } catch (err) {
            console.log("Refresh token verify failed:", err);
            return res.status(401).json({ message: "invalid refresh token" });
        }

        const userId = decoded.id || decoded.userId;

        if (!userId) {
            console.error("Token payload hatası: ID bulunamadı", decoded);
            return res.status(401).json({ message: "invalid token payload" });
        }

        const newAccessToken = createAccesToken(userId);
        return res.status(200).json({
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error("Refresh Route Error:", error);
        return res.status(500).json({ message: "Server error during refresh" });
    }
});

export default router;