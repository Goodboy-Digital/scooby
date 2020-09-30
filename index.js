// read the temp file and read the contentScript file
// do replacement

const fs = require('fs');

const textureMonitor =  fs.readFileSync(`${__dirname}/temp/TextureMonitor.js`).toString();

let script = fs.readFileSync(`${__dirname}/dist/contentScript.js`).toString();

script = script.replace('{{SCRIPT}}', textureMonitor);

fs.writeFileSync(`${__dirname}/dist/contentScript.js`, script, { encoding: 'utf8', flag: 'w' });
