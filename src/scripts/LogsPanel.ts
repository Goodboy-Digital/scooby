import { OptionsPanel } from './toggles/OptionsPanel';

export class LogsPanel
{
    public div: HTMLDivElement;

    private _clearButton: HTMLDivElement;
    private _text: HTMLParagraphElement;
    private _logs: string[];

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

        this.log('Welcome to Scooby!');
        this.log('Use window.SCOOBY.log(MESSAGE) to see messages here');
    }

    /**
     * logs a message to the console
     * @param message - message to be logged
     */
    public log(message: string): void
    {
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

        this._logs.forEach((log) =>
        {
            accumulator += `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] ${log}<br><br>`;
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
