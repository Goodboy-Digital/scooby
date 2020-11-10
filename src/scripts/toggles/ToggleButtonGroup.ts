import { Signal } from 'typed-signals';

import { ToggleButton, ToggleButtonData } from './ToggleButton';

export interface ToggleButtonGroupData
{
    text: string,
    buttonsData: Record<string, ToggleButtonData>,
}

export class ToggleButtonGroup
{
    public div: HTMLDivElement;
    public buttons: Record<string, ToggleButton>;
    public onBtnClicked = new Signal();

    private text: string;

    constructor(data: ToggleButtonGroupData)
    {
        this.text = data.text;
        this.buttons = {};

        for (const key in data.buttonsData)
        {
            this.buttons[key] = new ToggleButton(data.buttonsData[key]);
        }
    }

    /**
     * Creates the html elements and initialises the buttons
     */
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
            button.onClicked.connect((action) => this.onBtnClicked.emit(action));
        });
    }

    /**
     * Returns a button from the group
     * @param id - id of the button you want to get
     */
    public getButton(id: string): ToggleButton
    {
        return this.buttons[id];
    }
}
