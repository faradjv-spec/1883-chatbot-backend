# 1883 Boutique Hotel Chatbot Backend

Express.js backend API + embeddable chat widget for Hotel 1883, Baku.

## Quick Deploy to Railway

1. Fork/clone this repo
2. Connect to Railway via GitHub
3. Add environment variables (see .env.example)
4. Railway auto-detects Node.js and runs `npm start`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXELY_API_KEY` | Your Exely API key |
| `EXELY_PROPERTY_ID` | Your Exely property ID |
| `EXELY_BASE_URL` | Exely API base URL (default: https://connect.hopenapi.com) |
| `GOOGLE_MAPS_API_KEY` | Google Maps Distance Matrix API key |
| `HOTEL_LAT` | Hotel latitude (default: 40.3777) |
| `HOTEL_LNG` | Hotel longitude (default: 49.8533) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `PORT` | Server port (injected by Railway automatically) |

## API Endpoints

- `GET /health` — Health check
- `GET /api/availability` — Room availability from Exely
- `GET /api/rates` — Room rates from Exely
- `POST /api/booking` — Create booking via Exely
- `GET /api/booking/redirect` — Redirect to Exely booking engine
- `GET /api/maps/distance` — Distance from origin to hotel
- `GET /api/maps/hotel` — Hotel location info
- `GET /widget/embed.js` — Single-tag embed script

## Embedding the Widget

Once deployed, add this single tag to your Exely Analytics/Counters section:

```html
<script src="https://YOUR-RAILWAY-URL/widget/embed.js"></script>
```

Replace `YOUR-RAILWAY-URL` with your actual Railway deployment URL.
