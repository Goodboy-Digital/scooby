import { Signal } from 'typed-signals';

export enum ToggleType
    {
    ACTIVE='active',
    DELETED='deleted',
    NORMAL='normal',
}

export interface ToggleButtonData
{
    type: ToggleType,
    text: string,
}

export class ToggleButton
{
    div: HTMLDivElement;
    type: ToggleType;
    text: string;

    updateList = new Signal();

    constructor(data: ToggleButtonData)
    {
        this.type = data.type;
        this.text = data.text;
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

            this.updateList.emit();
        };
    }

    public contains(type: string): boolean
    {
        return this.div.classList.contains(type);
    }
}
