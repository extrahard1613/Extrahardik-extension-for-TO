const mainScript = document.createElement('script');
mainScript.type = 'module';
mainScript.src = chrome.runtime.getURL('main.js');

(document.head || document.documentElement).appendChild(mainScript);
