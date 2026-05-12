const fs = require('fs');
let content = fs.readFileSync('seed.js', 'utf8');
content = content.replace(/image: "https:\/\/images\.unsplash\.com[^"]+"/g, 'image: "assets/img/logo.png"');
fs.writeFileSync('seed.js', content);
console.log('Done');
