const axios = require('axios');

const client = axios.create({
  baseURL: process.env.EXELY_BASE_URL || 'https://connect.hopenapi.com',
  headers: {
    'X-Api-Key': process.env.EXELY_API_KEY,
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

module.exports = client;