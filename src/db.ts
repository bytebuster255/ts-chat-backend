import mongoose from 'mongoose';
const connectDB = async () => {
  try {
    const mongoURI = 'mongodb://localhost:27017/chat-app-db'; 
        await mongoose.connect(mongoURI);
    console.log('✅ MongoDB bağlantısı başarılı! Veritabanına bağlandık.');


  } catch (err) {
    console.error('❌ MongoDB bağlantı hatası:', err);
    console.error('Lütfen MongoDB sunucunuzun (mongod) çalıştığından emin olun.');
    process.exit(1);
  }
};

export default connectDB;