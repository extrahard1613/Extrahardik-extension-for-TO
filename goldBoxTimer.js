let myMutationObserver;
let isTimerActive = false;
let prevTimestamp = 0;

function startTimer(timerDiv) {
    let secondsLeft = 20;
    timerDiv.innerHTML = secondsLeft;
    
    let intervalId = setInterval(function() {
      secondsLeft--;
      
      if (secondsLeft <= 3) {
        timerDiv.style.color = 'red';
      }
      
      if (secondsLeft > 0) {
        timerDiv.innerHTML = secondsLeft;
      } else {
        clearInterval(intervalId);
        timerDiv.remove();
      }
    }, 1000);
  }
  
function injectTimerAndStart() {
    let timerContainer = document.getElementById('timerContainer');
    let timerDiv = document.createElement("div");
    timerDiv.className = 'timer';
    timerContainer.appendChild(timerDiv);
    startTimer(timerDiv);
  }

function foundTextGoldBox(node)
{
  new MutationObserver((mutations, observer) => {
    mutations.forEach((mutation) => {
        if (mutation.target instanceof Element && mutation.target.matches(".BattleMessagesComponentStyle-message")) {
            mutation.addedNodes.forEach((node) => {
              if (node.textContent.includes("Скоро будет сброшен золотой ящик")|| 
              node.textContent.includes("Скоро будет сброшен мегаголд")){
                if (Date.now() - prevTimestamp < 5500)
                  return;

                prevTimestamp = Date.now();
                injectTimerAndStart();
              }
            });
        }
    });
  }).observe(node, { childList: true, subtree: true });
}

export function initializeTimerForGolds(){
  myMutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node instanceof Element && node.matches(".BattleComponentStyle-canvasContainer"))
            { 
              foundTextGoldBox(node);
            }    
        });
    });
  })
}

export function toggleTimerForGolds(){

  if(!isTimerActive){
    myMutationObserver.observe(document.documentElement,
      { childList: true, subtree: true });

    let RemoveTimer = document.getElementById("SetTimerForGolds"); 
    RemoveTimer.innerText = "Remove timer for golds";

    isTimerActive = true;
  }
  else
  {
    myMutationObserver.disconnect();

    let SetGoldBoxTimer = document.getElementById("SetTimerForGolds"); 
    SetGoldBoxTimer.innerText = "Set timer for golds";

    isTimerActive = false;
  }
}