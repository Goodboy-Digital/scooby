/* eslint-disable camelcase */
import './styles.scss';

interface TextureData
{
    size: number,
    width: number,
    height: number,
    mipped: boolean,
    source: HTMLImageElement,
    textureEntity: HTMLDivElement
}

const __Origin_EXTENSION_GetContext = HTMLCanvasElement.prototype.getContext;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
HTMLCanvasElement.prototype.__Origin_EXTENSION_GetContext = __Origin_EXTENSION_GetContext;

const textureMap: Map<WebGLTexture, TextureData> = new Map();

// Setting up DOM and utility variables for CSS manipulations
const toggle = document.createElement('div');
const textureMonitorContainer = document.createElement('div');
const edgeShadowsContainer = document.createElement('div');
const edgeShadowsTop = document.createElement('div');
const edgeShadowsBottom = document.createElement('div');
const entitiesWrapper = document.createElement('div');
const toggleText = document.createElement('h3');
const gpuFootprintText = document.createElement('h3');
const toggleChevron = document.createElement('h3');
const filterButtonsGroup = document.createElement('div');
const textureButton = document.createElement('div');
const miscButton = document.createElement('div');
const activeButton = document.createElement('div');
const deletedButton = document.createElement('div');

let isDown = false;
let isToggleDown = false;
let isDragging = false;
let startY: number;
let initialScroll: number;

initTextureMonitor();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

function calculateSize()
{
    let totalSize = 0;
    const activeTextures: TextureData[] = [];

    textureMap.forEach((data) =>
    {
        const realSize = data.size * (data.mipped ? 2 : 1);

        totalSize += realSize;
        activeTextures.push(data);
    });

    const mbSize = convertByteToMegaBytes(totalSize);

    gpuFootprintText.innerHTML = `<span>${mbSize} MB</span>`;
    gpuFootprintText.style.color = 'rgb(48, 188, 243)';
}

function convertByteToMegaBytes(bytes: number)
{
    bytes /= 1048576;
    bytes *= 100;
    bytes = Math.floor(bytes);
    bytes /= 100;

    return bytes;
}

function convertByteToKiloBytes(bytes: number)
{
    bytes /= 1024;
    bytes *= 100;
    bytes = Math.floor(bytes);
    bytes /= 100;

    return bytes;
}

function checkIsMobile()
{
    const check = false;

    return check;
}

// ---------------------------- CSS Manipulations ----------------------------

function initTextureMonitor()
{
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

    toggleText.innerHTML = `&nbsp;&nbsp;TEXTURES&nbsp;`;
    toggleChevron.innerHTML = `&#x25B2;`;
    textureButton.innerHTML = `<h4>&#127924;</h4>`;
    miscButton.innerHTML = `<h4>&#128291;</h4>`;
    activeButton.innerHTML = `<h4>&#128994;</h4>`;
    deletedButton.innerHTML = `<h4>&#10060;</h4>`;

    toggle.appendChild(toggleChevron);
    toggle.appendChild(toggleText);
    toggle.appendChild(gpuFootprintText);
    edgeShadowsContainer.appendChild(edgeShadowsTop);
    edgeShadowsContainer.appendChild(edgeShadowsBottom);
    filterButtonsGroup.appendChild(textureButton);
    filterButtonsGroup.appendChild(miscButton);
    filterButtonsGroup.appendChild(activeButton);
    filterButtonsGroup.appendChild(deletedButton);

    const targets = [document.body, document.head, document.documentElement];

    for (let n = 0; n < targets.length; n++)
    {
        const target = targets[n];

        if (target)
        {
            if (target.firstElementChild)
            {
                target.insertBefore(textureMonitorContainer, target.firstElementChild);
            }
            else
            {
                target.appendChild(textureMonitorContainer);
            }
            break;
        }
    }
    textureMonitorContainer.appendChild(toggle);
    textureMonitorContainer.appendChild(entitiesWrapper);
    textureMonitorContainer.appendChild(edgeShadowsContainer);
    textureMonitorContainer.appendChild(filterButtonsGroup);

    // Fix monitor panel height to maximum height on mobile devices ** Need to find ways to implement drag to scale on mobile later without causing issues **
    if (checkIsMobile())
    {
        textureMonitorContainer.style.height = '75vh';
    }

    setupListeners();
}

function setupListeners()
{
    // Set up toggles
    toggle.onclick = function ()
    {
        if (isDragging)
        {
            isDragging = false;

            return;
        }

        if (textureMonitorContainer.classList.contains('toggled'))
        {
            textureMonitorContainer.classList.remove('toggled');
        }
        else
        {
            textureMonitorContainer.classList.add('toggled');
        }
    };

    textureButton.onclick = function ()
    {
        if (textureButton.classList.contains('toggled'))
        {
            textureButton.classList.remove('toggled');
        }
        else
        {
            textureButton.classList.add('toggled');
        }

        updateList();
    };

    miscButton.onclick = function ()
    {
        if (miscButton.classList.contains('toggled'))
        {
            miscButton.classList.remove('toggled');
        }
        else
        {
            miscButton.classList.add('toggled');
        }

        updateList();
    };

    activeButton.onclick = function ()
    {
        if (activeButton.classList.contains('toggled'))
        {
            activeButton.classList.remove('toggled');
        }
        else
        {
            activeButton.classList.add('toggled');
        }

        updateList();
    };

    deletedButton.onclick = function ()
    {
        if (deletedButton.classList.contains('toggled'))
        {
            deletedButton.classList.remove('toggled');
        }
        else
        {
            deletedButton.classList.add('toggled');
        }

        updateList();
    };

    // Set up desktop drag to scroll
    document.addEventListener('mousedown', function (e: MouseEvent)
    {
        if (!(e.target === entitiesWrapper || entitiesWrapper.contains((e.target as Node)) || e.target === toggle)) return;

        if (e.target === toggle) isToggleDown = true;
        else
        {
            isDown = true;
            startY = e.pageY;
            initialScroll = entitiesWrapper.scrollTop;
        }
    });

    document.addEventListener('mouseup', function ()
    {
        isDown = false;
        isToggleDown = false;
    });

    document.addEventListener('mousemove', function (e)
    {
        if (!isDown && !isToggleDown) return;
        if (isDown)
        {
            entitiesWrapper.scrollTo(0, initialScroll + (startY - e.pageY));
        }
        if (isToggleDown)
        {
            isDragging = true;
            if (!textureMonitorContainer.classList.contains('toggled'))
            {
                textureMonitorContainer.classList.add('toggled');
                isDragging = false;
            }

            const percentHeight = ((window.innerHeight - e.clientY) / window.innerHeight) * 100;

            if (percentHeight > 30 && percentHeight < 90)
            {
                textureMonitorContainer.style.height = `${percentHeight}vh`;
            }
            else isDragging = false;
        }
    });

    entitiesWrapper.onscroll = function (e)
    {
        e.preventDefault();
        updateScrollShadows();
    };
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

function updateList()
{
    const deleted = deletedButton.classList.contains('toggled');
    const active = activeButton.classList.contains('toggled');
    let entities = document.querySelectorAll('.texture-entity');

    Array.prototype.forEach.call(entities, function (entity: Element)
    {
        entity.classList.add('display-none');
    });

    if (!(deleted && active))
    {
        if (deleted)
        {
            entities = document.querySelectorAll('.type-deleted');
        }

        if (active)
        {
            entities = document.querySelectorAll('.type-active');
        }
    }

    // For IE Support, use call instead of direct forEach **
    Array.prototype.forEach.call(entities, function (entity: Element)
    {
        if (textureButton.classList.contains('toggled'))
        {
            if (entity.classList.contains('type-texture'))
            {
                entity.classList.remove('display-none');
            }
        }

        if (miscButton.classList.contains('toggled'))
        {
            if (entity.classList.contains('type-misc'))
            {
                entity.classList.remove('display-none');
            }
        }
    });
}
