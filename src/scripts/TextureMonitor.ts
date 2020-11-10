import { TextureCard } from './TextureCard';
import { ToggleButton } from './toggles/ToggleButton';
import { ToggleButtonGroup } from './toggles/ToggleButtonGroup';
import { attachToDocument } from './utils/document/attachToDocument';
import { convertToScrollContainer } from './utils/scrollContainer';
import { calculateSize } from './utils/textures/calculateFileSize';
import { calculateTextureSize } from './utils/textures/calculateTextureSize';

declare global
{
    interface Window
    {
        defaultCreateImageBitmap: typeof window.createImageBitmap
    }
}

export interface TextureData
{
    size: number,
    width: number,
    height: number,
    mipped: boolean,
    source: HTMLImageElement,
    cardHolder: HTMLDivElement
}

export class TextureMonitor
{
    private static CIB_KEY = 'SCOOBY_REMOVE_CIB';
    private _textureMap: Map<WebGLTexture, TextureData> = new Map();
    private _toggle: HTMLDivElement;
    private _container: HTMLDivElement;
    private _cardWrapper: HTMLDivElement;
    private _memorySizeText: HTMLHeadingElement;
    private _toggleArrow: HTMLHeadingElement;
    private _toggleButtonGroup: ToggleButtonGroup;
    private _initialized = false;
    private _toAdd: Array<HTMLDivElement> = [];

    /**
     * Store a reference to the windows createImageBitmap function and
     * sets the original to null if the kill button is active
     */
    public static overrideCreateImageBitmap(): void
    {
        window.defaultCreateImageBitmap = window.createImageBitmap;

        if (sessionStorage.getItem(TextureMonitor.CIB_KEY) === 'false')
        {
            window.createImageBitmap = null;
        }
    }

    /**
     * Creates all of the html elements needed for the texture monitor to work.
     * Attaches itself to the document.
     * Populates the list with any items that need to be added
     */
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

        if (
            sessionStorage.getItem(TextureMonitor.CIB_KEY) === 'true'
            || sessionStorage.getItem(TextureMonitor.CIB_KEY) === null
        )
        {
            sessionStorage.setItem(TextureMonitor.CIB_KEY, 'true');
            this._toggleButtonGroup.bitmapButton.div.classList.remove('toggled');
        }

        this._setupListeners();

        this._initialized = true;

        this._firstList();
    }

    /**
     * Creates the data needed for a texture card
     * @param glTexture - texture to be stored as a key for its data
     */
    public createTextureCardData(glTexture: WebGLTexture): void
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

    /**
     * Sets the texture card data mipped to be true
     * Recalculates the total memory usage
     * @param webGLTexture - key for texture card data
     */
    public generateMipmap(webGLTexture: WebGLTexture): void
    {
        this._textureMap.get(webGLTexture).mipped = true;

        if (this._initialized)
        { this._memorySizeText.innerHTML = `<span>${calculateSize(this._textureMap)}</span>`; }
    }

    /**
     * Removes a texture card and recalculates total memory usage
     * @param glTexture - key for texture card data
     */
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

    /**
     * Creates a new texture card and adds it to the list
     * @param args - arguments from canvas texImage2d
     * @param formatMap - a map of texture formats
     * @param typeMap - a map of GLenum to byte size
     * @param glTexture - key for texture card data
     */
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

    /**
     * sets up listeners for the toggle buttons
     * and sets the cardWrapper to be scrollable
     */
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

    /**
     * toggles window.createImageBitmap on/off
     */
    private _updateCreateImageBitmap(): void
    {
        if (sessionStorage.getItem(TextureMonitor.CIB_KEY) === 'true')
        {
            window.createImageBitmap = null;
            sessionStorage.setItem(TextureMonitor.CIB_KEY, 'false');
        }
        else
        {
            window.createImageBitmap = window.defaultCreateImageBitmap;
            sessionStorage.setItem(TextureMonitor.CIB_KEY, 'true');
        }
    }

    /**
     * Adds all of the items that where created before the html was created
     */
    private _firstList(): void
    {
        this._memorySizeText.innerHTML = `<span>${calculateSize(this._textureMap)}</span>`;

        this._toAdd.forEach((add) =>
        {
            this._cardWrapper.appendChild(add);
        });

        this._toAdd.length = 0;
    }

    /**
     * updates the texture cards so that they display if they have been deleted or is active
     */
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
