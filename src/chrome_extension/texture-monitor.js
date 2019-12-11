"use strict";
console.log("SUCCESS");
var pixi_js_1 = PIXI;
var realFunction = HTMLCanvasElement.prototype.getContext;
pixi_js_1.settings.PREFER_ENV = pixi_js_1.ENV.WEBGL;
var textureMap = new Map();
// Setting up DOM and utility variables for CSS manipulations
var toggle = document.createElement('div');
var textureMonitorContainer = document.createElement('div');
var edgeShadowsContainer = document.createElement('div');
var edgeShadowsTop = document.createElement('div');
var edgeShadowsBottom = document.createElement('div');
var entitiesWrapper = document.createElement('div');
var toggleText = document.createElement('h3');
var gpuFootprintText = document.createElement('h3');
var toggleChevron = document.createElement('h3');
var filterButtonsGroup = document.createElement('div');
var textureButton = document.createElement('div');
var miscButton = document.createElement('div');
var activeButton = document.createElement('div');
var deletedButton = document.createElement('div');
var isDown = false;
var isToggleDown = false;
var isDragging = false;
var startY;
var initialScroll;
initTextureMonitor();
HTMLCanvasElement.prototype.getContext = function (type, options) {
    console.log("IN");
    
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
            data.textureEntity.classList.remove('type-active');
            data.textureEntity.classList.add('type-deleted');
            // entitiesWrapper.removeChild(data.textureEntity);
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
                data.textureEntity.classList.add('type-active');
                // Setup hidden texture card hover content
                extraInfo.appendChild(textureName);
                if (sourceURL_1) {
                    textureName.innerText = sourceURL_1.substring(sourceURL_1.lastIndexOf('/') + 1, sourceURL_1.indexOf('?') !== -1 ? sourceURL_1.indexOf('?') : sourceURL_1.length);
                    var textureButton_1 = document.createElement('div');
                    textureButton_1.innerText = 'OPEN';
                    textureButton_1.classList.add('link-btn');
                    textureButton_1.onclick = function () {
                        // WIP - Need to find a way to open locally on file explorer
                        window.open(sourceURL_1, '_blank');
                    };
                    extraInfo.appendChild(textureButton_1);
                    data.textureEntity.classList.add('type-texture');
                }
                else {
                    textureName.innerText = '???';
                    data.textureEntity.classList.add('type-misc');
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
function checkIsMobile() {
    var check = false;
    (function (a) { if ((/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i).test(a) || (/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i).test(a.substr(0, 4)))
        check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}
// ---------------------------- CSS Manipulations ----------------------------
function initTextureMonitor() {
    toggle.classList.add('monitor-toggle');
    textureMonitorContainer.id = 'texture-monitor-container';
    edgeShadowsContainer.id = 'edge-shadows-container';
    edgeShadowsTop.id = 'edge-shadow-top';
    edgeShadowsBottom.id = 'edge-shadow-bottom';
    edgeShadowsTop.classList.add('hidden');
    edgeShadowsBottom.classList.add('hidden');
    entitiesWrapper.classList.add('entities-wrapper');
    toggleChevron.id = 'toggle-chevron';
    filterButtonsGroup.id = 'filter-buttons-group';
    textureButton.classList.add('filter-button', 'toggled');
    miscButton.classList.add('filter-button', 'toggled');
    activeButton.classList.add('filter-button', 'toggled');
    deletedButton.classList.add('filter-button', 'toggled');
    toggleText.innerHTML = "&nbsp;&nbsp;TEXTURES&nbsp;";
    toggleChevron.innerHTML = "&#x25B2;";
    textureButton.innerHTML = "<h4>&#127924;</h4>";
    miscButton.innerHTML = "<h4>&#128291;</h4>";
    activeButton.innerHTML = "<h4>&#128994;</h4>";
    deletedButton.innerHTML = "<h4>&#10060;</h4>";
    toggle.appendChild(toggleChevron);
    toggle.appendChild(toggleText);
    toggle.appendChild(gpuFootprintText);
    edgeShadowsContainer.appendChild(edgeShadowsTop);
    edgeShadowsContainer.appendChild(edgeShadowsBottom);
    filterButtonsGroup.appendChild(textureButton);
    filterButtonsGroup.appendChild(miscButton);
    filterButtonsGroup.appendChild(activeButton);
    filterButtonsGroup.appendChild(deletedButton);
    document.body.appendChild(textureMonitorContainer);
    textureMonitorContainer.appendChild(toggle);
    textureMonitorContainer.appendChild(entitiesWrapper);
    textureMonitorContainer.appendChild(edgeShadowsContainer);
    textureMonitorContainer.appendChild(filterButtonsGroup);
    // Fix monitor panel height to maximum height on mobile devices ** Need to find ways to implement drag to scale on mobile later without causing issues **
    if (checkIsMobile()) {
        textureMonitorContainer.style.height = '75vh';
    }
    setupListeners();
}
function setupListeners() {
    // Set up toggles
    toggle.onclick = function (e) {
        if (isDragging) {
            isDragging = false;
            return;
        }
        if (textureMonitorContainer.classList.contains('toggled')) {
            textureMonitorContainer.classList.remove('toggled');
        }
        else {
            textureMonitorContainer.classList.add('toggled');
        }
    };
    textureButton.onclick = function () {
        if (textureButton.classList.contains('toggled')) {
            textureButton.classList.remove('toggled');
        }
        else {
            textureButton.classList.add('toggled');
        }
        updateList();
    };
    miscButton.onclick = function () {
        if (miscButton.classList.contains('toggled')) {
            miscButton.classList.remove('toggled');
        }
        else {
            miscButton.classList.add('toggled');
        }
        updateList();
    };
    activeButton.onclick = function () {
        if (activeButton.classList.contains('toggled')) {
            activeButton.classList.remove('toggled');
        }
        else {
            activeButton.classList.add('toggled');
        }
        updateList();
    };
    deletedButton.onclick = function () {
        if (deletedButton.classList.contains('toggled')) {
            deletedButton.classList.remove('toggled');
        }
        else {
            deletedButton.classList.add('toggled');
        }
        updateList();
    };
    // Set up desktop drag to scroll
    document.addEventListener('mousedown', function (e) {
        if (!(e.target === entitiesWrapper || entitiesWrapper.contains(e.target) || e.target === toggle))
            return;
        if (e.target === toggle)
            isToggleDown = true;
        else {
            isDown = true;
            startY = e.pageY;
            initialScroll = entitiesWrapper.scrollTop;
        }
    });
    document.addEventListener('mouseup', function (e) {
        isDown = false;
        isToggleDown = false;
    });
    document.addEventListener('mousemove', function (e) {
        if (!isDown && !isToggleDown)
            return;
        if (isDown) {
            entitiesWrapper.scrollTo(0, initialScroll + (startY - e.pageY));
        }
        if (isToggleDown) {
            isDragging = true;
            if (!textureMonitorContainer.classList.contains('toggled')) {
                textureMonitorContainer.classList.add('toggled');
                isDragging = false;
            }
            var percentHeight = ((window.innerHeight - e.clientY) / window.innerHeight) * 100;
            if (percentHeight > 30 && percentHeight < 90) {
                textureMonitorContainer.style.height = percentHeight + "vh";
            }
            else
                isDragging = false;
        }
    });
    entitiesWrapper.onscroll = function (e) {
        e.preventDefault();
        updateScrollShadows();
    };
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
function updateList() {
    var deleted = deletedButton.classList.contains('toggled');
    var active = activeButton.classList.contains('toggled');
    var entities = document.querySelectorAll('.texture-entity');
    Array.prototype.forEach.call(entities, function (entity) {
        entity.classList.add('display-none');
    });
    if (!(deleted && active)) {
        if (deleted) {
            entities = document.querySelectorAll('.type-deleted');
        }
        if (active) {
            entities = document.querySelectorAll('.type-active');
        }
    }
    // For IE Support, use call instead of direct forEach **
    Array.prototype.forEach.call(entities, function (entity) {
        if (textureButton.classList.contains('toggled')) {
            if (entity.classList.contains('type-texture')) {
                entity.classList.remove('display-none');
            }
        }
        if (miscButton.classList.contains('toggled')) {
            if (entity.classList.contains('type-misc')) {
                entity.classList.remove('display-none');
            }
        }
    });
}