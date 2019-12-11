'use strict';

chrome.storage.sync.get('enabled', function(data) {
    console.log("ENABLED",data);
    
    if (data.enabled === true) {
        console.log("TRUE!");
        
        let s = document.createElement('script');
        s.src = chrome.extension.getURL('src/chrome_extension/texture-monitor.js');
        s.onload = function() {
            this.remove();
        };
        console.log(document,s);

        document.body.appendChild(s);
        // (document.head || document.documentElement).appendChild(s);
    }
});