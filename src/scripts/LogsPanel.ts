export class LogsPanel
{
    public div: HTMLDivElement;
    public clearButton: HTMLDivElement;

    private text: HTMLParagraphElement;
    private logs: string[];

    public init(): void
    {
        this.div = document.createElement('div');
        this.div.id = 'logs-wrapper';

        this.text = document.createElement('p');

        this.clearButton = document.createElement('div');
        this.clearButton.id = 'clear-button';
        this.clearButton.innerHTML = 'CLEAR';
        this.clearButton.onclick = this.clear.bind(this);

        this.div.appendChild(this.text);
        this.div.appendChild(this.clearButton);

        this.logs = [];
    }

    public log(message: string): void
    {
        this.logs.push(message);
        this._updateLogs();
    }

    public clear(): void
    {
        this.logs = [];
        this._updateLogs();
    }

    private _updateLogs(): void
    {
        const date = new Date();
        let accumulator = '';

        this.logs.forEach((log) =>
        {
            accumulator += `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] ${log}<br><br>`;
        });

        this.text.innerHTML = accumulator;
    }
}
