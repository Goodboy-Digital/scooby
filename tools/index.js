const fs = require('fs');
const path = require('path');

const textureMonitor =  fs.readFileSync(path.resolve(`temp/TextureMonitor.js`)).toString();
let script = fs.readFileSync(path.resolve(`dist/contentScript.js`)).toString();

script = script.replace('{{SCRIPT}}', textureMonitor);

fs.writeFileSync(path.resolve(`dist/contentScript.js`), script, { encoding: 'utf8', flag: 'w' });
