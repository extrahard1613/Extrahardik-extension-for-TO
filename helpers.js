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

export function expectElement(selector, parent = document) {
    if (typeof selector !== 'string') {
        console.error("Ошибка: селектор должен быть строкой, а пришло:", selector);
        return Promise.reject("Invalid selector");
    }

    return new Promise((resolve) => {
        const element = parent.querySelector(selector); 
        
        if (element) return resolve(element);

        const observer = new MutationObserver((mutations, obs) => {
            const el = parent.querySelector(selector);
            if (el) {
                obs.disconnect();
                resolve(el);
            }
        });

        observer.observe(parent instanceof HTMLDocument ? parent.documentElement : parent, {
            childList: true,
            subtree: true
        });
    });
}
