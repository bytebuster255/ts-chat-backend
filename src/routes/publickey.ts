import { Router, Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/publickey/:username', verifyToken, async (req: Request, res: Response) => {
    try {
        const username = req.params.username;

        if (!username) {
            return res.status(400).json({ message: 'Missing param.' });
        }

        if (username.length > 9) {
            return res.status(400).json({ message: 'Username too long.' });
        }

        const user = await User.findOne({ username }).select('rsa_public') as IUser | null;

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            rsa_public: user.rsa_public
        });

    } catch (error) {

        res.status(500).json({ message: 'Server error.' });
    }
});


export default router;
