import Twilio from "twilio";



const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const SendWhatsappMessage = async () => {

    try {

        const message = await client.messages.create({

            to: `whatsapp:+919119410209`, // Added +91 country code, ensure this is correct
            from: `whatsapp:+14155238886`, // Twilio's standard WhatsApp sandbox number, or your Twilio number
            body: `Hello Abhijeet How Are You `,


        })


        console.log("Message Is Sent Succeffully", message.sid);

    } catch (error) {
        console.log("something wrong", error);
    }
}

SendWhatsappMessage();