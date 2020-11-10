import { Signal } from 'typed-signals';

import { ToggleButton, ToggleButtonData } from './ToggleButton';

export interface ToggleButtonGroupData
{
    text: string,
    buttonsData: Record<string, ToggleButtonData>,
}

export class ToggleButtonGroup
{
    div: HTMLDivElement;
    text: string;
    buttons: Record<string, ToggleButton>;

    onToggled = new Signal();

    constructor(data: ToggleButtonGroupData)
    {
        this.text = data.text;
        this.buttons = {};

        for (const key in data.buttonsData)
        {
            this.buttons[key] = new ToggleButton(data.buttonsData[key]);
        }
    }

    init(parent: HTMLDivElement): void
    {
        this.div = document.createElement('div');
        this.div.id = 'filter-buttons-group';
        this.div.innerHTML = `<h4>${this.text}:</h4>`;

        Object.values(this.buttons).forEach((button) => button.init(this.div));
        parent.appendChild(this.div);
    }

    /**
     * connects to all the buttons signals
     */
    public setupListeners(): void
    {
        Object.values(this.buttons).forEach((button) =>
        {
            button.setupListeners();
            button.onToggled.connect((action) => this.onToggled.emit(action));
        });
    }
}
