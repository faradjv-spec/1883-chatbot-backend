const router = require('express').Router();
const path = require('path');

// Serve widget static files with correct MIME types
router.get('/embed.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const backendUrl = `${req.protocol}://${req.get('host')}`;
  
  res.send(`
(function() {
  var base = '${backendUrl}';
  
  // Load CSS
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = base + '/widget/chatbot.css';
  document.head.appendChild(link);
  
  // Load chatbot JS
  window.CHATBOT_CONFIG = { backendUrl: base };
  var script = document.createElement('script');
  script.src = base + '/widget/chatbot.js';
  script.defer = true;
  document.head.appendChild(script);
})();
  `.trim());
});

// Serve chatbot.css
router.get('/chatbot.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(path.join(__dirname, '../public/chatbot.css'));
});

// Serve chatbot.js
router.get('/chatbot.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(path.join(__dirname, '../public/chatbot.js'));
});

module.exports = router;