/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable camelcase */

const __Origin_EXTENSION_GetContext = HTMLCanvasElement.prototype.getContext;

// @ts-ignore
HTMLCanvasElement.prototype.__Origin_EXTENSION_GetContext = __Origin_EXTENSION_GetContext;
// @ts-ignore
HTMLCanvasElement.prototype.getContext = function ()
{
    let context = null;

    if (!arguments.length)
    {
        return context;
    }

    if (arguments.length === 1)
    {
        context = this.__Origin_EXTENSION_GetContext(arguments[0]);
        if (context === null)
        {
            return context;
        }
    }
    else if (arguments.length === 2)
    {
        context = this.__Origin_EXTENSION_GetContext(arguments[0], arguments[1]);
        if (context === null)
        {
            return context;
        }
    }

    const contextNames = ['webgl', 'experimental-webgl'];

    if (contextNames.indexOf(arguments[0]) !== -1)
    {
        const gl = context as unknown as WebGLRenderingContext;
        const typeMap: Record<GLenum, number> = {};
        const formatMap: Record<GLenum, number> = {};

        typeMap[gl.UNSIGNED_BYTE] = 1;
        typeMap[gl.UNSIGNED_SHORT_4_4_4_4] = 0.5;
        typeMap[36193] = 2;
        typeMap[gl.FLOAT] = 4;
        formatMap[gl.RGBA] = 4;
        formatMap[gl.RGB] = 3;

        const getTextureMap:Record<GLenum, GLenum> = {};

        getTextureMap[gl.TEXTURE_2D] = gl.TEXTURE_BINDING_2D;
        getTextureMap[gl.TEXTURE_CUBE_MAP] = gl.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap[gl.TEXTURE_CUBE_MAP_NEGATIVE_X] = gl.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap[gl.TEXTURE_CUBE_MAP_NEGATIVE_Y] = gl.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap[gl.TEXTURE_CUBE_MAP_NEGATIVE_Z] = gl.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap[gl.TEXTURE_CUBE_MAP_POSITIVE_X] = gl.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap[gl.TEXTURE_CUBE_MAP_POSITIVE_Y] = gl.TEXTURE_BINDING_CUBE_MAP;
        getTextureMap[gl.TEXTURE_CUBE_MAP_POSITIVE_Z] = gl.TEXTURE_BINDING_CUBE_MAP;

        // TODO - There will be an issue with cube textures for sure!

        gl.createTexture = function ()
        {
            const glTexture: WebGLTexture = WebGLRenderingContext.prototype.createTexture.apply(this, arguments);

            // Create individual texture entity cards
            const textureEntity = document.createElement('div');

            textureEntity.classList.add('texture-entity');
            textureMap.set(glTexture, { size: 0, width: 0, height: 0, mipped: false, source: null, textureEntity });

            return glTexture;
        };

        gl.generateMipmap = function ()
        {
            const glTexture = arguments[0];
            const webGLTexture = gl.getParameter(getTextureMap[glTexture]);

            textureMap.get(webGLTexture).mipped = true;
            calculateSize();

            return WebGLRenderingContext.prototype.generateMipmap.apply(this, arguments);
        };

        gl.deleteTexture = function ()
        {
            // Feature to be added - accumulating consumption saved + replace duplicate te textures
            const glTexture = arguments[0];
            const data = textureMap.get(glTexture);

            data.textureEntity.classList.remove('type-active');
            data.textureEntity.classList.add('type-deleted');
            calculateSize();

            return WebGLRenderingContext.prototype.deleteTexture.apply(this, arguments);
        };

        gl.texImage2D = function ()
        {
            const glTexture = gl.getParameter(getTextureMap[arguments[0]]);
            const data = textureMap.get(glTexture);
            let gpuMemory = 0;
            let width = 0;
            let height = 0;

            if (arguments.length === 9)
            {
                width = arguments[3];
                height = arguments[4];
                gpuMemory = width * height;
                const bytesPerPixel = formatMap[arguments[2]] * typeMap[arguments[7]];

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
                const bytesPerPixel = formatMap[arguments[2]] * typeMap[arguments[4]];

                if (!bytesPerPixel)
                {
                    console.warn('byte size per pixel for texture is unknown');
                }

                gpuMemory *= bytesPerPixel;
                data.source = arguments[5];
                const sourceURL = data.source.src;

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
                const mbSize = convertByteToMegaBytes(gpuMemory);

                textureWrapper.classList.add('texture-wrapper');
                textureInfo.classList.add('texture-info');
                extraInfo.classList.add('extra-info');
                data.source.classList.add('texture');

                dimension.innerHTML = `<span>&#127924;</span>&nbsp;&nbsp;${data.width} X ${data.height}`;
                // eslint-disable-next-line max-len
                size.innerHTML = `<span>&#128190;</span>&nbsp;${mbSize < 1 ? `${convertByteToKiloBytes(gpuMemory)}&nbsp;KB` : `${mbSize}&nbsp;MB`}`;

                data.textureEntity.classList.add('type-active');

                // Setup hidden texture card hover content
                extraInfo.appendChild(textureName);
                if (sourceURL)
                {
                    textureName.innerText = sourceURL.substring(
                        sourceURL.lastIndexOf('/') + 1,
                        sourceURL.indexOf('?') !== -1 ? sourceURL.indexOf('?') : sourceURL.length,
                    );
                    const textureButton = document.createElement('div');

                    textureButton.innerText = 'OPEN';
                    textureButton.classList.add('link-btn');
                    textureButton.onclick = function ()
                    {
                        // WIP - Need to find a way to open locally on file explorer
                        window.open(sourceURL, '_blank');
                    };
                    extraInfo.appendChild(textureButton);
                    data.textureEntity.classList.add('type-texture');
                }
                else
                {
                    textureName.innerText = '???';
                    data.textureEntity.classList.add('type-misc');
                }

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
