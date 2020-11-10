const uniqueId = new Date().getTime() + Math.abs(Math.random() * 1000000);

function sendMessage(message)
{
    message.uniqueId = uniqueId;
    chrome.runtime.sendMessage(message);
}
function listenForMessage(callback)
{
    chrome.runtime.onMessage.addListener(callback);
}

function insertTextScript(text)
{
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.text = text;
    insertHeaderNode(script);

    return script;
}

function insertHeaderNode(node)
{
    const targets = [document.body, document.head, document.documentElement];

    for (let n = 0; n < targets.length; n++)
    {
        const target = targets[n];

        if (target)
        {
            if (target.firstElementChild)
            {
                target.insertBefore(node, target.firstElementChild);
            }
            else
            {
                target.appendChild(node);
            }
            break;
        }
    }
}

const isLoadedKey = 'SCOOBY_LOADED';

// if we have been clicked then we want to inject ourselves into the page
if (sessionStorage.getItem(isLoadedKey) === 'true')
{
    const path = chrome.runtime.getURL('TextureMonitor.css');

    const link = document.createElement('link');

    link.href = path;
    link.type = 'text/css';
    link.rel = 'stylesheet';

    insertHeaderNode(link);

    const mainScript = `{{SCRIPT}}`;

    insertTextScript(mainScript);
}
else
{
    sendMessage({ present: 1 });
}

// Check for existing canvas a bit after the end of the loading.
document.addEventListener('DOMContentLoaded', function ()
{
    if (sessionStorage.getItem(isLoadedKey) === 'true')
    {
        // Inform the extension that canvases are present (2 means injection has been done, 1 means ready to inject)
        sendMessage({ present: 2 });

        // Refresh the canvas list.
        setTimeout(function ()
        {
            sendMessage({ pageReload: true });
        }, 500);
    }
});

listenForMessage(function (message)
{
    const action = message.action;

    if (!action)
    {
        return;
    }

    // We need to reload to inject the scripts.
    if (action === 'pageAction')
    {
        if (sessionStorage.getItem(isLoadedKey))
        {
            sessionStorage.getItem(isLoadedKey) === 'true' ? sessionStorage.setItem(isLoadedKey, 'false')
                : sessionStorage.setItem(isLoadedKey, 'true');
        }
        else
        {
            sessionStorage.setItem(isLoadedKey, 'true');
        }

        setTimeout(function ()
        {
            window.location.reload();
        }, 50);

        return;
    }
});
