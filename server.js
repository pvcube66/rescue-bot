require('dotenv').config();
const twilio = require('twilio');
const TelegramBot = require('node-telegram-bot-api');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const myPhoneNumber = process.env.MY_PHONE_NUMBER;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
if (!accountSid || !authToken || !twilioPhoneNumber || !myPhoneNumber || !telegramBotToken) {
    console.error("Error: Missing required environment variables. Please check your .env file.");
    process.exit(1);
}
const twilioClient = twilio(accountSid, authToken);
const bot = new TelegramBot(telegramBotToken, { polling: true });
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;



app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});

console.log('Rescue Call Bot is running and listening for commands...');

bot.onText(/\/rescue/, async (msg) => {
    const chatId = msg.chat.id;
    console.log(`Received /rescue command from chat ID: ${chatId}`);
    bot.sendMessage(chatId, '🤖 Rescue call initiated. Your phone should ring shortly...');
    try {
        // Use Twilio's <Say> verb directly for a static urgent message
        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say({ voice: 'alice', language: 'en-IN' }, "It's urgent here, we need you man!");
        const call = await twilioClient.calls.create({
            twiml: twiml.toString(),
            to: myPhoneNumber,
            from: twilioPhoneNumber
        });
        console.log(`Call initiated successfully with SID: ${call.sid}`);
        bot.sendMessage(chatId, `✅ Call is on the way! (SID: ${call.sid})`);

    } catch (error) {
        console.error('Error making call:', error);
        bot.sendMessage(chatId, `❌ Oops! Something went wrong and I couldn't make the call. Please check the server logs.`);
    }
});
bot.on('polling_error', (error) => {
    console.error(`Polling error: ${error.code} - ${error.message}`);
});

