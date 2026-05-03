import { closeAccountsList } from "./ui.js";
import { SELECTORS } from "./constants.js";
import { updateTancoins } from "./accountService.js";

export function detectBattleLoading(){
    let myMutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node instanceof Element && node.matches(SELECTORS.LOBBY.LOADING)) {
                    closeAccountsList();
                    myMutationObserver.disconnect();
                }
            });
        });
    });
    
    myMutationObserver.observe(document.documentElement, { childList: true, subtree: true });
}

export function lookingForTancoins() {
    let lastState = false;

    const observer = new MutationObserver(() => {
        const tankcoinContainer = document.querySelector(SELECTORS.SHOP.TANKCOINS_ICON);
        const isShopOpen = !!tankcoinContainer;

        if (isShopOpen && !lastState) {
            updateTancoins();
        }

        lastState = isShopOpen;
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Функция слежки за экраном входа
export function watchForLogout() {
    const observer = new MutationObserver(() => {
        const loginForm = document.querySelector(SELECTORS.REGISTRATION.LOGIN);
        
        if (loginForm && window.location.hash) {
            window.history.replaceState(null, "", window.location.origin + window.location.pathname);
        }
    });

    observer.observe(document.documentElement, { 
        childList: true, 
        subtree: true 
    });
}
