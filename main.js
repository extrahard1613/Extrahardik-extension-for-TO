import {keyPressHandler} from "./menu.js";
import {toggleTimerForGolds, initializeTimerForGolds} from "./goldBoxTimer.js";
import {toggleJuggernautSpawnHack, initializeJuggernautSpawnHack} from "./juggernautSpawnHack.js";
import {removeGraphicContexts, interceptGraphicContexts} from "./graphicContexts.js";
import {toggleAntiKickHack} from "./antikickHack.js";
import {expectElement} from "./helpers.js";
import {buySuppliesFromTheShop} from "./autoPurchaseSuppliesFromShop.js";
import {
    openAccountsList,
    closeAccountsList,
    updateTancoins,
    detectBattleLoading,
    detectAccountInformationChanges
} from "./multipleAccount/index.js";
import {createOverdriveTimer, startOverdriveTimer } from './overdriveTimer.js';
  
let myMutationObserver;
let isBuyingSupplies = false;
let injectedElements = document.getElementById("modal-root");
injectedElements.innerHTML = `<div id='myModalMenu' class='modalMenu'>
    <div class='modalMenu-content'>
      <div class='menuHead'>Main menu</div>
          <ul class='menu'>
            <li><a id='Antikick'>Disable punishment for inactivity</a></li>
            <li><a id='SetTimerForGolds'>Set timer for golds</a></li>
            <li><a id='GetJuggernaut'>Enable juggernaut spawn hack</a></li>
            <li><a id='RemoveContexts'>Remove graphic contexts</a></li>
            <li></li>
          </ul> 
      <div class='menuFoot'>Made by extra_hard</div>
    </div>
  </div>
  <div id='timerContainer'></div>
  <div class="overdrive-timer-container">
    <div class="overdrive-timer">
    
    </div>
  </div>
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

/*
function addMouseoverHandlerToFlexStart() {
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Tab') {
      const flexStartElements = document.querySelectorAll('.Common-flexStart');

      flexStartElements.forEach(flexStartElement => {
        const elementInsideFlexStart = flexStartElement.querySelector('.Common-maskImage');
        
        if (elementInsideFlexStart) {
          const computedStyle = getComputedStyle(elementInsideFlexStart).getPropertyValue("-webkit-mask-image");

          elementInsideFlexStart.addEventListener('mouseover', function() {
            handleMouseover(computedStyle, true);
          });

          elementInsideFlexStart.addEventListener('mouseout', function() {
            handleMouseover(computedStyle, false);
          });
        }
      });
    }
  });
}

function handleMouseover(computedStyle, isMouseOver) {
  const defenceLabelElements = document.querySelectorAll('.BattleTabStatisticComponentStyle-defenceLabel');

  defenceLabelElements.forEach(function(defenceLabelElement) {
    const elements = defenceLabelElement.querySelectorAll('.Common-maskImageContain.Common-maskImage');

    elements.forEach(function(element) {
      var computedStyles = window.getComputedStyle(element);
      var backgroundImage = computedStyles.getPropertyValue('-webkit-mask-image');

      if (backgroundImage.includes(computedStyle)) {
        if (isMouseOver) {
          
          element.style.backgroundColor = 'rgb(254, 102, 102)';
          element.nextElementSibling.style.color = 'rgb(254, 102, 102)';
        } else {
          element.style.backgroundColor = ''; 
          element.nextElementSibling.style.color = ''; 
        }
      }      
    });
  });
}

addMouseoverHandlerToFlexStart();
*/

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

setTimeout(async () => {
  while (true) {
      const element = await expectElement(document, 
        ".ShopCategoryOfferSectionStyle-innerContainer > :nth-child(2) .ShopCategoryComponentStyle-marginItemsContainer");
      
      let buttonBuyAll = document.createElement("div");
      buttonBuyAll.className = "BuyAllButton";
      buttonBuyAll.textContent = "Купить все";
      buttonBuyAll.style.marginTop = "-1rem";
      buttonBuyAll.style.marginBottom = "1rem";

      element.before(buttonBuyAll);
      
      const card = document.querySelector(".ShopCategoryComponentStyle-marginItemsContainer > :nth-child(1)");
      const originalAnimation = card.style.animation;
  
      buttonBuyAll.addEventListener("mouseover", function() {
        if (!isBuyingSupplies){
          for (let i = 0; i < 6; i++) {
            if (i != 3) {
                 const card = document.querySelector(`.ShopCategoryComponentStyle-marginItemsContainer > :nth-child(${i + 1})`);

                const secondChild = card.children[1];
                 if (secondChild && !secondChild.classList.contains('ShowcaseItemComponentStyle-footer')) {
                     card.style.animation = "lift-up 0.2s ease-in-out forwards";
                }
            }
          }
        }
      });

      buttonBuyAll.addEventListener("mouseout", function() {
          for (let i = 0; i < 6; i++) {
            if (i != 3) {
                const card = document.querySelector(`.ShopCategoryComponentStyle-marginItemsContainer > :nth-child(${i + 1})`);

                const secondChild = card.children[1];
                if (secondChild && !secondChild.classList.contains('ShowcaseItemComponentStyle-footer')) {
                    card.style.animation = "lift-down 0.2s ease-in-out forwards";
                    
                    setTimeout(() => {
                        card.style.animation = null;
                    }, 200);
                }
            }
        }
      });
      
      buttonBuyAll.addEventListener("click", async function() {
        isBuyingSupplies = true; 
        await buySuppliesFromTheShop();
        isBuyingSupplies = false; 
    });
  }
}, 0);

/* let delayEnabled = false;
let messageQueue = [];
let timerActive = false;

document.addEventListener('keydown', function (event) {
    if (event.key === 'r') 
        delayEnabled = true;
});

const OriginalWebSocket = window.WebSocket;

window.WebSocket = function (...args) {
    const socket = new OriginalWebSocket(...args);

    const originalSend = socket.send;

    function copyData(data) {
        if (data instanceof DataView) {
            const copiedBuffer = data.buffer.slice(0); 
            return new DataView(copiedBuffer, data.byteOffset, data.byteLength);
        } else {
            return JSON.parse(JSON.stringify(data));
        }
    }

    socket.send = function (data) {
        if (delayEnabled) {
            
            const copiedData = copyData(data);
            messageQueue.push(copiedData);

            if (!timerActive) {
                timerActive = true;

                setTimeout(() => {
                    while (messageQueue.length > 0) {
                        const message = messageQueue.shift();
                        originalSend.apply(socket, [message]);
                    }

                    delayEnabled = false;
                    timerActive = false;
                }, 2000);
            }
        } else {
            originalSend.apply(socket, [data]);
        }
    };

    return socket;
}; 
 */

function createDot(){
  const dot = document.createElement('div')
	dot.style.position = 'fixed'
	dot.style.top = '25%'
	dot.style.left = '50%'
	dot.style.width = '5px'
	dot.style.height = '5px'
	dot.style.backgroundColor = 'black'
	dot.style.borderRadius = '50%'
	dot.style.transform = 'translate(-50%, -50%)'
	dot.style.zIndex = '9999'
	document.body.appendChild(dot)
}

function makeColoredGoldsBoxMessages(){
  myMutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node instanceof Element && node.matches(".BattleComponentStyle-canvasContainer"))
            { 
              new MutationObserver((mutations, observer) => {
                mutations.forEach((mutation) => {
                    if (mutation.target instanceof Element && mutation.target.matches(".BattleMessagesComponentStyle-message")) {
                        mutation.addedNodes.forEach((node) => {
                          if (/взял золотой ящик|взял мегаголд/.test(node.textContent)) {
                            node.parentElement.style.setProperty('color', '#fac42c', 'important');
                          }
                          else if(/ключ/.test(node.textContent)){
                            node.parentElement.style.setProperty('color', '#858690', 'important');
                          }
                          else if(/энергией/.test(node.textContent)){
                            node.parentElement.style.setProperty('color', '#31ec0c', 'important');
                          }
                        });
                    }
                });
              }).observe(node, { childList: true, subtree: true });
            }    
        });
    });
  }).observe(document.documentElement,
    { childList: true, subtree: true });
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyZ') {
    startOverdriveTimer(95); 
  }
});

document.addEventListener('keydown', event => {
	if (event.key === 'F5') {
		event.preventDefault();
		location.reload();
	}
});

//createDot();
interceptGraphicContexts();
initializeJuggernautSpawnHack(); 
makeColoredGoldsBoxMessages();
createOverdriveTimer();
initializeTimerForGolds();

document.addEventListener("keydown", keyPressHandler);

let antiKickFromBattle = document.getElementById("Antikick");
antiKickFromBattle.addEventListener("click", toggleAntiKickHack);

let getJuggernaut = document.getElementById("GetJuggernaut");
getJuggernaut.addEventListener("click", toggleJuggernautSpawnHack);

let removeContexts = document.getElementById("RemoveContexts");
removeContexts.addEventListener("click", removeGraphicContexts);

let setGoldTimer = document.getElementById("SetTimerForGolds");
setGoldTimer.addEventListener("click", toggleTimerForGolds);
