'use strict';

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({enabled: false}, function() {
        console.log('Goodboy Debugger Extension is disabled.');
    });
});