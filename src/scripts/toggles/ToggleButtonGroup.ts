import { Signal } from 'typed-signals';

import { ToggleButton, ToggleType } from './ToggleButton';

export class ToggleButtonGroup
{
    div: HTMLDivElement;
    textureButton = new ToggleButton({ type: ToggleType.NORMAL, text: 'Textures' });
    miscButton = new ToggleButton({ type: ToggleType.NORMAL, text: 'Misc' });
    activeButton = new ToggleButton({ type: ToggleType.ACTIVE, text: 'Active' });
    deletedButton = new ToggleButton({ type: ToggleType.DELETED, text: 'Deleted' });

    updateList = new Signal();

    init(): void
    {
        this.div = document.createElement('div');
        this.div.id = 'filter-buttons-group';

        this.textureButton.init(this.div);
        this.miscButton.init(this.div);
        this.activeButton.init(this.div);
        this.deletedButton.init(this.div);
    }

    public setupListeners(): void
    {
        this.textureButton.setupListeners();
        this.textureButton.updateList.connect(() => this.updateList.emit());

        this.miscButton.setupListeners();
        this.miscButton.updateList.connect(() => this.updateList.emit());

        this.activeButton.setupListeners();
        this.activeButton.updateList.connect(() => this.updateList.emit());

        this.deletedButton.setupListeners();
        this.deletedButton.updateList.connect(() => this.updateList.emit());
    }
}
