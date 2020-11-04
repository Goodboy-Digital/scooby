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
    TOGGLE_KILL_CREATE_IMAGE_BITMAP
}

export interface ToggleButtonData
{
    type: ToggleType,
    text: string,
    action?: ToggleAction,
}

export class ToggleButton
{
    div: HTMLDivElement;
    type: ToggleType;
    text: string;
    action: ToggleAction

    onToggled = new Signal();

    constructor(data: ToggleButtonData)
    {
        this.type = data.type;
        this.text = data.text;
        this.action = data.action || ToggleAction.UPDATE_LIST;
    }

    init(parent: HTMLDivElement): void
    {
        this.div = document.createElement('div');
        this.div.classList.add('filter-button', this.type);
        this.div.classList.add('filter-button', 'toggled');
        this.div.innerHTML = `<h4>${this.text}</h4>`;

        parent.appendChild(this.div);
    }

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

            this.onToggled.emit(this.action);
        };
    }

    public contains(type: string): boolean
    {
        return this.div.classList.contains(type);
    }
}
