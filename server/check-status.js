const axios = require('axios');

const accessToken = 'EAAMZASQtB0swBQuac5bSgtc59HIVxUSKg4yv2otfC775NAYSdRyBr0ZBz5YZB3SvMsOq5w8zHRScfUBBRKZAddGe68JL1hwhlEeZC7g5TSePYPbGyPZCl1ZBgS5u56ZAqmRq7o5IQLHJAZCp26DO66sIL5oDXx3nboBXtFOEjJtZAxanrighp4WvWTZCJWQIzOZBfSmcJgZDZD';
const phoneNumberId = '908259815714100';

async function checkStatus() {
    // Corrected fields for v17.0+
    const fields = 'display_phone_number,quality_rating,code_verification_status,name_status,id';
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}?fields=${fields}`;

    try {
        console.log(`Checking status for Phone ID: ${phoneNumberId}...`);
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Status Info:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Failed to get status.');
        if (error.response) {
            console.error('Meta API Error:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

checkStatus();
