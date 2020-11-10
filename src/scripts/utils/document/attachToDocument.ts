/**
 * Attaches an element to the document
 * @param container - element to be attached
 */
export function attachToDocument(container: HTMLDivElement): void
{
    const targets = [document.body, document.head, document.documentElement];

    for (let n = 0; n < targets.length; n++)
    {
        const target = targets[n];

        if (target)
        {
            if (target.firstElementChild)
            {
                target.insertBefore(container, target.firstElementChild);
            }
            else
            {
                target.appendChild(container);
            }
            break;
        }
    }
}
