import { TABS, SELECTORS } from "./constants.js";
import { getAccounts } from "./storage.js";
import { switchAccountListTab } from "./tabs.js";
import {
    saveAccountInformation,
    switchAccountHandler,
    deleteAccountInformationHandler
} from "./accountService.js";
import { createAccountMenuHandler } from "./menu.js";

export function initInterface() {
    document.querySelector(SELECTORS.UI.ADDBUTTON)?.addEventListener("click", saveAccountInformation);

    TABS.forEach(tab => {
        const tabElement = document.getElementById(`${tab}Tab`);
        tabElement?.addEventListener("click", () => 
            switchAccountListTab(tab, `.${tab}List-accountElement`)
        );

        const accountList = document.getElementById(tab + "AccountList");
        accountList?.addEventListener("click", (event) => handleListClick(event, tab));
    });
}

export function openAccountsList() {    
    document.querySelector(SELECTORS.UI.MODAL).style.display = "block";
    document.querySelector(SELECTORS.UI.CONTAINER).style.display = "block";

    TABS.forEach(tab => renderAccountList(tab));

    switchAccountListTab("first", ".firstList-accountElement");
}

export function closeAccountsList() {
    document.querySelector(SELECTORS.UI.MODAL).style.display = "none";
    document.querySelector(SELECTORS.UI.CONTAINER).style.display = "none";
}

function handleListClick(event, tab) {
    const target = event.target;
    
    const row = target.closest(".accountElement");
    if (!row) return;

    const parent = row.parentNode;
    if (!parent) return;

    const allRows = Array.from(parent.children);
    const index = allRows.indexOf(row);

    const accounts = getAccounts(tab);

    if (target.closest(".accountDeleteButton")) {
        deleteAccountInformationHandler(event, index, tab);
        return;
    }

    if (target.closest(".accountName-textContent")) {
        createAccountMenuHandler(index, event, accounts);
        return;
    }

    switchAccountHandler(event, index, tab);
}

export function renderAccountList(tab) {
    const accounts = getAccounts(tab);
    const accountList = document.getElementById(tab + "AccountList");
    const textContentElement = document.getElementById(tab + "Tab-textContent");

    if (!accountList) return;

    accountList.innerHTML = accounts.map(acc => createAccountRowHTML(acc, tab)).join('');

    const tabLabels = { first: 'Все', second: 'Группа А', third: 'Группа Б' };
    if (textContentElement) {
        textContentElement.textContent = `${tabLabels[tab]} [${accounts.length}]`;
    }
}

function createAccountRowHTML(account, tab) {
    return `
        <tr class="accountElement ${tab}List-accountElement">
            <td class='accountPremium'>
                <div class='accountPremium-backgroundImage'></div>
                <span class='accountPremium-textContent'>${account.premiumAccount || '-'}</span>
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
            <td class='accountDeleteButton ${tab}AccountDeleteButton'>
                <div class='accountDeleteButton-backgroundImage'></div>
            </td>
        </tr>`;
}
