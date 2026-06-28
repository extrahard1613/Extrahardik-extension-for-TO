import { TABS, SELECTORS } from "./constants.js";
import { getAccounts, setAccounts, updateAccountAcrossAllTabs } from "./storage.js";
import { renderAccountList } from "./ui.js";
import {expectElement} from "../helpers.js";
import {
    calculatePremiumExpiration,
    countRestOfPremiumAccount,
    getPremiumAccountInformation
} from "./premium.js";
import { activeTab } from "./tabs.js";

//Функция сохранения информации при добавлении аккаунта
export async function saveAccountInformation() {
    const accountInfo = await getAccountInformation();
    if (!accountInfo) return;

    let targetId = getExistingId(accountInfo.nickname, accountInfo.entranceHashKey);
    if (!targetId) {
        targetId = generateAccountId();
    }

    window.location.hash = `${targetId}`;

    const targetTabs = ["first"]; 
    if (activeTab && activeTab !== "first") {
        targetTabs.push(activeTab);
    }

    targetTabs.forEach(tab => {
        const accounts = getAccounts(tab);

        const isDuplicate = accounts.some(acc => 
            acc.entranceHashKey === accountInfo.entranceHashKey || 
            acc.nickname === accountInfo.nickname
        );

        if (isDuplicate) return;

        const accountToSave = { ...accountInfo, id: targetId };
        accounts.push(accountToSave);
        
        setAccounts(tab, accounts);
        renderAccountList(tab);
    });
}

export async function replaceAccountInformation() {
    let id = getCurrentAccountIdFromUrl();
    const currentHashInStorage = localStorage.getItem("entrance_hash_key") || "";

    if (!currentHashInStorage) return;

    // Считываем никнейм с экрана для проверок
    let nicknameOnScreen = '';
    const nicknameElement = document.querySelector(SELECTORS.LOBBY.NICKNAME);
    if (nicknameElement) {
        nicknameOnScreen = nicknameElement.textContent.replace(/\[.*?\]/g, "").trim();
    }

    // =========================================================================
    // ВЕТКА: ЕСЛИ НЕТ АЙДИ В ССЫЛКЕ (Правая часть схемы)
    // =========================================================================
    if (!id) {
        // Проверяем: хэш совпадает с одним из существующих?
        const ownerOfHash = findAccountByHash(currentHashInStorage);
        
        if (ownerOfHash) {
            // --- ХЭШ СОВПАДАЕТ (ДА) ---
            if (ownerOfHash.nickname === nicknameOnScreen) {
                // Ник совпадает -> ставим айди в урл и идем дальше к обновлению данных
                id = ownerOfHash.id;
                const newUrl = window.location.origin + window.location.pathname + "#" + id;
                window.history.replaceState(null, "", newUrl);
            } else {
                // Ник НЕ совпадает -> ретерн
                return;
            }
        } else {
            // --- ХЭШ НЕ СОВПАДАЕТ (НЕТ) ---
            // Проверяем, может этот никнейм уже есть у нас в базе? (Случай сброса сессии)
            const ownerByNickname = findAccountByNickname(nicknameOnScreen);
            
            if (ownerByNickname) {
                // Ник совпадает -> фиксируем ID, перезаписываем протухший хэш в базе
                id = ownerByNickname.id;
                
                // Обновляем хэш во всех вкладках, чтобы база приняла новую сессию
                updateAccountAcrossAllTabs(id, { entranceHashKey: currentHashInStorage });
                
                // Ставим актуальный урл
                const newUrl = window.location.origin + window.location.pathname + "#" + id;
                window.history.replaceState(null, "", newUrl);
            } else {
                // Ник НЕ совпадает (Абсолютно новый аккаунт) -> просто ретерн
                return;
            }
        }
    }

    // На всякий случай страхуемся: если айди так и не определился, дальше не идем
    if (!id) return;

    // =========================================================================
    // ВЕТКА: ЕСЛИ ЕСТЬ АЙДИ В ССЫЛКЕ (Левая часть схемы)
    // =========================================================================
    const accountInBase = findAccountById(id);
    if (!accountInBase) return;

    // Проверка: совпадает ли хэш в базе с хэшем в хранилище?
    if (currentHashInStorage !== accountInBase.entranceHashKey) {
        // НЕТ -> очистка урл и ретерн
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, "", cleanUrl);
        return;
    }
    
    // ДА -> Собираем свежие данные с экрана и перезаписываем
    const updatedData = await getAccountInformation(id);
    if (!updatedData) return; // Защита на случай, если DOM не успел прогрузиться

    // Дополнительный барьер против перекрестного загрязнения вкладок по никнейму
    if (updatedData.nickname && accountInBase.nickname !== updatedData.nickname) {
        const alternativeOwner = findAccountByNickname(updatedData.nickname);
        
        if (alternativeOwner && alternativeOwner.id !== id) {
            // Обнаружено ложное срабатывание (считали чужой ник), отменяем апдейт базы
            return;
        }
    }

    // Все проверки пройдены — обновляем информацию об аккаунте
    updateAccountAcrossAllTabs(id, updatedData);
}

function updateNicknameInBase(id, newNickname) {
    if (!id || !newNickname) return;

    const accountInBase = findAccountById(id);
    if (!accountInBase) return;

    // Перезаписываем только если ник РЕАЛЬНО изменился
    if (accountInBase.nickname !== newNickname) {
        
        // Используем твою функцию для синхронизации между вкладками
        updateAccountAcrossAllTabs(id, { nickname: newNickname });
        
        // Если нужно сразу обновить UI расширения, раскомментируй строку ниже:
        // TABS.forEach(tab => renderAccountList(tab));
    }
}

function findAccountByNickname(nickname) {
    if (!nickname) return null;
    for (const tab of TABS) {
        const accounts = getAccounts(tab);
        const account = accounts.find(acc => acc.nickname === nickname);
        if (account) return account;
    }
    return null;
}

async function restartPage(id) {
    const account = findAccountById(id);

    if (!account) return;

    const currentAccount = await getAccountInformation(id);

    if (currentAccount && currentAccount.entranceHashKey === account.entranceHashKey) {
        return;
    }

    localStorage.setItem('entrance_hash_key', account.entranceHashKey);

    window.location.href =
        window.location.origin +
        window.location.pathname +
        "#" +
        id;

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
    
    TABS.forEach(tab => renderAccountList(tab));    
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

//Сравнивает аккаунты
function findDuplicates(id) {
    deleteAccountInformation(id, 'second'); 
    deleteAccountInformation(id, 'third');
}

function getCurrentAccountIdFromUrl() {
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

//Запись данных об танкоинах
export function updateTancoins() {
    let idFromUrl = getCurrentAccountIdFromUrl();
    const currentHashInStorage = localStorage.getItem("entrance_hash_key") || "";

    if (!idFromUrl || !currentHashInStorage) return;

    const accountInBase = findAccountById(idFromUrl);
    if (!accountInBase) return;

    if (currentHashInStorage !== accountInBase.entranceHashKey)
        return;

    const tankcoinsElement = document.querySelector(SELECTORS.SHOP.TANKCOINS_ICON);

    if (!tankcoinsElement) 
        return;

    const tankcoins = tankcoinsElement.nextElementSibling?.textContent?.trim() || "";

    if (!tankcoins) return;

    updateAccountAcrossAllTabs(idFromUrl, { tankcoins });
}

//Обновление данных аккаунта
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

//Обновление данных об премиуме
function updatePremiumAccountInformation(accounts){
    accounts.forEach(account => {
        if (account.premiumAccountExpiration !== -1)    
            account.premiumAccount = countRestOfPremiumAccount(account);
    });
} 

//Возвращает обьект с данными об аккаунте
async function getAccountInformation(existingId = null){
    let premiumAccount = await getPremiumAccountInformation();
    if (!premiumAccount) return null;

    let rankIconElement = await expectElement(SELECTORS.LOBBY.RANK_ICON);
    if (!rankIconElement) return null;
    let rankIcon = rankIconElement ? rankIconElement.getAttribute("src") : '';
    
    let nicknameElement = await expectElement(SELECTORS.LOBBY.NICKNAME);
    if (!nicknameElement) return null;

    // === НОВЫЙ БЛОК РАЗДЕЛЕНИЯ НИКА И КЛАНА ===
    const rawNicknameText = nicknameElement.textContent.trim(); // Например: "[TEAM] extra_hard"
    const clanMatch = rawNicknameText.match(/\[.*?\]/); 
    
    const clan = clanMatch ? clanMatch[0] : ''; // Сюда уйдет "[TEAM]" (или пустая строка, если клана нет)
    const nickname = rawNicknameText.replace(/\[.*?\]/g, "").trim(); // Сюда уйдет чистый "extra_hard"
    // =========================================

    let crystalsElement = await expectElement(SELECTORS.LOBBY.CRYSTALS_ICON);
    if (!crystalsElement) return null;
    let crystals = crystalsElement ? crystalsElement.nextElementSibling.textContent : '';

    let rubiesElement = await expectElement(SELECTORS.LOBBY.RUBIES_ICON);
    if (!rubiesElement) return null;
    let rubies = rubiesElement ? rubiesElement.nextElementSibling.textContent : '';

    let entranceHashKey = localStorage.getItem('entrance_hash_key') || '';
    let premiumAccountExpiration = calculatePremiumExpiration(premiumAccount);

    return {
        id: existingId,
        premiumAccount,
        rankIcon,
        nickname,        
        clan,            
        crystals,
        rubies,
        entranceHashKey,
        premiumAccountExpiration
    };
}

//Проверка на существования аккаунта в списке
function getExistingId(nickname, hash) {
    for (const tab of TABS) {
        const accounts = getAccounts(tab);

        const found = accounts.find(acc => acc.nickname === nickname || acc.entranceHashKey === hash);
        if (found && found.id) return found.id;
    }
    return null;
}

//Генерация id аккаунта
function generateAccountId() {
    return crypto.randomUUID();
}

let nicknameObserverInstance = null;

export function initNicknameObserver() {
    if (nicknameObserverInstance) {
        nicknameObserverInstance.disconnect();
    }

    const checkAndUpdateNickname = () => {
        const id = getCurrentAccountIdFromUrl();
        if (!id) return;

        const accountInBase = findAccountById(id);
        if (!accountInBase) return;

        const currentHashInStorage = localStorage.getItem("entrance_hash_key") || "";
        if (currentHashInStorage !== accountInBase.entranceHashKey) return;

        const nicknameElement = document.querySelector(SELECTORS.LOBBY.NICKNAME);
        if (!nicknameElement) return; 

        const currentNicknameOnScreen = nicknameElement.textContent.replace(/\[.*?\]/g, "").trim();

        if (currentNicknameOnScreen && currentNicknameOnScreen !== accountInBase.nickname) {
            updateNicknameInBase(id, currentNicknameOnScreen);
        }
    };

    nicknameObserverInstance = new MutationObserver(checkAndUpdateNickname);
    
    // Включаем characterData, чтобы ловить изменения текста внутри текстовых нод (span)
    nicknameObserverInstance.observe(document.body, {
        childList: true,
        characterData: true, // <--- ВОТ ЭТО возвращает ему зрение на текст
        subtree: true
    });

    // Первый запуск при загрузке страницы
    checkAndUpdateNickname();
}
