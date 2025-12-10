// routes/register.ts
import { Router, Request, Response } from "express";
import User from "../models/User";
import { createToken, createAccesToken } from "../utils/jwt";
import { generateKeyPairSync, randomBytes } from "crypto";
import { encryptPrivatePemWithPassword, encryptPrivatePemWithRecoveryKey, } from "../utils/cyrpto";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {

    if (!req.body) {
      return res.status(400).json({ message: "Missing request body." });
    }
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing required parameter.' });
    }
    if (username.length > 9) {
      return res.status(422).json({ message: 'Username is too long.' });
    }
    if (password.length > 100) {
      return res.status(422).json({ message: 'Password is too long.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "Email already exists." });
    const recoveryKey = randomBytes(32).toString("hex");
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    const byPassword = encryptPrivatePemWithPassword(privateKey, password);
    const byRecovery = encryptPrivatePemWithRecoveryKey(privateKey, recoveryKey);
    const newUser = new User({
      username,
      email,
      password,
      rsa_public: publicKey,
      rsa_private: byPassword,
      recoveryRsa: byRecovery,
    });
    await newUser.save();


    const refreshToken = createToken(newUser._id.toString());
    const accessToken = createAccesToken(newUser._id.toString());

    res.status(200).json({
      refreshToken: refreshToken,
      accessToken: accessToken,
      user: { id: newUser._id, username: newUser.username },
      recoveryKey,
    });
  } catch (error) {
    console.error("register error", error);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
