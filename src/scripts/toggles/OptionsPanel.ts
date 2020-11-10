import { Signal } from 'typed-signals';

import { ToggleAction, ToggleType } from './ToggleButton';
import { ToggleButtonGroup } from './ToggleButtonGroup';

export class OptionsPanel
{
    public div: HTMLDivElement;

    public typeGroup = new ToggleButtonGroup({
        text: 'type',
        buttonsData: {
            texture: { type: ToggleType.NORMAL, text: 'Textures' },
            misc: { type: ToggleType.NORMAL, text: 'Other' },
        },
    });

    public statusGroup = new ToggleButtonGroup({
        text: 'status',
        buttonsData: {
            active: { type: ToggleType.ACTIVE, text: 'Active' },
            deleted: { type: ToggleType.DELETED, text: 'Deleted' },
        },
    });

    public miscGroup = new ToggleButtonGroup({
        text: 'misc',
        buttonsData: {
            bitmap: {
                type: ToggleType.KILL,
                text: 'Kill createImageBitmap',
                action: ToggleAction.TOGGLE_KILL_CREATE_IMAGE_BITMAP,
            },
            logs: { type: ToggleType.LOGS, text: 'Logs', action: ToggleAction.TOGGLE_LOGS },
        },
    });

    public onBtnClick = new Signal();

    /**
     * Creates the options panel and inits each button group
     */
    public init(): void
    {
        this.div = document.createElement('div');
        this.div.id = 'options-panel';

        this.typeGroup.init(this.div);
        this.statusGroup.init(this.div);
        this.miscGroup.init(this.div);
    }

    /**
     * Sets up the listeners for each group
     */
    public setupListeners(): void
    {
        this.typeGroup.setupListeners();
        this.typeGroup.onBtnClicked.connect((action) => this.onBtnClick.emit(action));

        this.statusGroup.setupListeners();
        this.statusGroup.onBtnClicked.connect((action) => this.onBtnClick.emit(action));

        this.miscGroup.setupListeners();
        this.miscGroup.onBtnClicked.connect((action) => this.onBtnClick.emit(action));
    }
}
