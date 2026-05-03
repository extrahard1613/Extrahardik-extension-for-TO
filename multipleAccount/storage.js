import { STORAGE_SUFFIX, TABS } from "./constants.js";

export function getAccounts(tab) {
    try {
        const data = localStorage.getItem(tab + STORAGE_SUFFIX);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

export function setAccounts(tab, data) {
    try {
        localStorage.setItem(
            tab + STORAGE_SUFFIX,
            JSON.stringify(data)
        );
    } catch (e) {
    }
}

export function updateAccountAcrossAllTabs(id, newData) {
    const updatedTabs = [];

    TABS.forEach(tab => {
        const accounts = getAccounts(tab);
        const index = accounts.findIndex(acc => acc.id === id);
        
        if (index !== -1) {
            accounts[index] = { ...accounts[index], ...newData };
            setAccounts(tab, accounts);
            updatedTabs.push(tab);
        }
    });

    return updatedTabs;
}
