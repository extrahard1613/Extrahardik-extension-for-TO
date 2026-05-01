import { STORAGE_SUFFIX } from "./constants.js";

export function getAccounts(tab){
    return JSON.parse(
        localStorage.getItem(tab + STORAGE_SUFFIX)
    ) || [];
}

export function setAccounts(tab,data){
    localStorage.setItem(
        tab + STORAGE_SUFFIX,
        JSON.stringify(data)
    );
}

export function removeAccount(tab, id){
    const accounts = getAccounts(tab);
    const filtered = accounts.filter(acc => acc.id !== id);
    setAccounts(tab, filtered);
}