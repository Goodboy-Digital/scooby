/* eslint-disable no-console */

function sendMessage(message)
{
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs)
    {
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}

function listenForMessage(callback)
{
    chrome.runtime.onMessage.addListener(callback);
}

chrome.pageAction.onClicked.addListener(function ()
{
    sendMessage({ action: 'pageAction' });
});

listenForMessage(function (request, sender)
{
    if (request.action)
    {
        //
    }
    else if (request.present === 1)
    {
        chrome.pageAction.setIcon({ tabId: sender.tab.id, path: {
            19: 'icon-off.png',
        } });
        chrome.pageAction.show(sender.tab.id);
    }
    // In case we are enabled, change the icon to green andd enable the popup.
    else if (request.present === 2)
    {
        chrome.pageAction.setIcon({ tabId: sender.tab.id, path: {
            19: 'icon.png',
        } });
        chrome.pageAction.show(sender.tab.id);
    }
    else if (request.script)
    {
        chrome.tabs.executeScript({
            file: chrome.extension.getURL('TextureMonitor.js'),
            runAt: 'document_start',
            allFrames: true,
        }, function ()
        {
            console.log('execued');
            if (chrome.runtime.lastError)
            {
                console.log(`ERROR: ${chrome.runtime.lastError.message}`);
            }
        });
    }
});
