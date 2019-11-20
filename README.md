# WebGL Texture Monitor

A GUI tool to monitor life-cycles of WebGL textures and resulted GPU load in real-time.
___
## Getting Started

### Prerequisites

Please install [pixi.js](https://github.com/pixijs/pixi.js) library as it will be needed in the texture-monitor script.
```
npm install pixi.js
```
### Installing Texture Monitor
Move the **TextureMonitor** folder into your source folder and import the **texture-monitor.ts** *(or the already compiled .js if you don't have [ts-loader](https://github.com/TypeStrong/ts-loader) for webpack or equivalent)* into your entry JS script.

**main.js**
```javascript
import '../utils/texture-monitor.ts';
```
```javascript
import '../utils/texture-monitor.js';
```
If you don't have webpack [sass-loader](https://github.com/webpack-contrib/sass-loader) or equivalent, please consider importing the **textureMonitor.css** directly in the texture-monitor.js instead of .scss<br/>

**texture-monitor.ts**
```javascript
import '../../styles/textureMonitor.css';
```
### Add as a Chrome Extension

*[ Work currently in progress..... ]*
___
## Using Texture Monitor

The texture monitor tab is minimised at the bottom left corner of the page by default where the textures' **GPU usage footprint** is displayed. The tab can be toggled to inspect the individual textures behind the scene.

For Chrome users, please stay tuned for the **chrome extension**.