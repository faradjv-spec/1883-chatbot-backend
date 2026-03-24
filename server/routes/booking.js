const router = require('express').Router();
const exelyClient = require('../services/exelyClient');

// POST /api/booking
router.post('/', async (req, res) => {
  try {
    const bookingData = req.body;
    if (!bookingData.checkIn || !bookingData.checkOut || !bookingData.guest) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    const response = await exelyClient.post('/api/v1/bookings', {
      property_id: process.env.EXELY_PROPERTY_ID,
      ...bookingData
    });

    res.json(response.data);
  } catch (err) {
    console.error('Booking error:', err.message);
    res.status(502).json({ error: 'Failed to create booking', detail: err.message });
  }
});

// GET /api/booking/redirect — redirect to Exely booking engine
router.get('/redirect', (req, res) => {
  const { checkIn, checkOut, adults = 2 } = req.query;
  const propertyId = process.env.EXELY_PROPERTY_ID;
  let url = `https://book.hopenapi.com/${propertyId}`;
  if (checkIn && checkOut) {
    url += `?date_from=${checkIn}&date_to=${checkOut}&adults=${adults}`;
  }
  res.redirect(url);
});

module.exports = router;