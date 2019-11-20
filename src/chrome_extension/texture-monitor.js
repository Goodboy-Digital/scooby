// const pixi_js_1 = require('pixi.js');
const realFunction = HTMLCanvasElement.prototype.getContext;

pixi_js_1.settings.PREFER_ENV = pixi_js_1.ENV.WEBGL;
const textureMap = new Map();

// Setting up texture monitor DOM elements
const toggle = document.createElement('div');
const textureMonitorContainer = document.createElement('div');
const edgeShadowsContainer = document.createElement('div');
const edgeShadowsLeft = document.createElement('div');
const edgeShadowsRight = document.createElement('div');
const entitiesWrapper = document.createElement('div');
const toggleText = document.createElement('h3');
const gpuFootprintText = document.createElement('h3');
const toggleChevron = document.createElement('h3');

toggle.classList.add('monitor-toggle');
textureMonitorContainer.id = 'texture-monitor-container';
edgeShadowsContainer.id = 'edge-shadows-container';
edgeShadowsLeft.id = 'edge-shadow-left';
edgeShadowsRight.id = 'edge-shadow-right';
edgeShadowsLeft.classList.add('hidden');
edgeShadowsRight.classList.add('hidden');
entitiesWrapper.classList.add('entities-wrapper');
toggleChevron.id = 'toggle-chevron';

toggleText.innerHTML = `&nbsp;&nbsp;TEXTURES&nbsp;`;
toggleChevron.innerHTML = `&#x25B2;`;

toggle.appendChild(toggleChevron);
toggle.appendChild(toggleText);
toggle.appendChild(gpuFootprintText);
edgeShadowsContainer.appendChild(edgeShadowsLeft);
edgeShadowsContainer.appendChild(edgeShadowsRight);
document.body.appendChild(textureMonitorContainer);
textureMonitorContainer.appendChild(toggle);
textureMonitorContainer.appendChild(entitiesWrapper);
textureMonitorContainer.appendChild(edgeShadowsContainer);

toggle.onclick = function ()
{
    if (textureMonitorContainer.classList.contains('toggled'))
    {
        textureMonitorContainer.classList.remove('toggled');
    }
    else
    {
        textureMonitorContainer.classList.add('toggled');
    }
};

entitiesWrapper.onscroll = function ()
{
    updateScrollShadows();
};

HTMLCanvasElement.prototype.getContext = function (type, options)
{
    const context = realFunction.call(this, type, options);

    if (type === 'webgl' || type === 'experimental-webgl')
    {
        console.log('----======Texture monitoring enabled!======----');
        const gl_1 = context;
        const typeMap_1 = {};
        const formatMap_1 = {};

        typeMap_1[gl_1.UNSIGNED_BYTE] = 1;
        typeMap_1[gl_1.UNSIGNED_SHORT_4_4_4_4] = 0.5;
        typeMap_1[36193] = 2;
        typeMap_1[gl_1.FLOAT] = 4;
        formatMap_1[gl_1.RGBA] = 4;
        formatMap_1[gl_1.RGB] = 3;
        const getTextureMap_1 = {};

        getTextureMap_1[gl_1.TEXTURE_2D] = gl_1.TEXTURE_BINDING_2D;
        getTextureMap_1[gl_1.TEXTURE_CUBE_MAP] = gl_1.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap_1[gl_1.TEXTURE_CUBE_MAP_NEGATIVE_X] = gl_1.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap_1[gl_1.TEXTURE_CUBE_MAP_NEGATIVE_Y] = gl_1.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap_1[gl_1.TEXTURE_CUBE_MAP_NEGATIVE_Z] = gl_1.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap_1[gl_1.TEXTURE_CUBE_MAP_POSITIVE_X] = gl_1.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap_1[gl_1.TEXTURE_CUBE_MAP_POSITIVE_Y] = gl_1.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap_1[gl_1.TEXTURE_CUBE_MAP_POSITIVE_Z] = gl_1.TEXTURE_BINDING_CUBE_MAP;
        // TODO - There will be an issue with cube textures for sure!
        gl_1.createTexture = function ()
        {
            const glTexture = WebGLRenderingContext.prototype.createTexture.apply(this, arguments);

            // Create individual texture entity cards
            const textureEntity = document.createElement('div');

            textureEntity.classList.add('texture-entity');

            textureMap.set(glTexture, { size: 0, width: 0, height: 0, mipped: false, source: null, textureEntity });

            return glTexture;
        };
        gl_1.generateMipmap = function ()
        {
            const glTexture = arguments[0];
            const webGLTexture = gl_1.getParameter(getTextureMap_1[glTexture]);

            textureMap.get(webGLTexture).mipped = true;
            calculateSize();

            return WebGLRenderingContext.prototype.generateMipmap.apply(this, arguments);
        };
        gl_1.deleteTexture = function ()
        {
            // Feature to be added - accumulating consumption saved + tinted deleted textures' card rather than removing them

            const glTexture = arguments[0];
            const data = textureMap.get(glTexture);

            entitiesWrapper.removeChild(data.textureEntity);
            textureMap.delete(glTexture);

            calculateSize();

            return WebGLRenderingContext.prototype.deleteTexture.apply(this, arguments);
        };

        gl_1.texImage2D = function ()
        {
            const glTexture = gl_1.getParameter(getTextureMap_1[arguments[0]]);
            const data = textureMap.get(glTexture);
            let gpuMemory = 0;
            let width = 0;
            let height = 0;

            if (arguments.length === 9)
            {
                width = arguments[3];
                height = arguments[4];
                gpuMemory = width * height;
                var bytesPerPixel = formatMap_1[arguments[2]] * typeMap_1[arguments[7]];

                if (!bytesPerPixel)
                {
                    console.warn('byte size per pixel for texture is unknown');
                }
                data.width = width;
                data.height = height;
                gpuMemory *= bytesPerPixel;
            }
            else if (arguments.length === 6)
            {
                width = arguments[5].width;
                height = arguments[5].height;
                gpuMemory = width * height;
                var bytesPerPixel = formatMap_1[arguments[2]] * typeMap_1[arguments[4]];

                if (!bytesPerPixel)
                {
                    console.warn('byte size per pixel for texture is unknown');
                }
                gpuMemory *= bytesPerPixel;
                data.source = arguments[5];
                data.width = width;
                data.height = height;

                // Update texture entity card data
                entitiesWrapper.appendChild(data.textureEntity);

                if (data.textureEntity.children.length > 0)
                {
                    // resets texture entity
                    data.textureEntity.innerHTML = '';
                }

                const textureWrapper = document.createElement('div');
                const textureInfo = document.createElement('div');
                const extraInfo = document.createElement('div');
                const dimension = document.createElement('h4');
                const size = document.createElement('h3');
                const textureName = document.createElement('h3');
                const texturePath = document.createElement('h3');
                const mbSize = convertByteToMegaBytes(gpuMemory);

                textureWrapper.classList.add('texture-wrapper');
                textureInfo.classList.add('texture-info');
                extraInfo.classList.add('extra-info');
                data.source.classList.add('texture');

                dimension.innerHTML = `<span>&#127924;</span>&nbsp;&nbsp;${data.width} X ${data.height}`;
                size.innerHTML = `<span>&#128190;</span>&nbsp;${mbSize < 1 ? `${convertByteToKiloBytes(gpuMemory)}&nbsp;KB` : `${mbSize}&nbsp;MB`}`;

                // To be implemented **
                textureName.innerText = '[FILE NAME]';
                texturePath.innerText = '[FILE PATH]';

                if (mbSize >= 1)
                {
                    size.classList.add('warning-color');
                }

                if (data.mipped) // To be worked on **
                {
                    const isMipped = document.createElement('p');

                    isMipped.innerText = 'M';
                    textureInfo.appendChild(isMipped);
                }

                textureWrapper.appendChild(data.source);
                data.textureEntity.appendChild(textureWrapper);
                textureInfo.appendChild(dimension);
                textureInfo.appendChild(size);
                extraInfo.appendChild(textureName);
                extraInfo.appendChild(texturePath);
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

function calculateSize()
{
    let totalSize = 0;
    const activeTextures = [];

    textureMap.forEach(function (data)
    {
        const realSize = data.size * (data.mipped ? 2 : 1);

        totalSize += realSize;
        activeTextures.push(data);
        const dimensions = data;
        const mb = convertByteToMegaBytes(realSize);
    });

    const footprintMediumThreshold = 50;
    const footprintHighThreshold = 100;
    const mbSize = convertByteToMegaBytes(totalSize);

    console.log('>>>>>>> active textures', activeTextures);
    console.log(`>>>>>>> GPU Texture footprint: ${mbSize} mb`);
    gpuFootprintText.innerHTML = `<span>${mbSize} MB</span>`;

    if (mbSize > footprintHighThreshold)
    {
        gpuFootprintText.style.color = 'rgb(214, 41, 41)';
    }
    else if (mbSize > footprintMediumThreshold)
    {
        gpuFootprintText.style.color = 'orange';
    }
    else
    {
        gpuFootprintText.style.color = 'rgb(48, 188, 243)';
    }
}

function convertByteToMegaBytes(bytes)
{
    bytes /= 1048576;
    bytes *= 100;
    bytes = Math.floor(bytes);
    bytes /= 100;

    return bytes;
}

function convertByteToKiloBytes(bytes)
{
    bytes /= 1024;
    bytes *= 100;
    bytes = Math.floor(bytes);
    bytes /= 100;

    return bytes;
}

function updateScrollShadows()
{
    const offset = 50;

    if (entitiesWrapper.scrollWidth > window.innerWidth)
    {
        if (entitiesWrapper.scrollLeft < offset)
        {
            edgeShadowsLeft.classList.add('hidden');
        }
        else
        {
            edgeShadowsLeft.classList.remove('hidden');
        }

        if (entitiesWrapper.scrollLeft > (entitiesWrapper.scrollWidth - window.innerWidth) - offset)
        {
            edgeShadowsRight.classList.add('hidden');
        }
        else
        {
            edgeShadowsRight.classList.remove('hidden');
        }
    }
}
