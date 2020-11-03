import { TextureCard } from './TextureCard';
import { ToggleButton } from './toggles/ToggleButton';
import { ToggleButtonGroup } from './toggles/ToggleButtonGroup';
import { attachToDocument } from './utils/attachToDocument';
import { calculateSize } from './utils/calculateFileSize';
import { calculateTextureSize } from './utils/calculateTextureSize';
import { convertToScrollContainer } from './utils/scrollContainer';

// html stuff
export interface TextureData
{
    size: number,
    width: number,
    height: number,
    mipped: boolean,
    source: HTMLImageElement,
    cardHolder: HTMLDivElement
}

export enum WebGLRenderingContexts
    {
    WEBGL = 'webgl',
    EXPERIMENTAL_WEBGL = 'experimental-webgl',
    WEBGL2 = 'webgl2',
    EXPERIMENTAL_WEBGL2 = 'experimental-webgl2',
}

export class TextureMonitor
{
    public static contextNames = ['webgl', 'experimental-webgl', 'webgl2', 'experimental-webgl2'];
    private _textureMap: Map<WebGLTexture, TextureData> = new Map();
    private _toggle: HTMLDivElement;
    private _container: HTMLDivElement;
    private _cardWrapper: HTMLDivElement;
    private _memorySizeText: HTMLHeadingElement;
    private _toggleArrow: HTMLHeadingElement;
    private _toggleButtonGroup: ToggleButtonGroup;
    private _initialized = false;
    private _toAdd: Array<HTMLDivElement> = [];

    static generateTypeMap(gl: WebGLRenderingContext): Record<GLenum, number>
    {
        const typeMap: Record<GLenum, number> = {};

        typeMap[gl.UNSIGNED_BYTE] = 1;
        typeMap[gl.UNSIGNED_SHORT_4_4_4_4] = 0.5;
        typeMap[36193] = 2;
        typeMap[gl.FLOAT] = 4;

        return typeMap;
    }

    static generateFormatMap(gl: WebGLRenderingContext): Record<GLenum, number>
    {
        const formatMap: Record<GLenum, number> = {};

        formatMap[gl.RGBA] = 4;
        formatMap[gl.RGB] = 3;

        return formatMap;
    }

    static generateTextureMap(gl: WebGLRenderingContext): Record<GLenum, number>
    {
        const textureMap: Record<GLenum, number> = {};

        textureMap[gl.TEXTURE_2D] = gl.TEXTURE_BINDING_2D;
        textureMap[gl.TEXTURE_CUBE_MAP] = gl.TEXTURE_BINDING_CUBE_MAP;
        textureMap[gl.TEXTURE_CUBE_MAP_NEGATIVE_X] = gl.TEXTURE_BINDING_CUBE_MAP;
        textureMap[gl.TEXTURE_CUBE_MAP_NEGATIVE_Y] = gl.TEXTURE_BINDING_CUBE_MAP;
        textureMap[gl.TEXTURE_CUBE_MAP_NEGATIVE_Z] = gl.TEXTURE_BINDING_CUBE_MAP;
        textureMap[gl.TEXTURE_CUBE_MAP_POSITIVE_X] = gl.TEXTURE_BINDING_CUBE_MAP;
        textureMap[gl.TEXTURE_CUBE_MAP_POSITIVE_Y] = gl.TEXTURE_BINDING_CUBE_MAP;
        textureMap[gl.TEXTURE_CUBE_MAP_POSITIVE_Z] = gl.TEXTURE_BINDING_CUBE_MAP;

        return textureMap;
    }

    static getContextType(contextType: string): WebGLRenderingContext|WebGL2RenderingContext
    {
        switch (contextType)
        {
            case WebGLRenderingContexts.WEBGL:
            case WebGLRenderingContexts.EXPERIMENTAL_WEBGL:
                return WebGLRenderingContext.prototype;
            case WebGLRenderingContexts.WEBGL2:
            case WebGLRenderingContexts.EXPERIMENTAL_WEBGL2:
                return WebGL2RenderingContext.prototype;
        }

        return null;
    }

    public init(): void
    {
        this._toggle = document.createElement('div');
        this._container = document.createElement('div');
        this._cardWrapper = document.createElement('div');
        this._memorySizeText = document.createElement('h3');
        this._toggleArrow = document.createElement('h3');
        this._toggleButtonGroup = new ToggleButtonGroup();

        this._toggleButtonGroup.init();
        this._toggle.classList.add('monitor-toggle');
        this._container.id = 'texture-monitor-container';
        this._cardWrapper.classList.add('entities-wrapper');
        this._toggleArrow.id = 'toggle-chevron';
        this._toggleArrow.innerHTML = `&#x25B2;`;

        this._toggle.appendChild(this._toggleArrow);
        this._toggle.appendChild(this._memorySizeText);

        attachToDocument(this._container);

        this._container.appendChild(this._toggle);
        this._container.appendChild(this._cardWrapper);
        this._container.appendChild(this._toggleButtonGroup.div);

        this._initCreateImageBitmap();
        this._setupListeners();

        this._initialized = true;

        this._firstList();
    }

    public createTextureCard(glTexture: WebGLTexture): void
    {
        const textureCard = document.createElement('div');

        textureCard.classList.add('texture-entity');

        this._textureMap.set(glTexture, {
            size: 0,
            width: 0,
            height: 0,
            mipped: false,
            source: null,
            cardHolder: textureCard,
        });
    }

    public generateMipmap(webGLTexture: WebGLTexture): void
    {
        this._textureMap.get(webGLTexture).mipped = true;

        if (this._initialized)
        { this._memorySizeText.innerHTML = `<span>${calculateSize(this._textureMap)}</span>`; }
    }

    public deleteTexture(glTexture: WebGLTexture): void
    {
        const data = this._textureMap.get(glTexture);

        data.cardHolder.classList.remove('type-active');
        data.cardHolder.classList.add('type-deleted');

        if (this._initialized)
        {
            this._memorySizeText.innerHTML = `<span>${calculateSize(this._textureMap)}</span>`;
        }
    }

    public texImage2d(args: IArguments,
        formatMap:Record<GLenum, number>,
        typeMap:Record<GLenum, number>,
        glTexture: WebGLTexture,
    ): void
    {
        const { width, height, gpuMemory } = calculateTextureSize(args, formatMap, typeMap);
        const data = this._textureMap.get(glTexture);

        data.width = width;
        data.height = height;
        data.size = gpuMemory;

        if (args.length !== 6) return;

        data.source = args[5];

        if (data.cardHolder.children.length > 0)
        {
            // resets texture entity
            data.cardHolder.innerHTML = '';
        }

        // if nothing has been started then add this to a list of things

        const card = new TextureCard();

        card.init(data, gpuMemory);

        if (this._initialized)
        {
            this._cardWrapper.appendChild(data.cardHolder);
            this._memorySizeText.innerHTML = `<span>${calculateSize(this._textureMap)}</span>`;
        }
        else
        {
            this._toAdd.push(data.cardHolder);
        }
    }

    private _setupListeners(): void
    {
        this._toggle.onclick = () =>
        {
            if (this._container.classList.contains('toggled'))
            {
                this._container.classList.remove('toggled');
            }
            else
            {
                this._container.classList.add('toggled');
            }
        };

        this._toggleButtonGroup.setupListeners();
        this._toggleButtonGroup.updateList.connect(() => this._updateList());
        this._toggleButtonGroup.updateCreateImageBitmap.connect(() => this._updateCreateImageBitmap());

        convertToScrollContainer(this._cardWrapper);
    }

    public _initCreateImageBitmap(): void
    {
        (window as any).defaultCreateImageBitmap = window.createImageBitmap;
        this._updateCreateImageBitmap();
    }

    public _updateCreateImageBitmap(): void
    {
        if (window.createImageBitmap)
        {
            window.createImageBitmap = null;
        }
        else
        {
            window.createImageBitmap = (window as any).defaultCreateImageBitmap;
        }
    }

    private _firstList(): void
    {
        this._memorySizeText.innerHTML = `<span>${calculateSize(this._textureMap)}</span>`;

        this._toAdd.forEach((add) =>
        {
            this._cardWrapper.appendChild(add);
        });

        this._toAdd.length = 0;
    }

    private _updateList(): void
    {
        const deleted = this._toggleButtonGroup.deletedButton.contains('toggled');
        const active = this._toggleButtonGroup.activeButton.contains('toggled');
        let entities = document.querySelectorAll('.texture-entity');

        entities.forEach((entity: Element) =>
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

        entities.forEach((entity: Element) =>
        {
            const cb = (button: ToggleButton, entity:Element, type:string) =>
            {
                if (button.contains('toggled'))
                {
                    if (entity.classList.contains(type))
                    {
                        entity.classList.remove('display-none');
                    }
                }
            };

            cb(this._toggleButtonGroup.textureButton, entity, 'type-texture');
            cb(this._toggleButtonGroup.miscButton, entity, 'type-misc');
        });
    }
}
