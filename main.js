import {expectElement} from "./helpers.js";
import {
    openAccountsList,
    closeAccountsList,
    updateTancoins,
    detectBattleLoading,
    detectAccountInformationChanges
} from "./multipleAccount/index.js";

let injectedElements = document.getElementById("modal-root");
injectedElements.innerHTML = `
  <div class='multipleAccount-popupContainer'>
      <div class='accountMenu-container'></div>
      <div class='multipleAccount'>
          <div class='multipleAccount-header'>
              <span>Аккаунты</span>
              <div class='closeMultipleAccountButton-Container'>
                  <div class='closeMultipleAccountButton'></div>
              </div>
          </div>
          <div class='multipleAccount-navigation'>
              <div class='accountListTab-conatiner'>
                  <div class='accountListTab' id='firstTab'>
                      <span id='firstTab-textContent'>Все</span>
                      <div class='activeTabUnderline' id='firstActiveTabUnderline'></div>
                  </div>
                  <div class='accountListTab'  id='secondTab'>
                      <span id='secondTab-textContent'>Группа А</span>
                      <div class='activeTabUnderline' id='secondActiveTabUnderline'></div>
                  </div>
                  <div class='accountListTab' id='thirdTab'>
                      <span id='thirdTab-textContent'>Группа Б</span>
                      <div class='activeTabUnderline' id='thirdActiveTabUnderline'></div>
                  </div>
              </div>
              <div class='searchAccountInput-container'>
                  <input type='text' placeholder='найти' class='searchAccountInput'>
                  <div class='searchAccountInput-backgroundImage'></div>
              </div>    
          </div>
          <div class='multipleAccount-main'>
              <table class='accountList-table'>
                  <tbody class='accountList-tbody' id='firstAccountList'>
                  </tbody>
                  <tbody class='accountList-tbody' id='secondAccountList'>
                  </tbody>
                  <tbody class='accountList-tbody' id='thirdAccountList'>
                  </tbody>
              </table>
          </div>
          <div class='multipleAccount-footer'>
              <div class='addAccountButton'>Добавить аккаунт</div>
          </div>
      </div>
  </div>`

function lookingForTancoins() {
    let lastState = false;
    let timeout = null;

    const observer = new MutationObserver(() => {
        const tankcoinContainer = document.querySelector('.UserScoreComponentStyle-coinBlock');
        const isShopOpen = !!tankcoinContainer;

        if (isShopOpen && !lastState) {
            updateTancoins();
        }

        lastState = isShopOpen;
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Функция слежки за экраном входа
function watchForLogout() {
    const observer = new MutationObserver(() => {
        // Ищем контейнер формы входа
        const loginForm = document.querySelector('[class*="EntranceComponentStyle-container"]');
        
        // Если форма на экране и в URL всё еще висит ID
        if (loginForm && window.location.hash) {
            window.history.replaceState(null, "", window.location.origin + window.location.pathname);
        }
    });

    observer.observe(document.documentElement, { 
        childList: true, 
        subtree: true 
    });
}

watchForLogout();

setTimeout(async () => {
  // 2. Основной цикл внедрения кнопки в лобби
  while (true) {
    const element = await expectElement(document, ".FooterComponentStyle-newsButton");

    if (!document.querySelector(".FooterComponentStyle-accountsButton")) {
      // 3. Запускаем слежку за обновлением данных (тоже один раз при входе в лобби)
      detectAccountInformationChanges();
      detectBattleLoading();
      await lookingForTancoins();

      // Внедряем кнопку
      let accountSwitchButton = document.createElement("li");
      accountSwitchButton.className = "FooterComponentStyle-containerMenu FooterComponentStyle-accountsButton";
      accountSwitchButton.innerHTML = "<div></div>";   
      element.before(accountSwitchButton);

      accountSwitchButton.addEventListener("click", openAccountsList);

      // Настройка закрытия (делаем один раз для существующих в DOM элементов)
      setupCloseListeners(); 
    }
    
    // Небольшая пауза, чтобы не нагружать поток, если кнопка вдруг исчезнет
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}, 0);

function setupCloseListeners() {
    const closeBtn = document.querySelector(".closeMultipleAccountButton-Container");
    if (closeBtn) closeBtn.onclick = closeAccountsList;

    const popupZone = document.querySelector(".multipleAccount-popupContainer");
    if (popupZone) {
        popupZone.onclick = function(event) {
            if (event.target === this) closeAccountsList();
        };
    }
}
