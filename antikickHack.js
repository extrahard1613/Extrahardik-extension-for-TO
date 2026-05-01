import { simulateKeyPress, simulateKeyPress2 } from './helpers.js'

let isAntiKickFunctionActive = false;
let intervalId = null;
let delIntervalId = null;

export function toggleAntiKickHack() {
    const element = document.activeElement;
  
    if (!isAntiKickFunctionActive && element) {
      let EnableAntiKickHack = document.getElementById("Antikick"); 
      EnableAntiKickHack.innerText = "Enable punishment for inactivity";
  
      intervalId = setInterval(() => simulateKeyPress2("s"), 15000);
      //delIntervalId = setInterval(() => simulateKeyPress('t'), 50000)
      isAntiKickFunctionActive = true;
    } else {
      let DisableAntiKickHack = document.getElementById("Antikick"); 
      DisableAntiKickHack.innerText = "Disable punishment for inactivity";
  
      clearInterval(intervalId);
      isAntiKickFunctionActive = false;
    }
  }