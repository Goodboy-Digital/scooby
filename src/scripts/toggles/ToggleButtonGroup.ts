import { Signal } from 'typed-signals';

import { ToggleButton, ToggleType } from './ToggleButton';

export class ToggleButtonGroup
{
    public div: HTMLDivElement;
    public textureButton = new ToggleButton({ type: ToggleType.NORMAL, text: 'Textures' });
    public miscButton = new ToggleButton({ type: ToggleType.NORMAL, text: 'Misc' });
    public bitmapButton = new ToggleButton({ type: ToggleType.KILL, text: 'Kill CIB' });
    public activeButton = new ToggleButton({ type: ToggleType.ACTIVE, text: 'Active' });
    public deletedButton = new ToggleButton({ type: ToggleType.DELETED, text: 'Deleted' });

    public updateList = new Signal();
    public updateCreateImageBitmap = new Signal();

    /**
     * Creates the html elements and initialises the buttons
     */
    public init(): void
    {
        this.div = document.createElement('div');
        this.div.id = 'filter-buttons-group';

        this.textureButton.init(this.div);
        this.miscButton.init(this.div);
        this.activeButton.init(this.div);
        this.deletedButton.init(this.div);
        this.bitmapButton.init(this.div);
    }

    /**
     * connects to all the buttons signals
     */
    public setupListeners(): void
    {
        this.textureButton.setupListeners();
        this.textureButton.updateList.connect(() => this.updateList.emit());

        this.miscButton.setupListeners();
        this.miscButton.updateList.connect(() => this.updateList.emit());

        this.bitmapButton.setupListeners();
        this.bitmapButton.updateList.connect(() => this.updateCreateImageBitmap.emit());

        this.activeButton.setupListeners();
        this.activeButton.updateList.connect(() => this.updateList.emit());

        this.deletedButton.setupListeners();
        this.deletedButton.updateList.connect(() => this.updateList.emit());
    }
}
