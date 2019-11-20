var contextMenus = {};

contextMenus.createCounterString = 
    chrome.contextMenus.create(
        {
            "title":"WebGL Texture Monitor"
        },
        function (){
            if(chrome.runtime.lastError){
                console.error(chrome.runtime.lastError.message);
            }
        }
    );

chrome.contextMenus.onClicked.addListener(contextMenuHandler);

function contextMenuHandler(info, tab){

    if(info.menuItemId===contextMenus.createCounterString){
        chrome.tabs.executeScript({
            file: 'src/chrome_extension/texture-monitor.js'
        });
    }
}