const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from infra/production.env
const envPath = path.resolve(__dirname, '../infra/production.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const accessToken = (envConfig.META_ACCESS_TOKEN || '').trim();
const phoneNumberId = (envConfig.META_PHONE_NUMBER_ID || '').trim();
const whatsappNumber = (envConfig.WHATSAPP_PHONE_NUMBER || '').trim();

if (!accessToken || !phoneNumberId) {
    console.error('Error: META_ACCESS_TOKEN or META_PHONE_NUMBER_ID missing in production.env');
    process.exit(1);
}

console.log('--- WhatsApp Configuration ---');
console.log(`Phone Number ID: '${phoneNumberId}'`);
console.log(`Access Token: '${accessToken.substring(0, 10)}...'`);
console.log(`Target Number: '${whatsappNumber}'`);
console.log('------------------------------');

async function sendTestMessage() {
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    const recipient = whatsappNumber.replace(/\D/g, '');

    const payload = {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'template',
        template: {
            name: 'quote_notification',
            language: { code: 'fr' },
            components: [
                {
                    type: 'body',
                    parameters: [
                        { type: 'text', text: 'Test User' },
                        { type: 'text', text: '1000' },
                        { type: 'text', text: '5' },
                        { type: 'text', text: '3.5' }
                    ]
                }
            ]
        }
    };

    try {
        console.log(`Sending request to: ${url}`);
        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

sendTestMessage();
