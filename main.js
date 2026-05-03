import {expectElement} from "./helpers.js";
import {
    openAccountsList,
    closeAccountsList,
    detectBattleLoading,
    initInterface,
    SELECTORS,
    replaceAccountInformation,
    lookingForTancoins,
    watchForLogout
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

let lobbyTimer = null;

const lobbyObserver = new MutationObserver(() => {
    clearTimeout(lobbyTimer);

    lobbyTimer = setTimeout(() => {
        const newsElement = document.querySelector(SELECTORS.LOBBY.NEWS);
        const buttonExists = document.querySelector(SELECTORS.LOBBY.OPENBUTTON);

        if (newsElement && !buttonExists) {
            injectAccountButton(newsElement);
        }
    }, 400);
});

lobbyObserver.observe(document.body, {
    childList: true,
    subtree: true
});

function injectAccountButton(targetElement) {
  lookingForTancoins();

  const accountSwitchButton = document.createElement("li");
  accountSwitchButton.className = `${SELECTORS.LOBBY.MENU.slice(1)} ${SELECTORS.LOBBY.OPENBUTTON.slice(1)}`;
  accountSwitchButton.innerHTML = "<div></div>";
  
  targetElement.before(accountSwitchButton);
  accountSwitchButton.addEventListener("click", openAccountsList);

  detectBattleLoading();
  setupCloseListeners();
  initInterface();
  replaceAccountInformation();
}

function setupCloseListeners() {
    const closeBtn = document.querySelector(SELECTORS.UI.CLOSEBUTTON);
    if (closeBtn) closeBtn.onclick = closeAccountsList;

    const popupZone = document.querySelector(SELECTORS.UI.POPUP );
    if (popupZone) {
        popupZone.onclick = function(event) {
            if (event.target === this) closeAccountsList();
        };
    }
}

watchForLogout();
