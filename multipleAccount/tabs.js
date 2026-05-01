import { TABS } from "./constants.js";

let activeTab = null;
let rowAnimationTimers = [];
let searchListenerAttached = false;

export function switchAccountListTab(accountListTab, accountElement) {
    if (activeTab === accountListTab) return;

    activeTab = accountListTab;

    const tabNumbers = ["first", "second", "third"];

    rowAnimationTimers.forEach(timer => clearTimeout(timer));
    rowAnimationTimers = [];

    tabNumbers.forEach(tabNumber => {
        const underline = document.getElementById(tabNumber + "ActiveTabUnderline");
        const table = document.getElementById(tabNumber + "AccountList");
        const text = document.getElementById(tabNumber + "Tab-textContent");

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
    const input = document.querySelector(".searchAccountInput");
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
    const searchInput = document.querySelector('.searchAccountInput').value.toLowerCase();
    const accounts = document.querySelectorAll(elementNumber);
    
    //проходим по каждому аккаунту и ищем совпадения с запросом в input
    accounts.forEach(account => {
        const accountSpan = account.querySelector('.accountName-textContent');
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