import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

// Initialize the client. LocalAuth saves the session so you don't have to scan the QR code every time.
const client = new Client({
    authStrategy: new LocalAuth()
});

// When the client needs to log in, it will generate a QR code in the terminal
client.on('qr', (qr) => {
    console.log("Grampanchayat chya Mobile madhun WhatsApp open kara ani ha QR code scan kara:");
    qrcode.generate(qr, { small: true });
});

// When the client is successfully logged in and ready
client.on('ready', () => {
    console.log('Client is ready! Ata tumhi free madhe message pathvu shakta!');
    
    // Example: Sending a message to someone automatically after it gets ready
    const number = "9119410209"; // Country code (91) + mobile number without the '+' sign
    const text = "Namaskar! Hi Grampanchayat chi navin free WhatsApp seva ahe. Tumchi takrar nondvali geli ahe.";
    
    // WhatsApp requires the number to have "@c.us" at the end
    const chatId = `91${number}@c.us`; 

    client.sendMessage(chatId, text)
        .then(response => {
            console.log("Message Successfully Sent to " + number);
        })
        .catch(err => {
            console.log("Error sending message: ", err);
        });
});

// Start the client
client.initialize();
