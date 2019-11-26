"use strict";
exports.__esModule = true;
var pixi_js_1 = require("pixi.js");
require("../../styles/textureMonitor.css");
var realFunction = HTMLCanvasElement.prototype.getContext;
pixi_js_1.settings.PREFER_ENV = pixi_js_1.ENV.WEBGL;
var textureMap = new Map();
// Setting up texture monitor DOM elements
var toggle = document.createElement('div');
var textureMonitorContainer = document.createElement('div');
var edgeShadowsContainer = document.createElement('div');
var edgeShadowsTop = document.createElement('div');
var edgeShadowsBottom = document.createElement('div');
var entitiesWrapper = document.createElement('div');
var toggleText = document.createElement('h3');
var gpuFootprintText = document.createElement('h3');
var toggleChevron = document.createElement('h3');
toggle.classList.add('monitor-toggle');
textureMonitorContainer.id = 'texture-monitor-container';
edgeShadowsContainer.id = 'edge-shadows-container';
edgeShadowsTop.id = 'edge-shadow-top';
edgeShadowsBottom.id = 'edge-shadow-bottom';
edgeShadowsTop.classList.add('hidden');
edgeShadowsBottom.classList.add('hidden');
entitiesWrapper.classList.add('entities-wrapper');
toggleChevron.id = 'toggle-chevron';
toggleText.innerHTML = "&nbsp;&nbsp;TEXTURES&nbsp;";
toggleChevron.innerHTML = "&#x25B2;";
toggle.appendChild(toggleChevron);
toggle.appendChild(toggleText);
toggle.appendChild(gpuFootprintText);
edgeShadowsContainer.appendChild(edgeShadowsTop);
edgeShadowsContainer.appendChild(edgeShadowsBottom);
document.body.appendChild(textureMonitorContainer);
textureMonitorContainer.appendChild(toggle);
textureMonitorContainer.appendChild(entitiesWrapper);
textureMonitorContainer.appendChild(edgeShadowsContainer);
toggle.onclick = function () {
    if (textureMonitorContainer.classList.contains('toggled')) {
        textureMonitorContainer.classList.remove('toggled');
    }
    else {
        textureMonitorContainer.classList.add('toggled');
    }
};
var isDown = false;
var startY;
var initialScroll;
// Set up desktop drag to scroll
document.addEventListener('mousedown', function (e) {
    if (!(e.target === entitiesWrapper || entitiesWrapper.contains(e.target)))
        return;
    isDown = true;
    startY = e.pageY;
    initialScroll = entitiesWrapper.scrollTop;
});
document.addEventListener('mouseup', function (e) {
    isDown = false;
});
document.addEventListener('mousemove', function (e) {
    if (!isDown)
        return;
    entitiesWrapper.scrollTo(0, initialScroll + (startY - e.pageY));
});
entitiesWrapper.onscroll = function (e) {
    e.preventDefault();
    updateScrollShadows();
};
HTMLCanvasElement.prototype.getContext = function (type, options) {
    var context = realFunction.call(this, type, options);
    if (type === 'webgl' || type === 'experimental-webgl') {
        console.log("----======Texture monitoring enabled!======----");
        var gl_1 = context;
        var typeMap_1 = {};
        var formatMap_1 = {};
        typeMap_1[gl_1.UNSIGNED_BYTE] = 1;
        typeMap_1[gl_1.UNSIGNED_SHORT_4_4_4_4] = 0.5;
        typeMap_1[36193] = 2;
        typeMap_1[gl_1.FLOAT] = 4;
        formatMap_1[gl_1.RGBA] = 4;
        formatMap_1[gl_1.RGB] = 3;
        var getTextureMap_1 = {};
        getTextureMap_1[gl_1.TEXTURE_2D] = gl_1.TEXTURE_BINDING_2D;
        getTextureMap_1[gl_1.TEXTURE_CUBE_MAP] = gl_1.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap_1[gl_1.TEXTURE_CUBE_MAP_NEGATIVE_X] = gl_1.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap_1[gl_1.TEXTURE_CUBE_MAP_NEGATIVE_Y] = gl_1.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap_1[gl_1.TEXTURE_CUBE_MAP_NEGATIVE_Z] = gl_1.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap_1[gl_1.TEXTURE_CUBE_MAP_POSITIVE_X] = gl_1.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap_1[gl_1.TEXTURE_CUBE_MAP_POSITIVE_Y] = gl_1.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap_1[gl_1.TEXTURE_CUBE_MAP_POSITIVE_Z] = gl_1.TEXTURE_BINDING_CUBE_MAP;
        //TODO - There will be an issue with cube textures for sure!
        gl_1.createTexture = function () {
            var glTexture = WebGLRenderingContext.prototype.createTexture.apply(this, arguments);
            // Create individual texture entity cards
            var textureEntity = document.createElement('div');
            textureEntity.classList.add('texture-entity');
            textureMap.set(glTexture, { size: 0, width: 0, height: 0, mipped: false, source: null, textureEntity: textureEntity });
            return glTexture;
        };
        gl_1.generateMipmap = function () {
            var glTexture = arguments[0];
            var webGLTexture = gl_1.getParameter(getTextureMap_1[glTexture]);
            textureMap.get(webGLTexture).mipped = true;
            calculateSize();
            return WebGLRenderingContext.prototype.generateMipmap.apply(this, arguments);
        };
        gl_1.deleteTexture = function () {
            // Feature to be added - accumulating consumption saved + replace duplicate te textures
            var glTexture = arguments[0];
            var data = textureMap.get(glTexture);
            // entitiesWrapper.removeChild(data.textureEntity);
            data.textureEntity.classList.add('tinted');
            // textureMap.delete(glTexture);
            calculateSize();
            return WebGLRenderingContext.prototype.deleteTexture.apply(this, arguments);
        };
        gl_1.texImage2D = function () {
            var glTexture = gl_1.getParameter(getTextureMap_1[arguments[0]]);
            var data = textureMap.get(glTexture);
            var gpuMemory = 0;
            var width = 0;
            var height = 0;
            if (arguments.length === 9) {
                width = arguments[3];
                height = arguments[4];
                gpuMemory = width * height;
                var bytesPerPixel = formatMap_1[arguments[2]] * typeMap_1[arguments[7]];
                if (!bytesPerPixel) {
                    console.warn('byte size per pixel for texture is unknown');
                }
                data.width = width;
                data.height = height;
                gpuMemory *= bytesPerPixel;
            }
            else if (arguments.length === 6) {
                width = arguments[5].width;
                height = arguments[5].height;
                gpuMemory = width * height;
                var bytesPerPixel = formatMap_1[arguments[2]] * typeMap_1[arguments[4]];
                if (!bytesPerPixel) {
                    console.warn('byte size per pixel for texture is unknown');
                }
                gpuMemory *= bytesPerPixel;
                data.source = arguments[5];
                var sourceURL_1 = data.source.src;
                data.width = width;
                data.height = height;
                // Update texture entity card data
                entitiesWrapper.appendChild(data.textureEntity);
                if (data.textureEntity.children.length > 0) {
                    // resets texture entity
                    data.textureEntity.innerHTML = '';
                }
                var textureWrapper = document.createElement('div');
                var textureInfo = document.createElement('div');
                var extraInfo = document.createElement('div');
                var dimension = document.createElement('h4');
                var size = document.createElement('h3');
                var textureName = document.createElement('h3');
                var mbSize = convertByteToMegaBytes(gpuMemory);
                textureWrapper.classList.add('texture-wrapper');
                textureInfo.classList.add('texture-info');
                extraInfo.classList.add('extra-info');
                data.source.classList.add('texture');
                dimension.innerHTML = "<span>&#127924;</span>&nbsp;&nbsp;" + data.width + " X " + data.height;
                size.innerHTML = "<span>&#128190;</span>&nbsp;" + (mbSize < 1 ? convertByteToKiloBytes(gpuMemory) + "&nbsp;KB" : mbSize + "&nbsp;MB");
                // Setup hidden texture card hover content
                extraInfo.appendChild(textureName);
                if (sourceURL_1) {
                    textureName.innerText = sourceURL_1.substring(sourceURL_1.lastIndexOf('/') + 1, sourceURL_1.indexOf('?') !== -1 ? sourceURL_1.indexOf('?') : sourceURL_1.length);
                    var textureButton = document.createElement('div');
                    textureButton.innerText = 'OPEN';
                    textureButton.classList.add('link-btn');
                    textureButton.onclick = function () {
                        // WIP - Need to find a way to open locally on file explorer
                        window.open(sourceURL_1, '_blank');
                    };
                    extraInfo.appendChild(textureButton);
                }
                else {
                    textureName.innerText = '???';
                }
                // if (mbSize >= 1)
                // {
                //     size.classList.add('warning-color');
                // }
                // if (data.mipped) // To be worked on **
                // {
                //     const isMipped = document.createElement('p');
                //     isMipped.innerText = 'M';
                //     textureInfo.appendChild(isMipped);
                // }
                textureWrapper.appendChild(data.source);
                data.textureEntity.appendChild(textureWrapper);
                textureInfo.appendChild(dimension);
                textureInfo.appendChild(size);
                data.textureEntity.appendChild(textureInfo);
                data.textureEntity.appendChild(extraInfo);
            }
            data.size = gpuMemory;
            calculateSize();
            WebGLRenderingContext.prototype.texImage2D.apply(this, arguments);
        };
    }
    updateScrollShadows();
    return context;
};
function calculateSize() {
    var totalSize = 0;
    var activeTextures = [];
    textureMap.forEach(function (data) {
        var realSize = data.size * (data.mipped ? 2 : 1);
        totalSize += realSize;
        activeTextures.push(data);
        var dimensions = data;
        var mb = convertByteToMegaBytes(realSize);
    });
    // const footprintMediumThreshold = 50;
    // const footprintHighThreshold = 100;
    var mbSize = convertByteToMegaBytes(totalSize);
    console.log('>>>>>>> active textures', activeTextures);
    console.log(">>>>>>> GPU Texture footprint: " + convertByteToMegaBytes(totalSize) + "mb");
    gpuFootprintText.innerHTML = "<span>" + mbSize + " MB</span>";
    gpuFootprintText.style.color = 'rgb(48, 188, 243)';
    // if (mbSize > footprintHighThreshold)
    // {
    //     gpuFootprintText.style.color = 'rgb(214, 41, 41)';
    // }
    // else if (mbSize > footprintMediumThreshold)
    // {
    //     gpuFootprintText.style.color = 'orange';
    // }
    // else
    // {
    //     gpuFootprintText.style.color = 'rgb(48, 188, 243)';
    // }
}
function convertByteToMegaBytes(bytes) {
    bytes /= 1048576;
    bytes *= 100;
    bytes = Math.floor(bytes);
    bytes /= 100;
    return bytes;
}
function convertByteToKiloBytes(bytes) {
    bytes /= 1024;
    bytes *= 100;
    bytes = Math.floor(bytes);
    bytes /= 100;
    return bytes;
}
function updateScrollShadows() {
    var offset = 100;
    if (entitiesWrapper.scrollTop < offset) {
        edgeShadowsTop.classList.add('hidden');
    }
    else {
        edgeShadowsTop.classList.remove('hidden');
    }
    if (entitiesWrapper.scrollTop > (entitiesWrapper.scrollHeight - entitiesWrapper.clientHeight) - offset) {
        edgeShadowsBottom.classList.add('hidden');
    }
    else {
        edgeShadowsBottom.classList.remove('hidden');
    }
}