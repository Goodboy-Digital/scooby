import { OptionsPanel } from './toggles/OptionsPanel';

export const MessageColor = {
    WHITE: '#FFFFFF',
    YELLOW: '#FFCC00',
    BLUE: '#0000FF',
    PINK: '#ff66a5',
    RED: '#FF0000',
    RAINBOW: ['#F60000', '#F60000', '#FF8C00', '#FFEE00', '#4DE94C', '#3783FF', '#4815AA'],
}

export interface Message {
    text: string,
    color: string | string[];
}

export class LogsPanel
{
    public div: HTMLDivElement;

    private _clearButton: HTMLDivElement;
    private _text: HTMLParagraphElement;
    private _logs: Message[];

    private _optionsPanel: OptionsPanel;
    private wrapper: HTMLDivElement;

    public init(_optionsPanel: OptionsPanel, wrapper: HTMLDivElement): void
    {
        this.div = document.createElement('div');
        this.div.id = 'logs-wrapper';

        this._text = document.createElement('p');

        this._clearButton = document.createElement('div');
        this._clearButton.id = 'clear-button';
        this._clearButton.innerHTML = 'Clear';
        this._clearButton.onclick = this.clear.bind(this);

        this.div.appendChild(this._text);
        this.div.appendChild(this._clearButton);

        this._logs = [];

        this._optionsPanel = _optionsPanel;
        this.wrapper = wrapper;
        this._optionsPanel.miscGroup.getButton('logs').div.classList.remove('toggled');
        this.toggle();

        this.log('Welcome to Scooby!', MessageColor.RAINBOW);
        this.log('Use window.SCOOBY.log(MESSAGE) to see messages here', MessageColor.YELLOW);
        this.log('TEST NORMAL MESSAGE');
        this.log('TEST COLORED MESSAGE', MessageColor.RED);
        this.log('TEST COLORED MESSAGE', MessageColor.BLUE);
        this.log('TEST COLORED MESSAGE', MessageColor.PINK);
        this.log('TEST COLORED MESSAGE', [MessageColor.RED, MessageColor.BLUE]);
        this.log('TEST COLORED MESSAGE', [MessageColor.RED, MessageColor.BLUE, MessageColor.PINK]);
    }

    /**
     * logs a message to the console
     * @param message - message to be logged
     * @param color - color or shade of colors to be styled
     */
    public log(text: string, color: string | string[] = MessageColor.WHITE): void
    {
        const message: Message = {
            text,
            color,
        }

        this._logs.push(message);
        this._updateLogs();
    }

    /**
     * Clears all messages from the console
     */
    public clear(): void
    {
        this._logs = [];
        this._updateLogs();
    }

    /**
     * Updates the text that is displayed in the console
     */
    private _updateLogs(): void
    {
        const date = new Date();
        let accumulator = '';

        this._logs.forEach((message) =>
        {
            let style;

            if (typeof message.color === 'object')
            {
                let output = "";

                message.color.forEach((color, index) =>
                {
                    output += `, ${color} ${Math.round((index / (message.color.length - 1)) * 100)}%`;
                });

                style = `background: ${message.color[0]}; `;
                style += `background: -moz-linear-gradient(left${output}); `;
                style += `background: -webkit-linear-gradient(left${output}); `;
                style += `background: linear-gradient(to right${output}); `;
                style += `-webkit-background-clip: text; `;
                style += `-webkit-text-fill-color: transparent; `;
            }
            else
            {
                style = `color: ${message.color};`;
            }
            
            accumulator += `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] <span style='${style}'>${message.text}</span><br><br>`;
        });

        this._text.innerHTML = accumulator;
    }

    /**
     * Toggles the visibility of the log panel
     */
    public toggle(): void
    {
        if (this._optionsPanel.miscGroup.getButton('logs').contains('toggled'))
        {
            this.wrapper.style.display = 'none';
            this.div.style.display = 'block';
        }
        else
        {
            this.wrapper.style.display = 'grid';
            this.div.style.display = 'none';
        }
    }
}
