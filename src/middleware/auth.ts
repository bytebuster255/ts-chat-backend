import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET_ACCESS = process.env.JWT_SECRET_ACCESS as any;

interface JwtPayload {
    id: string;
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: JwtPayload;
    }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'Token missing.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token missing.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET_ACCESS) as JwtPayload;
        req.user = decoded; 
        next();
    } catch (error: any) {
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }

        console.error('Token verification failed:', error.message);
        
        return res.status(403).json({ message: 'Token not valid.' });
    }
};