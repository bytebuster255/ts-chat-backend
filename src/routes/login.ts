import { Router, Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { createAccesToken, createToken } from '../utils/jwt';
import Message from '../models/Message';
import mongoose from 'mongoose';


const router = Router();
const systemUserId = new mongoose.Types.ObjectId("64a4f0c4e5b1a2c3d4e5f678");
router.post('/', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'missing param.' });
        }

        const user = await User.findOne({ email }) as IUser | null;
        if (!user) {
            return res.status(401).json({ message: 'email or password wrong.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'email or password wrong.' });
        }

        const accessToken = createAccesToken((user._id as string | { toString(): string }).toString());
        const refreshToken = createToken((user._id as string | { toString(): string }).toString());
        res.status(200).json({
            accessToken: accessToken,
            refreshToken:refreshToken,
            user: { id: user._id, username: user.username, rsa_private: user.rsa_private }
        });

    } catch (error) {
        console.error('login error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
