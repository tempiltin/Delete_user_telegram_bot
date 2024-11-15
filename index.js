const fs = require("fs");
const path = require("path");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const channelOrGroupID = ""; 
const apiId = YOUR_API_ID; 
const apiHash = "YOUR_API_HASH"; /
const stringSession = new StringSession(""); 

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    console.log("<<<<<<<<<<<<<<<<<<<<<<Telegram bot ishga tushmoqda...>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    await client.start({
        phoneNumber: async () => {
            throw new Error("Telefon raqam talab qilinadi.");
        },
        password: async () => {
            throw new Error("Parol talab qilinadi.");
        },
        phoneCode: async () => {
            throw new Error("Kod talab qilinadi.");
        },
        onError: (err) => console.error("Xato yuz berdi:", err),
    });

    console.log("Bot muvaffaqiyatli ishga tushdi!");

    const userDataFile = path.join(__dirname, "User.json");

    async function kickUsers() {
        const participants = await client.getParticipants(channelOrGroupID);
        console.log(`${participants.length} ta foydalanuvchi topildi.`);

        for (const participant of participants) {
            const userData = {
                username: participant.username || "No Username",
                telegram_id: participant.id.toString(),
                first_name: participant.firstName || "No First Name",
                last_name: participant.lastName || "No Last Name",
            };

            try {
                await client.kickParticipant(channelOrGroupID, participant.id);
                console.log(`Foydalanuvchi chiqarildi: ${userData.username}`);

                const existingData = fs.existsSync(userDataFile)
                    ? JSON.parse(fs.readFileSync(userDataFile, "utf8"))
                    : [];
                existingData.push(userData);
                fs.writeFileSync(userDataFile, JSON.stringify(existingData, null, 2));

                await delay(5000); // 5 soniya kutish
            } catch (err) {
                console.error(`Xatolik yuz berdi (${userData.username}):`, err);
            }
        }

        console.log("Barcha foydalanuvchilar chiqarildi.");
    }

    try {
        await kickUsers();
    } catch (error) {
        console.error("Xatolik yuz berdi:", error);
    } finally {
        await client.disconnect();
    }
})();
