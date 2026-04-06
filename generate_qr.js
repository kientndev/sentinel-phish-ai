const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// We'll generate a high-res, visually appealing QR code pointing to localhost or the Vercel deployed app.
const targetUrl = 'https://sentinel-phish.vercel.app'; 
const outputPath = 'C:\\Users\\Trikien\\.gemini\\antigravity\\brain\\d93a638c-e9e0-4bbc-a94d-af041e698212\\sentinel_qr.png';

const options = {
  errorCorrectionLevel: 'H',
  type: 'image/png',
  quality: 0.92,
  margin: 2,
  color: {
    dark: '#EF4444', // Tailwind Red-500 from the UI
    light: '#09090B' // Tailwind Dark Background from the UI
  },
  width: 800
};

QRCode.toFile(outputPath, targetUrl, options, function (err) {
  if (err) throw err;
  console.log('QR code successfully generated and saved to ', outputPath);
});
