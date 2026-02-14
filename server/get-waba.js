const axios = require('axios');

const accessToken = 'EAAMZASQtB0swBQuac5bSgtc59HIVxUSKg4yv2otfC775NAYSdRyBr0ZBz5YZB3SvMsOq5w8zHRScfUBBRKZAddGe68JL1hwhlEeZC7g5TSePYPbGyPZCl1ZBgS5u56ZAqmRq7o5IQLHJAZCp26DO66sIL5oDXx3nboBXtFOEjJtZAxanrighp4WvWTZCJWQIzOZBfSmcJgZDZD';
const phoneNumberId = '908259815714100';

async function getWabaId() {
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}?fields=whatsapp_business_account`;

    try {
        console.log(`Fetching WABA ID...`);
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log('✅ WABA Info:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Failed.');
    }
}

getWabaId();
