const axios = require('axios');

const accessToken = 'EAAMZASQtB0swBQuac5bSgtc59HIVxUSKg4yv2otfC775NAYSdRyBr0ZBz5YZB3SvMsOq5w8zHRScfUBBRKZAddGe68JL1hwhlEeZC7g5TSePYPbGyPZCl1ZBgS5u56ZAqmRq7o5IQLHJAZCp26DO66sIL5oDXx3nboBXtFOEjJtZAxanrighp4WvWTZCJWQIzOZBfSmcJgZDZD';
const phoneNumberId = '908259815714100';
const recipient = '213550547309'; // Sending to old number

console.log('--- WhatsApp Live Mode Check ---');
console.log(`Phone Number ID: ${phoneNumberId}`);
console.log(`Recipient: ${recipient}`);

async function sendTestMessage() {
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;

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
                        { type: 'text', text: 'Test Client' },
                        { type: 'text', text: '1000' },
                        { type: 'text', text: '5' },
                        { type: 'text', text: '3.5' }
                    ]
                }
            ]
        }
    };

    try {
        console.log(`Sending request...`);
        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ SUCCESS! Message sent.');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ FAILED.');
        if (error.response) {
            console.error('Meta API Error:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

sendTestMessage();
