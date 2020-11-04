import { Signal } from 'typed-signals';
import { ToggleType } from './ToggleButton';
import { ToggleButtonGroup } from './ToggleButtonGroup';

export class OptionsPanel
{
    div: HTMLDivElement;
    typeGroup = new ToggleButtonGroup({
        text: 'type',
        buttonsData: {
            texture: { type: ToggleType.NORMAL, text: 'Textures' },
            misc: { type: ToggleType.NORMAL, text: 'Others' }
        }
    });
    statusGroup = new ToggleButtonGroup({
        text: 'status',
        buttonsData: {
            active: { type: ToggleType.ACTIVE, text: 'Active' },
            deleted: { type: ToggleType.DELETED, text: 'Deleted' },
        }
    });
    miscGroup = new ToggleButtonGroup({
        text: 'misc',
        buttonsData: {
            bitmap: { type: ToggleType.KILL, text: 'Kill createImageBitmap' },
        }
    });

    onToggled = new Signal();

    init(): void
    {
        this.div = document.createElement('div');
        this.div.id = 'options-panel';

        this.typeGroup.init(this.div);
        this.statusGroup.init(this.div);
        this.miscGroup.init(this.div);
    }

    public setupListeners(): void
    {
        this.typeGroup.setupListeners();
        this.typeGroup.onToggled.connect((action) => this.onToggled.emit(action));

        this.statusGroup.setupListeners();
        this.statusGroup.onToggled.connect((action) => this.onToggled.emit(action));

        this.miscGroup.setupListeners();
        this.miscGroup.onToggled.connect((action) => this.onToggled.emit(action));
    }
}
