import {expectElement} from "./helpers.js";

export async function buySuppliesFromTheShop(){

    for (let i = 0; i < 6; i++){
      if(i!=3){
      const card = document.querySelector(`.ShopCategoryComponentStyle-marginItemsContainer > :nth-child(${i + 1})`);
      console.log(card);
      card.click();
  
      const confirmButton = await expectElement(document, 
        ".BasePaymentComponentStyle-buttonContainer > :first-child");
      confirmButton.click();
      
      const closeButton = await expectElement(document, 
        ".SuccessfulPurchaseComponentStyle-rewardContainer + *");
      closeButton.click();
      }
    }
}
