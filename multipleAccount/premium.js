import { expectElement } from "../helpers.js";

export function calculatePremiumExpiration(premiumAccount) {
    const daysPattern = /(\d+)\s*д/;
    const hoursPattern = /(\d+)\s*ч/;
    const minutesPattern = /(\d+)\s*м/;

    let days = 0;
    let hours = 0;
    let minutes = 0;

    let daysMatch = premiumAccount.match(daysPattern);
    let hoursMatch = premiumAccount.match(hoursPattern);
    let minutesMatch = premiumAccount.match(minutesPattern);

    if (daysMatch) 
        days = parseInt(daysMatch[1], 10);

    if (hoursMatch) 
        hours = parseInt(hoursMatch[1], 10);

    if (minutesMatch) 
        minutes = parseInt(minutesMatch[1], 10);

    //вычисляем число, когда премиум заканчивается и переводим эту дату в миллисекунды
    if (days || hours || minutes) {
        let currentDate = new Date();
        let premiumAccountExpiration = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000);

        return premiumAccountExpiration;
    }
    return -1;
}

export function countRestOfPremiumAccount(account) {
    let currentDate = new Date();
    
    //считаем сколько времени осталось до окончания премиума в миллисекундах
    let premiumAccountExpiration = new Date(account.premiumAccountExpiration);
    const premiumAccountTime = premiumAccountExpiration - currentDate;
    
    if (premiumAccountTime <= 0) 
        return '-';

    //считаем остаток в нужных единицах измерения
    let premiumAccountDays = Math.floor(premiumAccountTime / (24 * 60 * 60 * 1000));
    let remainingHours = premiumAccountTime % (24 * 60 * 60 * 1000);

    let premiumAccountHours = Math.floor(remainingHours / (60 * 60 * 1000));
    let remainingMinutes = remainingHours % (60 * 60 * 1000);

    let premiumAccountMinutes = Math.floor(remainingMinutes / (60 * 1000));

    //выводим результат в нужных единицах измерения
    if (premiumAccountDays > 0) 
        return `${premiumAccountDays}д ${premiumAccountHours}ч`;
    else if (premiumAccountHours > 0)
        return `${premiumAccountHours}ч ${premiumAccountMinutes}м`;
    else 
        return `${premiumAccountMinutes}м`;
}
 
//функция открывает меню с премиумом, получает значение и возвращает его
export async function getPremiumAccountInformation(){
    let premiumAccountButton = document.querySelector(".UserInfoContainerStyle-blockLeftPanel .UserInfoContainerStyle-userTitleContainer .-flexCenterAlignCenterColumn");
    premiumAccountButton.click();

    let premiumAccountContainer = await expectElement(document, ".ModalStyle-shaded");
    let premiumAccountContainer2 = document.querySelector(".DialogPremiumAccountStyle-mainScreen");

    premiumAccountContainer.style.setProperty('display', 'none', 'important');
    premiumAccountContainer2.style.setProperty('display', 'none', 'important');

    let premiumAccountElement = document.querySelector(".UserInfoContainerStyle-grayColor > :nth-child(1)");
    let noPremiumAccountElement = document.querySelector(".DialogPremiumAccountStyle-noPremium");

    let premiumAccount = '-';

    if (premiumAccountElement) {
        const text = premiumAccountElement.textContent.trim();
        premiumAccount = text !== '' ? text : '-';
    } 
    else if (noPremiumAccountElement) 
         premiumAccount = '-';

    const closePremiumButton = document.querySelector(".DialogPremiumAccountStyle-closeButton");
    setTimeout(() => {
        closePremiumButton.click();
        premiumAccountContainer.style.setProperty('display', 'none', 'important');
        premiumAccountContainer2.style.setProperty('display', 'none', 'important');
    }, 500);

    setTimeout(() => {
        premiumAccountContainer.style.setProperty('display', 'flex', 'important');
        premiumAccountContainer2.style.setProperty('display', 'flex', 'important');
    }, 1000);

    return premiumAccount;
} 