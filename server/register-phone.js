const axios = require('axios');

const accessToken = 'EAAMZASQtB0swBQuac5bSgtc59HIVxUSKg4yv2otfC775NAYSdRyBr0ZBz5YZB3SvMsOq5w8zHRScfUBBRKZAddGe68JL1hwhlEeZC7g5TSePYPbGyPZCl1ZBgS5u56ZAqmRq7o5IQLHJAZCp26DO66sIL5oDXx3nboBXtFOEjJtZAxanrighp4WvWTZCJWQIzOZBfSmcJgZDZD';
const phoneNumberId = '908259815714100';
const pin = '123456'; // Setting a default PIN for 2FA

async function registerPhone() {
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/register`;

    const payload = {
        messaging_product: 'whatsapp',
        pin: pin
    };

    try {
        console.log(`Attempting to register phone number (ID: ${phoneNumberId})...`);
        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Registration SUCCESS!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Registration FAILED.');
        if (error.response) {
            console.error('Meta API Error:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

registerPhone();
