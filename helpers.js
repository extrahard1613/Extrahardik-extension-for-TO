export function simulateKeyPress(key) {
    const keyDownEvent = new KeyboardEvent('keydown', { 'key': key, code: `Key${key.toUpperCase()}`, keyCode: key.toUpperCase().charCodeAt(0), bubbles: true });
    const keyUpEvent = new KeyboardEvent('keyup', { 'key': key, code: `Key${key.toUpperCase()}`, keyCode: key.toUpperCase().charCodeAt(0), bubbles: true });
    const keyPressEvent = new KeyboardEvent('keypress', { 'key': key, code: `Key${key.toUpperCase()}`, keyCode: key.toUpperCase().charCodeAt(0), bubbles: true });
  
    document.activeElement?.dispatchEvent(keyDownEvent);
    document.activeElement?.dispatchEvent(keyUpEvent);
    document.activeElement?.dispatchEvent(keyPressEvent);
  }
  
  export function simulateKeyPress2(key) {
    const keyDownEvent = new KeyboardEvent('keydown', { 'key': key, code: `Key${key.toUpperCase()}`, keyCode: key.toUpperCase().charCodeAt(0), bubbles: true });
    const keyUpEvent = new KeyboardEvent('keyup', { 'key': key, code: `Key${key.toUpperCase()}`, keyCode: key.toUpperCase().charCodeAt(0), bubbles: true });
    const keyPressEvent = new KeyboardEvent('keypress', { 'key': key, code: `Key${key.toUpperCase()}`, keyCode: key.toUpperCase().charCodeAt(0), bubbles: true });
  
    document.activeElement?.dispatchEvent(keyDownEvent);
    setTimeout(() => {
      document.activeElement?.dispatchEvent(keyUpEvent);
    }, 15000);
    document.activeElement?.dispatchEvent(keyPressEvent);
  }

  export function expectElement(container, selectors, returnIfPresent = false) {

    if (returnIfPresent) {
        const element = container.querySelector(selectors);
        if (element) return Promise.resolve(element);
    }
      return new Promise((resolve) => {
          new MutationObserver((mutations, observer) => {
              const addedNodes = mutations.flatMap((mutation) =>
                  Array.from(mutation.addedNodes));
              for (const addedNode of addedNodes) {
                  if (!(addedNode instanceof Element)) continue;
                  const element = addedNode.matches(selectors) ?
                      addedNode : addedNode.querySelector(selectors);
                  if (element) {
                      resolve(element);
                      observer.disconnect();
                      return;
                  }
              }
          }).observe(container,
              { childList: true, subtree: true });
      });
  }