export interface ResizeableContainer extends HTMLDivElement
{
    isMouseDown?: boolean;
    containerStartHeight?: number
    mouseStartPosition?: number
}

/**
 * Makes an HTMLElement become resizeable
 * @param container - An HTMLElement that is to be made resizeable
 * @param parent - An HTMLElement that is used to determine the scrollHeight
 */
export function convertToResizeContainer(container: ResizeableContainer, parent: HTMLDivElement): void
{
    container.addEventListener('mousedown', (e: MouseEvent) =>
    {
        if (!(e.target === container || container.contains((e.target as Node)))) return;

        container.isMouseDown = true;
        container.mouseStartPosition = e.clientY;
        container.containerStartHeight = parent.scrollHeight;
    });

    document.addEventListener('mouseup', () =>
    {
        container.isMouseDown = false;
    });

    document.addEventListener('mousemove', (e: MouseEvent) =>
    {
        // Hardcoded min/max - but could be adaptive
        const minHeight = 0;
        const maxHeight = 725;

        if (container.isMouseDown
                && Math.round(parent.scrollHeight) >= minHeight
                && Math.round(parent.scrollHeight) <= maxHeight
        )
        {
            const newPos = Math.max(Math.min(
                container.containerStartHeight - (e.clientY - container.mouseStartPosition), maxHeight,
            ), minHeight);

            parent.style.height = `${newPos}px`;
        }
    });
}
