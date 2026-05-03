import { TABS, SELECTORS } from "./constants.js";

export let activeTab = null;
let rowAnimationTimers = [];
let searchListenerAttached = false;

export function switchAccountListTab(accountListTab, accountElement) {
    if (activeTab === accountListTab && activeTab !== null) return;

    activeTab = accountListTab;

    const tabNumbers = ["first", "second", "third"];

    rowAnimationTimers.forEach(timer => clearTimeout(timer));
    rowAnimationTimers = [];

    tabNumbers.forEach(tabNumber => {
    const underline = document.getElementById(SELECTORS.UI.TAB_UNDERLINE(tabNumber));
        const table = document.getElementById(SELECTORS.UI.TAB_LIST(tabNumber));
        const text = document.getElementById(SELECTORS.UI.TAB_TEXT(tabNumber));

        const isActive = tabNumber === accountListTab;

        underline.style.display = isActive ? "block" : "none";
        table.style.display = isActive ? "table-row-group" : "none";

        text.style.color = isActive
            ? "rgb(118,255,51)"
            : "rgb(255,255,255)";

        text.parentNode.style.cursor = isActive
            ? "default"
            : "pointer";
    });

    bindSearch(accountElement);

    requestAnimationFrame(() => {
        animateRows(accountListTab);
    });
}

function bindSearch(accountElement) {
    const input = document.querySelector(SELECTORS.UI.SEARCH_INPUT);
    if (!input) return;

    if (searchListenerAttached) {
        input.oninput = null;
        input.onkeydown = null;
    }

    input.oninput = () => searchAccount(accountElement);
    input.onkeydown = (event) => event.stopPropagation();

    searchListenerAttached = true;
}

function animateRows(tabNumber) {
    const rows = document.querySelectorAll("." + tabNumber + "List-accountElement");

    rows.forEach(row => {
        row.classList.remove("showRow");
        row.style.opacity = "0";
        row.style.transform = "translateY(10px)";
    });

    rows.forEach((row, index) => {
        const timer = setTimeout(() => {
            row.classList.add("showRow");
        }, index * 45);

        rowAnimationTimers.push(timer);
    });
}

function searchAccount(elementNumber) {
    const searchInput = document.querySelector(SELECTORS.UI.SEARCH_INPUT).value.toLowerCase();
    const accounts = document.querySelectorAll(elementNumber);
    
    accounts.forEach(account => {
        const accountSpan = account.querySelector(SELECTORS.UI.ACCOUNT);
        if (accountSpan) {
            const nickname = accountSpan.textContent.toLowerCase();
            if (nickname.includes(searchInput)) {
                account.style.display = '';
            } else {
                account.style.display = 'none';
            }
        }
    });
}
