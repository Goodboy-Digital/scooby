import { ENV, settings } from 'pixi.js';
import '../styles/textureMonitor.scss';
​
const realFunction = HTMLCanvasElement.prototype.getContext;
​
settings.PREFER_ENV = ENV.WEBGL;
​
const textureMap = new Map();
​
HTMLCanvasElement.prototype.getContext = function(type, options){
​
    const context = realFunction.call(this,type, options);
    const sizes = 100;
​
    if(type === 'webgl' || type === 'experimental-webgl')
    {
        const rootDomElement = document.createElement('div');
        document.body.appendChild(rootDomElement);

        rootDomElement.classList.add("texture-monitor-panel");
        rootDomElement.style.position = 'absolute';
        rootDomElement.style.left = '0px';
        rootDomElement.style.bottom = '0px';
        rootDomElement.style.zIndex = '1000000';
        rootDomElement.style.pointerEvents = 'none';
        console.log("----======Texture monitoring enabled!======----")
        const gl = context as WebGLRenderingContext;
​
        const typeMap = {}
        const formatMap = {}
        
        typeMap[gl.UNSIGNED_BYTE] = 1;
        typeMap[gl.UNSIGNED_SHORT_4_4_4_4] = 0.5;
        typeMap[36193] = 2;
        typeMap[gl.FLOAT] = 4;
​
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
            
            const domElement = document.createElement('div');
​
            const detail =  document.createElement('p');
            detail.innerText = '100x100';
          //  detail.style.position = 'absolute';
          //  detail.style.top = '0';
          //  detail.style.left = '0';
            detail.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
            // domElement.detail = detail;
            
            domElement.appendChild(detail);
            
            textureMap.set(glTexture, {size:0, width:0, height:0, mipped:false, source:null, domElement});
        
            return glTexture;
        }
​
        gl.generateMipmap = function()
        {
            const glTexture = arguments[0];
​
            const webGLTexture = gl.getParameter(getTextureMap[glTexture]);
        
            textureMap.get(webGLTexture).mipped = true;
​
            calculateSize();
            
            return WebGLRenderingContext.prototype.generateMipmap.apply(this, arguments);
        }
​
        gl.deleteTexture = function(){
            
            const glTexture = arguments[0];
​
            const data = textureMap.get(glTexture);
​
            rootDomElement.removeChild(data.domElement);
            
            textureMap.delete(glTexture);
​
            calculateSize();
    
            return WebGLRenderingContext.prototype.deleteTexture.apply(this, arguments);
            
        }
​
        /**
        void gl.texImage2D(target, level, internalformat, width, height, border, format, type, ArrayBufferView? pixels);
        void gl.texImage2D(target, level, internalformat, format, type, ImageData? pixels);
        void gl.texImage2D(target, level, internalformat, format, type, HTMLImageElement? pixels);
        void gl.texImage2D(target, level, internalformat, format, type, HTMLCanvasElement? pixels);
        void gl.texImage2D(target, level, internalformat, format, type, HTMLVideoElement? pixels);
        void gl.texImage2D(target, level, internalformat, format, type, ImageBitmap? pixels);
        */
        gl.texImage2D = function()
        {
           // console.log(getTextureMap, arguments)
            const glTexture = gl.getParameter(getTextureMap[arguments[0]]);
​
            const data = textureMap.get(glTexture);
            
            let gpuMemory = 0;
            let width = 0;
            let height = 0;
            
            if(arguments.length === 9)
            {
                width = arguments[3];
                height = arguments[4];
​
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
​
                const bytesPerPixel = formatMap[arguments[2]] * typeMap[arguments[4]];
​
                if(!bytesPerPixel)
                {
                    console.warn('byte size per pixel for texture is unknown')
                }
                
                gpuMemory *= bytesPerPixel;
​
                data.source = arguments[5];
​
                data.width = width
                data.height = height
​
                rootDomElement.appendChild(data.domElement);
                data.domElement.appendChild(data.source);
​
                // data.source.style.position = 'absolute';
                // data.source.style.top = '0';
                // data.source.style.left = '0';
               // data.source.style.position = 'relative';
                //data.source.style.padding = '2px';
                data.source.style.width = `${sizes}px`;
                data.source.style.border = '1px solid red';
                
            }
            
​

            data.size = gpuMemory
            //console.log(">>>>>>>"+ width+'x'+height+' size '+gpuMemory, data.source?.src ?? data.source)
            calculateSize();
            WebGLRenderingContext.prototype.texImage2D.apply(this, arguments);
            
            
        }
    } 
    
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
​
        totalSize += realSize;
​
        activeTextures.push(data);
​
        const dimensions = data;
​
        const mb = convertByteToMegaBytes(realSize);
​
        // data.domElement.detail.fon
        // data.domElement.detail.innerText = `${data.width}x${data.height}: ${mb}mb`;
    });
​
//    totalSize = ;
​
    //size /= 4;

    console.log('>>>>>>> active textures', activeTextures);
    console.log(`>>>>>>> GPU Texture footprint: ${convertByteToMegaBytes(totalSize)}mb`);
    
}
​
function convertByteToMegaBytes(bytes)
{
    bytes /= 1048576///1000000;
    bytes*=100;
    bytes = Math.floor(bytes);
    bytes/=100;
​
    return bytes;
}