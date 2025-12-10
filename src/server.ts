import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import connectDB from './db';
import User from './models/User';
import refreshRoute from "./routes/refresh";

import profileRoutes from './routes/profile';
import loginRoutes from './routes/login';
import regRoutes from './routes/register';
import publickey from './routes/publickey';
import conversations from './routes/conversations';
import messages from './routes/messages'; 
import send_message from './routes/send_message';
import users from './routes/users';
import fcmtoken from './routes/fcm_token';

import { initIO } from "./socket/socket";

const app = express();
const server = http.createServer(app);

const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get('/', async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({ users });
  } catch (error) {
    console.error('Kullanıcıları listeleme hatası:', error);
    res.status(500).json({ message: 'Sunucu tarafında bir hata oluştu.' });
  }
});

// --- ROUTES ---
app.use('/api/auth/login', loginRoutes);
app.use('/api/auth/register', regRoutes);
app.use('/api/user', profileRoutes);
app.use('/api', publickey);
app.use('/api', conversations);
app.use('/api/', messages);
app.use('/api/', send_message);
app.use('/api/',users);
app.use("/api/", refreshRoute);
app.use("/api/", fcmtoken);

initIO(server);

server.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});