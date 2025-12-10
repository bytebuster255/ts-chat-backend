// src/utils/jwt.ts
import path from 'path'; 
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import jwt from "jsonwebtoken";

// ... geri kalan kodun aynı ...
const JWT_SECRET_REFRESH = process.env.JWT_SECRET_REFRESH as any;
const JWT_SECRET_ACCESS = process.env.JWT_SECRET_ACCESS as any;

if (!JWT_SECRET_REFRESH || !JWT_SECRET_ACCESS) {
    throw new Error("JWT_SECRET_REFRESH environment variable is not defined");
}

export const createToken = (userId: string) => {
    return jwt.sign({ id: userId }, JWT_SECRET_REFRESH, { expiresIn: "30d" });
};

export const createAccesToken = (userId: string) => {
    return jwt.sign({ id: userId }, JWT_SECRET_ACCESS, { expiresIn: "10m" });
};