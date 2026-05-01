import { closeAccountsList } from "./ui.js";
import { replaceAccountInformation } from "./accountService.js";

export function detectBattleLoading(){
    let myMutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node instanceof Element && node.matches(".ApplicationLoaderComponentStyle-container")) {
                    closeAccountsList();
                    myMutationObserver.disconnect();
                }
            });
        });
    });
    
    myMutationObserver.observe(document.documentElement, { childList: true, subtree: true });
}

export function detectAccountInformationChanges(){
    let myMutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node instanceof Element && node.matches(".FooterComponentStyle-accountsButton")) {
                    setTimeout(() => {
                        replaceAccountInformation();
                        if (myMutationObserver)
                            myMutationObserver.disconnect();
                    }, 500);
                }
            });
        });
    });
    
    myMutationObserver.observe(document.documentElement, { childList: true, subtree: true });
}