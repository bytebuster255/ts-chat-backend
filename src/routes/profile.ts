import { Router, Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/profile/:username', verifyToken, async (req: Request, res: Response) => {
    try {
        const username = req.params.username;

        if (!username) {
            return res.status(400).json({ message: 'Missing param.' });
        }

        if (username.length > 9) {
            return res.status(400).json({ message: 'Username too long.' });
        }

        const user = await User.findOne({ username }).select('-password') as IUser | null;

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            biography: user.biography || '',
            avatar: user.avatar || '',
            rsa_public: user.rsa_public || '',
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});
router.get("/profile", verifyToken, async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.id).select('-password -rsa_private -recoveryRsa') as IUser | null;

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                avatar: user.avatar || '',
                biography: user.biography || '',
                rsa_public: user.rsa_public || '',
            }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});
router.patch('/profile', verifyToken, async (req: Request, res: Response) => {
    try {


        const updates = req.body;
        const allowedUpdates = ["biography"];
        const fields = Object.keys(updates);
        const isValid = fields.every((field) => allowedUpdates.includes(field));
        if (!isValid) {
            return res.status(400).json({ message: "Invalid field(s) submitted." });
        }
        const user = await User.findByIdAndUpdate(
            req.user?.id,
            { $set: updates },
            { new: true }
        );
        res.json(user);


    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});


export default router;
