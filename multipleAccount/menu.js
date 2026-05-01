import { getAccounts } from "./storage.js";

let lastClickedIndex = null;

function createAccountMenu(tab, index, xPercent, yPercent) {
    //ищем нужный аккаунт и вызываем функцию создания заготовки меню
    if (index >= 0 && index < tab.length) {
        const accountMenuContainer = document.querySelector(".accountMenu-container");
        accountMenuContainer.innerHTML = createAccountMenuHTML(tab[index]);
        
        //получаем координаты клика
        accountMenuContainer.style.left = `${xPercent}%`;
        accountMenuContainer.style.top = `${yPercent}%`;

        //добавляем слушатели для пунктов меню
        setTimeout(() => {
            let copyNicknameButton = document.querySelector(".copy-nickname");
            copyNicknameButton.addEventListener('click', () => copyNickname(tab, index));

            let checkProfileButton = document.querySelector(".check-profile");
            checkProfileButton.addEventListener('click', () => openProfile(tab, index));

            document.addEventListener('click', closeAccountMenuHandler);
        }, 0);
    }
}

function createAccountMenuHTML(account) {
    return `
        <div class='accountMenu'>
            <div class='accountMenuElement'>
                <div class='accountRank-backgroundImage' style='background-image: url("${account.rankIcon}"); height: 55%; width: 10%; margin-left: 0.5em;'></div>
                <span class='accountMenuElement-textContent' style='overflow: hidden; text-overflow: ellipsis; color: rgb(162, 255, 106); margin-left: 0em;'>${account.nickname}</span>
            </div>
            <div class='accountMenuElement copy-nickname'>
                <span class='accountMenuElement-textContent'>Скопировать имя</span>
            </div>
            <div class='accountMenuElement check-profile'>
                <span class='accountMenuElement-textContent'>Профиль</span>
            </div>
        </div>`;
}

export function createAccountMenuHandler(index, event, accounts){
    //проверяем был ли клик произведен на тот же аккаунт или на другой
    if (lastClickedIndex === index) {
        closeAccountMenu();
        lastClickedIndex = null;
    } else {
        //открываем меню на нужных координатах
        closeAccountMenu();
    
        const x = event.clientX / window.innerWidth * 100;
        const y = event.clientY / window.innerHeight * 100;
    
        createAccountMenu(accounts, index, x, y);
        lastClickedIndex = index;
    }
}

function closeAccountMenu() {
    const accountMenuContainer = document.querySelector(".accountMenu-container");
    accountMenuContainer.innerHTML = '';

    document.removeEventListener('click', closeAccountMenuHandler);
    lastClickedIndex = null;
}

function closeAccountMenuHandler(event) {
    let checkProfileButton = document.querySelector(".check-profile");
    let copyNicknameButton = document.querySelector(".copy-nickname");
    
    //проверка для избежания ложных срабатываний
    if (!checkProfileButton.contains(event.target) && !copyNicknameButton.contains(event.target)) 
        closeAccountMenu();
}

function copyNickname(tab, index){
    let nickname = tab[index].nickname.split("] ").pop();
    navigator.clipboard.writeText(nickname);

    closeAccountMenu();
}

//функция открывает рейтинг профиля в новой вкладке
function openProfile(tab, index){
    let nickname = tab[index].nickname.split("] ").pop();

    let pageUrl = `https://ratings.tankionline.com/ru/user/${nickname}`;
    window.open(pageUrl, '_blank');

    closeAccountMenu();
}