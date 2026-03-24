const router = require('express').Router();
const exelyClient = require('../services/exelyClient');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 600 }); // 10-min cache

// GET /api/rates?checkIn=2026-04-01&checkOut=2026-04-03&adults=2
router.get('/', async (req, res) => {
  try {
    const { checkIn, checkOut, adults = 2, children = 0 } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: 'checkIn and checkOut are required' });
    }

    const cacheKey = `rates_${checkIn}_${checkOut}_${adults}_${children}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const response = await exelyClient.get('/api/v1/rates', {
      params: {
        property_id: process.env.EXELY_PROPERTY_ID,
        date_from: checkIn,
        date_to: checkOut,
        adults,
        children
      }
    });

    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (err) {
    console.error('Rates error:', err.message);
    res.status(502).json({ error: 'Failed to fetch rates', detail: err.message });
  }
});

module.exports = router;