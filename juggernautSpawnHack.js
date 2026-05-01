import {simulateKeyPress} from "./helpers.js";

let myMutationObserver;
let isGetJuggernautFunctionActive = false;

function foundText(node)
{
  new MutationObserver((mutations, observer) => {
    mutations.forEach((mutation) => {
        if (mutation.target instanceof Element && mutation.target.matches(".BattleMessagesComponentStyle-message")) {

            mutation.addedNodes.forEach((node) => {
              if (node.textContent.includes("Вражеский Джаггернаут вступил в бой"))
              {
                simulateKeyPress("p");
                observer.disconnect();
              }
            });
        }
    });
  }).observe(node, { childList: true, subtree: true });
}

export function initializeJuggernautSpawnHack(){
    myMutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
              if (node instanceof Element && node.matches(".BattleComponentStyle-canvasContainer"))
              {
                foundText(node);
              }
          });
      });
    })
  }
  
  export function toggleJuggernautSpawnHack(){

    if(!isGetJuggernautFunctionActive){
      myMutationObserver.observe(document.documentElement,
        { childList: true, subtree: true });
  
      let DisableJuggernautSpawnHack = document.getElementById("GetJuggernaut"); 
      DisableJuggernautSpawnHack.innerText = "Disable juggernaut spawn hack";
  
      isGetJuggernautFunctionActive = true;
    }
    else
    {
      myMutationObserver.disconnect();
  
      let EnableJuggernautSpawnHack = document.getElementById("GetJuggernaut"); 
      EnableJuggernautSpawnHack.innerText = "Enable juggernaut spawn hack";
  
      isGetJuggernautFunctionActive = false;
    }
  }