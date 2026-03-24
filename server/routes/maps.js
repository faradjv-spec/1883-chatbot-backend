const router = require('express').Router();
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 }); // 1-hour cache
const HOTEL_LAT = parseFloat(process.env.HOTEL_LAT || '40.3777');
const HOTEL_LNG = parseFloat(process.env.HOTEL_LNG || '49.8533');

// GET /api/maps/distance?origin=Baku+Airport
router.get('/distance', async (req, res) => {
  try {
    const { origin } = req.query;
    if (!origin) {
      return res.status(400).json({ error: 'origin is required' });
    }

    const cacheKey = `dist_${origin}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const destination = `${HOTEL_LAT},${HOTEL_LNG}`;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}&language=en`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(502).json({ error: 'Maps API error', detail: data.status });
    }

    const element = data.rows?.[0]?.elements?.[0];
    const result = {
      distance: element?.distance?.text || 'unknown',
      duration: element?.duration?.text || 'unknown',
      origin: data.origin_addresses?.[0] || origin,
      destination: data.destination_addresses?.[0] || 'Hotel 1883'
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Maps error:', err.message);
    res.status(502).json({ error: 'Failed to fetch distance', detail: err.message });
  }
});

// GET /api/maps/hotel — return hotel coordinates and map link
router.get('/hotel', (req, res) => {
  res.json({
    lat: HOTEL_LAT,
    lng: HOTEL_LNG,
    name: '1883 Boutique Hotel',
    address: 'Baku, Azerbaijan',
    googleMapsUrl: `https://www.google.com/maps?q=${HOTEL_LAT},${HOTEL_LNG}`,
    embedUrl: `https://www.google.com/maps/embed/v1/place?key=${process.env.GOOGLE_MAPS_API_KEY}&q=${HOTEL_LAT},${HOTEL_LNG}`
  });
});

module.exports = router;