export interface ScrollableContainer extends HTMLDivElement
{
    isMouseDown?: boolean;
    startPageY?: number;
    initialScroll?: number;
}

export function convertToScrollContainer(container: ScrollableContainer): void
{
    document.addEventListener('mousedown', (e: MouseEvent) =>
    {
        if (!(e.target === container || container.contains((e.target as Node)))) return;

        container.isMouseDown = true;
        container.startPageY = e.pageY;
        container.initialScroll = container.scrollTop;
    });

    document.addEventListener('mouseup', () =>
    {
        container.isMouseDown = false;
    });

    document.addEventListener('mousemove', (e) =>
    {
        if (container.isMouseDown)
        {
            container.scrollTo(0, container.initialScroll + (container.startPageY - e.pageY));
        }
    });
}
