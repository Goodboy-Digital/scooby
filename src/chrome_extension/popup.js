'use strict';

let toggle = document.getElementById('toggle');

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get('enabled', function(data) {
        toggle.checked = data.enabled;
    });
});

toggle.onclick = function(event) {
    chrome.storage.sync.set({enabled: toggle.checked}, function() {
        console.log('Goodboy Debugger Extension set to enabled = ' + toggle.checked);
    });
};