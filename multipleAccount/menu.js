import { getAccounts } from "./storage.js";

let lastClickedIndex = null;
const menuContainer = document.querySelector(".accountMenu-container");

function createAccountMenuHTML(account) {
    return `
        <div class='accountMenu'>
            <div class='accountMenuElement'>
                <div class='accountRank-backgroundImage' style='background-image: url("${account.rankIcon}"); height: 55%; width: 10%; margin-left: 0.5em;'></div>
                <span class='accountMenuElement-textContent' style='overflow: hidden; text-overflow: ellipsis; color: rgb(162, 255, 106); margin-left: 0em;'>${account.nickname}</span>
            </div>
            <div class='accountMenuElement copy-nickname' data-action="copy">
                <span class='accountMenuElement-textContent'>Скопировать имя</span>
            </div>
            <div class='accountMenuElement check-profile' data-action="profile">
                <span class='accountMenuElement-textContent'>Профиль</span>
            </div>
        </div>`;
}

export function createAccountMenuHandler(index, event, accounts) {
    const accountMenuContainer = document.querySelector(".accountMenu-container");

    if (!accountMenuContainer) {
        console.warn("Контейнер .accountMenu-container еще не создан");
        return;
    }

    event.stopPropagation();

    if (lastClickedIndex === index) {
        closeAccountMenu();
        return;
    }

    closeAccountMenu();
    lastClickedIndex = index;

    const account = accounts[index];
    accountMenuContainer.innerHTML = createAccountMenuHTML(account);

    const x = (event.clientX / window.innerWidth) * 100;
    const y = (event.clientY / window.innerHeight) * 100;
    
    accountMenuContainer.style.left = `${x}%`;
    accountMenuContainer.style.top = `${y}%`;
    accountMenuContainer.style.display = "block"; // Убеждаемся, что блок виден

    document.addEventListener('click', handleOutsideClick);
    
    accountMenuContainer.onclick = (e) => handleMenuActions(e, accounts, index);
}

function handleMenuActions(event, accounts, index) {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    if (action === 'copy') {
        copyNickname(accounts, index);
    } else if (action === 'profile') {
        openProfile(accounts, index);
    }

    closeAccountMenu();
}

function handleOutsideClick(event) {
    const accountMenuContainer = document.querySelector(".accountMenu-container");

    if (!accountMenuContainer) {
        document.removeEventListener('click', handleOutsideClick);
        return;
    }

    if (!accountMenuContainer.contains(event.target)) {
        closeAccountMenu();
    }
}

function closeAccountMenu() {
    const accountMenuContainer = document.querySelector(".accountMenu-container");
    
    if (accountMenuContainer) {
        accountMenuContainer.innerHTML = '';
        accountMenuContainer.style.display = "none";
    }

    document.removeEventListener('click', handleOutsideClick);
    lastClickedIndex = null;
}

function getCleanNickname(tab, index) {
    const rawNickname = tab[index].nickname;
    return rawNickname.includes("] ") ? rawNickname.split("] ").pop() : rawNickname;
}

function copyNickname(tab, index) {
    const nickname = getCleanNickname(tab, index);
    navigator.clipboard.writeText(nickname).catch(err => {
        console.error("Не удалось скопировать:", err);
    });
}

function openProfile(tab, index) {
    const nickname = getCleanNickname(tab, index);
    window.open(`https://ratings.tankionline.com/ru/user/${nickname}`, '_blank');
}
