import { Server, Socket } from "socket.io";
import Call, { ICall } from "../models/Call";
import User from "../models/User";
import admin from "../utils/firebase";

export default (io: Server, socket: Socket) => {

    const userId = socket.data.userId;

    socket.on("call_user", async (data) => {
        try {
            const callerInfo = await User.findById(userId).select("username avatar");
            if (!callerInfo) return;

            console.log(`📞 Arama Başladı: ${callerInfo.username} -> ${data.userToCall}`);
            console.log("Sinyal Verisi:", data.signalData);
            const newCall = await Call.create({
                caller: userId,
                receiver: data.userToCall,
                type: data.type || 'audio',
                status: 'missed',
                signalData: data.signalData 
            });
            console.log(`📞 Yeni Arama Kaydı Oluşturuldu: ${newCall._id}`);
            io.to(data.userToCall).emit("call_user", {
                from: userId,
                callId: newCall._id,
                callerName: callerInfo.username,
                callerAvatar: callerInfo.avatar || "",
                signal: data.signalData
            });

            const receiver = await User.findById(data.userToCall).select("fcmTokens");

            if (receiver && receiver.fcmTokens && receiver.fcmTokens.length > 0) {
                const messagePayload = {
                    android: { priority: 'high', ttl: 0 },
                    apns: {
                        payload: { aps: { contentAvailable: true } },
                        headers: { "apns-priority": "10" }
                    },
                    data: {
                        type: 'call',
                        callerName: callerInfo.username,
                        callerAvatar: callerInfo.avatar || "",
                        callId: ((newCall as any)?._id ? (newCall as any)._id.toString() : ""),
                        senderId: userId.toString(),
                        click_action: "FLUTTER_NOTIFICATION_CLICK",
                    },
                    tokens: receiver.fcmTokens
                };
                console.log(messagePayload.data);
                admin.messaging().sendEachForMulticast(messagePayload as any)
                    .catch(err => console.error("FCM Hatası:", err));
            }

        } catch (error) {
            console.error("Arama hatası:", error);
        }
    });

    socket.on("answer_call", async (data) => {
        try {
            console.log(`📞 Arama Cevaplandı: ${userId} -> ${data.to}`);

            if (data.callId) {
                await Call.findByIdAndUpdate(data.callId, {
                    status: 'accepted',
                });
            }

            io.to(data.to).emit("call_accepted", data.signal);

        } catch (error) {
            console.error("Arama cevaplama hatası:", error);
        }
    });

    socket.on("ice_candidate", (data) => {
        io.to(data.to).emit("ice_candidate", data.candidate);
    });

    socket.on("end_call", async (data) => {
        try {
            console.log(`📞 Arama Bitti. Süre: ${data.duration || 0}sn`);
            if (data.callId) {
                await Call.findByIdAndUpdate(data.callId, {
                    duration: data.duration || 0,
                });
            }

            if (data.to) {
                io.to(data.to).emit("call_ended");
            }

        } catch (error) {
            console.error("Arama sonlandırma hatası:", error);
        }
    });
    socket.on("reject_call", async (data) => {
        try {
            console.log(`⛔ Arama Reddedildi: ${userId} -> ${data.to}`);

            if (data.callId) {
                await Call.findByIdAndUpdate(data.callId, {
                    status: 'rejected',
                    duration: 0
                });
            }

            io.to(data.to).emit("call_rejected", {
                from: userId
            });

        } catch (error) {
            console.error("Reddetme hatası:", error);
        }
    });
};