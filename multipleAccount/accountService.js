import { TABS } from "./constants.js";
import { getAccounts, setAccounts } from "./storage.js";
import { addAccountInformation } from "./ui.js";
import {expectElement} from "../helpers.js";
import {
    calculatePremiumExpiration,
    countRestOfPremiumAccount,
    getPremiumAccountInformation
} from "./premium.js";

export async function saveAccountInformation() {
    const accountInfo = await getAccountInformation();

    let targetId = getExistingId(accountInfo.nickname, accountInfo.entranceHashKey);
    if (!targetId) {
        targetId = generateAccountId();
    }

    //проходим по каждому списку и ищем активный
    TABS.forEach(tab => {
        const accountList = document.getElementById(tab + "AccountList");
        // проверяем является ли список активным или главным
        if (window.getComputedStyle(accountList).display !== 'none' || tab === "first") {
            const accounts = getAccounts(tab);

            // Проверяем, есть ли ОН ИМЕННО В ЭТОМ списке
            const alreadyInThisList = accounts.find(acc => 
                acc.entranceHashKey === accountInfo.entranceHashKey || 
                acc.nickname === accountInfo.nickname
            );

            if (alreadyInThisList) return; // Если уже есть в этой вкладке — пропускаем
            
            // Сохраняем с единым ID
            const accountToSave = { ...accountInfo, id: targetId };
            accounts.push(accountToSave);
            
            setAccounts(tab, accounts);
            addAccountInformation(tab);
        }   
    });
}

export async function replaceAccountInformation() {
    let id = getCurrentAccountIdFromHash();
    const currentHashInStorage = localStorage.getItem("entrance_hash_key") || "";

    if (!currentHashInStorage) return;

    let nicknameOnScreen = '';
    const nicknameElement = document.querySelector(".UserInfoContainerStyle-userNameRank.UserInfoContainerStyle-textDecoration");
    if (nicknameElement) nicknameOnScreen = nicknameElement.textContent.trim();

    if (!id) {
        const ownerOfHash = findAccountByHash(currentHashInStorage);
        
        if (ownerOfHash && ownerOfHash.nickname === nicknameOnScreen) {
            id = ownerOfHash.id;
            const newUrl = window.location.origin + window.location.pathname + "#" + id;
            window.history.replaceState(null, "", newUrl);
        } else {
            return;
        }
    }

    if (!id) return;
    const accountInBase = findAccountById(id);
    if (!accountInBase) return;

    if (currentHashInStorage !== accountInBase.entranceHashKey) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, "", cleanUrl);
        return;
    }

    const updatedData = await getAccountInformation(id);

    if (updatedData.nickname && accountInBase.nickname !== updatedData.nickname) {
        return;
    }

    TABS.forEach(tab => {
        const key = tab + "AccountListData";
        const data = getAccounts(tab);
        const target = data.find(acc => acc.id === id);
        if (target) {
            Object.assign(target, updatedData);
            setAccounts(tab, data);
            addAccountInformation(tab);
        }
    });
}

async function restartPage(id) {
    const account = findAccountById(id);

    if (!account) return;

    const currentAccount = await getAccountInformation(id);

    // если уже на этом аккаунте — ничего не делаем
    if (currentAccount && currentAccount.entranceHashKey === account.entranceHashKey) {
        return;
    }

    // ставим актуальный ключ входа
    localStorage.setItem('entrance_hash_key', account.entranceHashKey);

    // обновляем URL с новым id
    window.location.href =
        window.location.origin +
        window.location.pathname +
        "#" +
        id;

    // перезагрузка страницы (старое поведение сохранено)
    window.location.reload();
}

async function openPageInNewTab(id) {
    const account = findAccountById(id);
    if (!account) return;

    const currentAccount = await getAccountInformation(id);
    if (currentAccount && currentAccount.entranceHashKey === account.entranceHashKey) {
        return;
    }

    localStorage.setItem('entrance_hash_key', account.entranceHashKey);

    window.open(
        "https://tankionline.com/play/#" + id,
        "_blank"
    );
}

function findAccountById(id) {
    if (!id) return null;

    for (const tab of TABS) {
        const accounts = getAccounts(tab);
        const account = accounts.find(acc => acc.id === id);

        if (account) return account;
    }

    return null;
}

function findAccountByHash(hash) {
    if (!hash) return null;
    for (const tab of TABS) {
        const accounts = getAccounts(tab);
        const account = accounts.find(acc => acc.entranceHashKey === hash);
        if (account) return account;
    }
    return null;
}

export function switchAccountHandler(event, index, tab){
    const accounts = getAccounts(tab);
    const account = accounts[index];

    if (!account) return;

    const excluded = [
        tab + "AccountDeleteButton",
        "accountName-textContent",
        "accountDeleteButton-backgroundImage",
        "accountDeleteButton"
    ];

    if (excluded.some(c => event.target.classList.contains(c))) return;

    if (tab === "third") {
        openPageInNewTab(account.id);
    } else {
        restartPage(account.id);
    }
}   

function deleteAccountInformation(id, tab) {
    const accounts = getAccounts(tab);
    const filtered = accounts.filter(acc => acc.id !== id);
    setAccounts(tab, filtered);
    
    // Перерисовываем списки (можно оптимизировать, но так надежнее)
    addAccountInformation('first');
    addAccountInformation('second');
    addAccountInformation('third');
}

//функция для управления удалением аккаунта
export function deleteAccountInformationHandler(event, index, tab){
    const accounts = getAccounts(tab);
    const account = accounts[index];

    if (!account) return;

    const isDeleteClick =
        event.target.classList.contains(tab + "AccountDeleteButton") ||
        event.target.classList.contains("accountDeleteButton-backgroundImage");

    if (!isDeleteClick) return;

    if (tab === "first") {
        findDuplicates(account.id);
    }

    deleteAccountInformation(account.id, tab);
}

//спомогательная функция для сравнения аккаунтов
function findDuplicates(id) {
    // Просто проходим по всем спискам и удаляем этот ID
    deleteAccountInformation(id, 'secondAccountListData');
    deleteAccountInformation(id, 'thirdAccountListData');
}

function getCurrentAccountIdFromHash() {
    const hash = window.location.hash ? window.location.hash.slice(1) : null;
    if (!hash) return null;

    for (const tab of TABS) {
        const accounts = getAccounts(tab);

        if (accounts.some(acc => acc.id === hash)) {
            return hash;
        }
    }

    window.history.replaceState(
        null,
        "",
        window.location.origin + window.location.pathname
    );

    return null;
}

export function updateTancoins() {
    let idFromUrl = getCurrentAccountIdFromHash();
    const currentHashInStorage = localStorage.getItem("entrance_hash_key") || "";

    if (!idFromUrl || !currentHashInStorage) return;

    const accountInBase = findAccountById(idFromUrl);
    if (!accountInBase) return;

    if (currentHashInStorage !== accountInBase.entranceHashKey)
        return;

    const tankcoinsElement = document.querySelector(".UserScoreComponentStyle-coinIcon");

    if (!tankcoinsElement) 
        return;

    const tankcoins =
        tankcoinsElement.nextElementSibling?.textContent?.trim() || "";

    if (!tankcoins) return;

    TABS.forEach(tab => {
        const data = getAccounts(tab);
        const target = data.find(acc => acc.id === idFromUrl);

        if (target) {
            target.tankcoins = tankcoins;
            setAccounts(tab, data);
            addAccountInformation(tab);
        }
    });
}

function updateAccountInformation(tab, accountInfo) {
    const accounts = getAccounts(tab);

    let existingAccount = accounts.find(acc =>
        acc.entranceHashKey === accountInfo.entranceHashKey ||
        acc.nickname === accountInfo.nickname
    );

    if (existingAccount) {
        Object.assign(existingAccount, accountInfo);
        setAccounts(tab, accounts);
    }
}

//функция обновляет данные про премиум
function updatePremiumAccountInformation(accounts){
    accounts.forEach(account => {
        if (account.premiumAccountExpiration !== -1)    
            account.premiumAccount = countRestOfPremiumAccount(account);
    });
} 

//получаем данные, записываем их в обьект и возвращаем его
async function getAccountInformation(existingId = null){

    let premiumAccount = await getPremiumAccountInformation();  

    let rankIconElement = document.querySelector(".UserInfoContainerStyle-titleRankIcon");
    let rankIcon = rankIconElement ? rankIconElement.getAttribute("src") : '';
    
    let nicknameElement = document.querySelector(".UserInfoContainerStyle-userNameRank.UserInfoContainerStyle-textDecoration");
    let nickname = nicknameElement ? nicknameElement.textContent : '';

    let crystalsElement = document.querySelector(".UserScoreComponentStyle-iconCrystal");
    let crystals = crystalsElement ? crystalsElement.nextElementSibling.textContent : '';

    let rubiesElement = document.querySelector(".-iconCoinSizeMedium");
    let rubies = rubiesElement ? rubiesElement.nextElementSibling.textContent : '';

    let entranceHashKey = localStorage.getItem('entrance_hash_key') || '';
    let premiumAccountExpiration = calculatePremiumExpiration(premiumAccount);

    return {
        id: existingId,
        premiumAccount,
        rankIcon,
        nickname,
        crystals,
        rubies,
        entranceHashKey,
        premiumAccountExpiration
    };
}

function getExistingId(nickname, hash) {
    for (const tab of TABS) {
        const accounts = getAccounts(tab);

        const found = accounts.find(acc => acc.nickname === nickname || acc.entranceHashKey === hash);
        if (found && found.id) return found.id;
    }
    return null;
}

function generateAccountId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}