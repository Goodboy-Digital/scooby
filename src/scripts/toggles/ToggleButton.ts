import { Signal } from 'typed-signals';

export enum ToggleType
    {
    ACTIVE='active',
    DELETED='deleted',
    NORMAL='normal',
    KILL='kill',
}

export enum ToggleAction
    {
    UPDATE_LIST,
    TOGGLE_KILL_CREATE_IMAGE_BITMAP,
}

export interface ToggleButtonData
{
    type: ToggleType,
    text: string,
    action?: ToggleAction,
}

export class ToggleButton
{
    public div: HTMLDivElement;
    public onClicked = new Signal();

    private action: ToggleAction;
    private type: ToggleType;
    private text: string;

    constructor(data: ToggleButtonData)
    {
        this.type = data.type;
        this.text = data.text;
        this.action = data.action || ToggleAction.UPDATE_LIST;
    }

    /**
     * Creates the html elements and attaches to a parent
     * @param parent - element to be attached too
     */
    public init(parent: HTMLDivElement): void
    {
        this.div = document.createElement('div');
        this.div.classList.add('filter-button', this.type);
        this.div.classList.add('filter-button', 'toggled');
        this.div.innerHTML = `<h4>${this.text}</h4>`;

        parent.appendChild(this.div);
    }

    /**
     * sets up the onclick listener for the div
     */
    public setupListeners(): void
    {
        this.div.onclick = () =>
        {
            if (this.div.classList.contains('toggled'))
            {
                this.div.classList.remove('toggled');
            }
            else
            {
                this.div.classList.add('toggled');
            }

            this.onClicked.emit(this.action);
        };
    }

    /**
     * Checks if the div classList contains a certain id
     * @param type - class id to check
     */
    public contains(type: string): boolean
    {
        return this.div.classList.contains(type);
    }
}
