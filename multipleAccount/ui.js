import { TABS } from "./constants.js";
import { getAccounts, setAccounts } from "./storage.js";
import { switchAccountListTab } from "./tabs.js";
import {
    saveAccountInformation,
    switchAccountHandler,
    deleteAccountInformationHandler
} from "./accountService.js";
import { createAccountMenuHandler } from "./menu.js";

export function openAccountsList() {    
    document.querySelector(".multipleAccount").style.display = "block";
    document.querySelector(".multipleAccount-popupContainer").style.display = "block";

    document.querySelector(".addAccountButton").addEventListener("click", saveAccountInformation);

    TABS.forEach(tab => addAccountInformation(tab));

    TABS.forEach(tab => {
        const tabElement = document.getElementById(`${tab}Tab`);
        tabElement.addEventListener("click", () => 
            switchAccountListTab(tab, `.${tab}List-accountElement`)
        );
    });

    switchAccountListTab("first", ".firstList-accountElement");
}

export function closeAccountsList() {
    document.querySelector(".multipleAccount").style.display = "none";
    document.querySelector(".multipleAccount-popupContainer").style.display = "none";
}

function countAccounts(accountListCount, resultElement) {
    const accountListCounts = accountListCount.childElementCount; //подсчет кол-ва аккаунтов

    const tabTextContents = {
        'firstTab-textContent': 'Все',
        'secondTab-textContent': 'Группа А',
        'thirdTab-textContent': 'Группа Б'
    };

    resultElement.textContent = `${tabTextContents[resultElement.id]} [${accountListCounts}]`; //отображаем кол-во аккаунтов
}

export function addAccountInformation(tab) {
    const accounts = getAccounts(tab);
    const accountList = document.getElementById(tab + "AccountList");
    accountList.innerHTML = ''; //очищаем список перед добавлением актуального

    //проходим по аккаунтам и для каждого создаем элемент в списке
    accounts.forEach(account => {
        const accountElement = document.createElement("tr");
        accountElement.className = "accountElement " + tab + "List-accountElement";
        accountElement.innerHTML = createAccountListHTML(account, tab + "AccountDeleteButton"); //вызываем функцию для создания заготовки списка

        accountList.appendChild(accountElement);
    });

    countAccounts(accountList, document.getElementById(tab + "Tab-textContent")); //вызываем функцию для подсчет актуального кол-ва аккаунтов в списке

    //добавления слушателя для переключения между аккаунтами
    let switchAccountButton = document.querySelectorAll(".accountElement." + tab + "List-accountElement"); 
    switchAccountButton.forEach((button, index) => {
        button.addEventListener("click", (event) => switchAccountHandler(event, index, tab));
    });

    //добавления слушателя для удаления аккаунта из списка
    let deleteAccountButtons = document.querySelectorAll(".accountDeleteButton." + tab + "AccountDeleteButton"); 
    deleteAccountButtons.forEach((button, index) => {
        button.addEventListener("click", (event) => deleteAccountInformationHandler(event, index, tab));
    });    
    
    //добавления слушателя для вызова меню аккаунта 
    let openAccountMenuButtons = document.querySelectorAll(".accountElement." + tab + "List-accountElement" + " .accountName-textContent");
    openAccountMenuButtons.forEach((button, index) => {
        button.addEventListener("click", (event) => createAccountMenuHandler(index, event, accounts));
    });
}

function createAccountListHTML(account, deleteButtonClass){
    return `
            <td class='accountPremium'>
                <div class='accountPremium-backgroundImage'></div>
                <span class='accountPremium-textContent'>${account.premiumAccount}</span>
            </td>
            <td class='accountName'>
                <div class='accountRank-backgroundImage' style='background-image: url("${account.rankIcon}");'></div>
                <span class='accountName-textContent'>${account.nickname}</span>
            </td>
            <td class='accountCrystals'>
                <div class='accountCrystals-backgroundImage'></div>
                <span class='accountCrystals-textContent'>${account.crystals}</span>
            </td>
            <td class='accountRubies'>
                <div class='accountRubies-backgroundImage'></div>
                <span class='accountRubies-textContent'>${account.rubies}</span>
            </td>
            <td class='accountTankcoins'>
                <div class='accountTankcoins-backgroundImage'></div>
                <span class='accountTankcoins-textContent'>${account.tankcoins || '0'}</span>
            </td>
            <td class='accountDeleteButton ${deleteButtonClass}'>
                <div class='accountDeleteButton-backgroundImage'></div>
            </td>`;
}