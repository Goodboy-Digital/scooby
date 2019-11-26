import { ENV, settings } from 'pixi.js';
import '../../styles/textureMonitor.css';
​
const realFunction = HTMLCanvasElement.prototype.getContext;
​
settings.PREFER_ENV = ENV.WEBGL;
​
const textureMap = new Map();

// Setting up texture monitor DOM elements
const toggle = document.createElement('div');
const textureMonitorContainer = document.createElement('div');
const edgeShadowsContainer = document.createElement('div');
const edgeShadowsTop = document.createElement('div');
const edgeShadowsBottom = document.createElement('div');
const entitiesWrapper = document.createElement('div');
const toggleText = document.createElement('h3');
const gpuFootprintText = document.createElement('h3');
const toggleChevron = document.createElement('h3');

toggle.classList.add('monitor-toggle');
textureMonitorContainer.id = 'texture-monitor-container';
edgeShadowsContainer.id = 'edge-shadows-container';
edgeShadowsTop.id = 'edge-shadow-top';
edgeShadowsBottom.id = 'edge-shadow-bottom';
edgeShadowsTop.classList.add('hidden');
edgeShadowsBottom.classList.add('hidden');
entitiesWrapper.classList.add('entities-wrapper');
toggleChevron.id = 'toggle-chevron';

toggleText.innerHTML = `&nbsp;&nbsp;TEXTURES&nbsp;`;
toggleChevron.innerHTML = `&#x25B2;`;

toggle.appendChild(toggleChevron);
toggle.appendChild(toggleText);
toggle.appendChild(gpuFootprintText);
edgeShadowsContainer.appendChild(edgeShadowsTop);
edgeShadowsContainer.appendChild(edgeShadowsBottom);
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

let isDown = false;
let startY;
let initialScroll;

// Set up desktop drag to scroll
document.addEventListener('mousedown', function (e) {
    if(!(e.target === entitiesWrapper || entitiesWrapper.contains(e.target))) return;
    isDown = true;
    startY = e.pageY;
    initialScroll = entitiesWrapper.scrollTop;
});

document.addEventListener('mouseup', function (e) {
    isDown = false;
});

document.addEventListener('mousemove', function (e) {
    if(!isDown) return;
    entitiesWrapper.scrollTo(0,initialScroll + (startY - e.pageY));
});

entitiesWrapper.onscroll = function (e)
{
    e.preventDefault();
    updateScrollShadows();
};
​
HTMLCanvasElement.prototype.getContext = function(type, options){
​
    const context = realFunction.call(this,type, options);
​
    if(type === 'webgl' || type === 'experimental-webgl')
    {
        console.log("----======Texture monitoring enabled!======----")
        const gl = context as WebGLRenderingContext;
        const typeMap = {}
        const formatMap = {}
        
        typeMap[gl.UNSIGNED_BYTE] = 1;
        typeMap[gl.UNSIGNED_SHORT_4_4_4_4] = 0.5;
        typeMap[36193] = 2;
        typeMap[gl.FLOAT] = 4;
        formatMap[gl.RGBA] = 4;
        formatMap[gl.RGB] = 3;
        
        const getTextureMap = {}
        getTextureMap[gl.TEXTURE_2D] = gl.TEXTURE_BINDING_2D
        getTextureMap[gl.TEXTURE_CUBE_MAP] = gl.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap[gl.TEXTURE_CUBE_MAP_NEGATIVE_X] = gl.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap[gl.TEXTURE_CUBE_MAP_NEGATIVE_Y] = gl.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap[gl.TEXTURE_CUBE_MAP_NEGATIVE_Z] = gl.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap[gl.TEXTURE_CUBE_MAP_POSITIVE_X] = gl.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap[gl.TEXTURE_CUBE_MAP_POSITIVE_Y] = gl.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap[gl.TEXTURE_CUBE_MAP_POSITIVE_Z] = gl.TEXTURE_BINDING_CUBE_MAP;
​
        //TODO - There will be an issue with cube textures for sure!
    
        gl.createTexture = function()
        {
            const glTexture = WebGLRenderingContext.prototype.createTexture.apply(this, arguments);
            
             // Create individual texture entity cards
            const textureEntity = document.createElement('div');
            textureEntity.classList.add('texture-entity');
            textureMap.set(glTexture, { size: 0, width: 0, height: 0, mipped: false, source: null, textureEntity });

            return glTexture;
        }
​
        gl.generateMipmap = function()
        {
            const glTexture = arguments[0];
            const webGLTexture = gl.getParameter(getTextureMap[glTexture]);        
            textureMap.get(webGLTexture).mipped = true;
            calculateSize();
            
            return WebGLRenderingContext.prototype.generateMipmap.apply(this, arguments);
        }
​
        gl.deleteTexture = function(){
            
            // Feature to be added - accumulating consumption saved + replace duplicate te textures
            const glTexture = arguments[0];
            const data = textureMap.get(glTexture);
​
            // entitiesWrapper.removeChild(data.textureEntity);
            data.textureEntity.classList.add('tinted');
            // textureMap.delete(glTexture);
            calculateSize();
    
            return WebGLRenderingContext.prototype.deleteTexture.apply(this, arguments);
            
        }
​
        gl.texImage2D = function()
        {
            const glTexture = gl.getParameter(getTextureMap[arguments[0]]);
            const data = textureMap.get(glTexture);
            let gpuMemory = 0;
            let width = 0;
            let height = 0;
            
            if(arguments.length === 9)
            {
                width = arguments[3];
                height = arguments[4];
                gpuMemory = width * height;  
                const bytesPerPixel = formatMap[arguments[2]] * typeMap[arguments[7]];
                
                if(!bytesPerPixel)
                {
                    console.warn('byte size per pixel for texture is unknown')
                }
                
                data.width = width
                data.height = height
                gpuMemory *= bytesPerPixel;
            }
            else if(arguments.length === 6)
            {
                width = arguments[5].width;
                height = arguments[5].height;               
                gpuMemory = width * height;
                const bytesPerPixel = formatMap[arguments[2]] * typeMap[arguments[4]];
​
                if(!bytesPerPixel)
                {
                    console.warn('byte size per pixel for texture is unknown')
                }
                
                gpuMemory *= bytesPerPixel;
                data.source = arguments[5];
                const sourceURL = data.source.src;               
                data.width = width
                data.height = height
​
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
                const mbSize = convertByteToMegaBytes(gpuMemory);

                textureWrapper.classList.add('texture-wrapper');
                textureInfo.classList.add('texture-info');
                extraInfo.classList.add('extra-info');
                data.source.classList.add('texture');

                dimension.innerHTML = `<span>&#127924;</span>&nbsp;&nbsp;${data.width} X ${data.height}`;
                size.innerHTML = `<span>&#128190;</span>&nbsp;${mbSize < 1 ? `${convertByteToKiloBytes(gpuMemory)}&nbsp;KB` : `${mbSize}&nbsp;MB`}`;

                // Setup hidden texture card hover content
                extraInfo.appendChild(textureName);
                if(sourceURL)
                {
                    textureName.innerText = sourceURL.substring(sourceURL.lastIndexOf('/')+1, sourceURL.indexOf('?') !== -1?  sourceURL.indexOf('?') : sourceURL.length);
                    const textureButton = document.createElement('div');
                    textureButton.innerText = 'OPEN';
                    textureButton.classList.add('link-btn');
                    textureButton.onclick = function () {
                        // WIP - Need to find a way to open locally on file explorer
                        window.open(sourceURL,'_blank');
                    }
                    extraInfo.appendChild(textureButton);

                }
                else
                {
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

            data.size = gpuMemory
            calculateSize();
            WebGLRenderingContext.prototype.texImage2D.apply(this, arguments);           
        }
    } 
    
    updateScrollShadows();

    return context;
}
​
function calculateSize()
{
    let totalSize = 0;
    const activeTextures = [];
​
    textureMap.forEach((data)=>{
        const realSize = data.size * (data.mipped ? 2 : 1);
        totalSize += realSize;
        activeTextures.push(data);
        const dimensions = data;
        const mb = convertByteToMegaBytes(realSize);
    });
​
    // const footprintMediumThreshold = 50;
    // const footprintHighThreshold = 100;
    const mbSize = convertByteToMegaBytes(totalSize);

    console.log('>>>>>>> active textures', activeTextures);
    console.log(`>>>>>>> GPU Texture footprint: ${convertByteToMegaBytes(totalSize)}mb`);
    gpuFootprintText.innerHTML = `<span>${mbSize} MB</span>`;
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
​
function convertByteToMegaBytes(bytes)
{
    bytes /= 1048576
    bytes*=100;
    bytes = Math.floor(bytes);
    bytes/=100;
​
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
    const offset = 100;
        
    if (entitiesWrapper.scrollTop < offset)
    {
        edgeShadowsTop.classList.add('hidden');
    }
    else
    {
        edgeShadowsTop.classList.remove('hidden');
    }

    if (entitiesWrapper.scrollTop > (entitiesWrapper.scrollHeight - entitiesWrapper.clientHeight) - offset)
    {
        edgeShadowsBottom.classList.add('hidden');
    }
    else
    {
        edgeShadowsBottom.classList.remove('hidden');
    }
}