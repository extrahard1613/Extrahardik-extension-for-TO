function openModalMenu() {
    myModalMenu.style.display = 'block';
}
  
function closeModalMenu() {
    myModalMenu.style.display = 'none';
}
  
export function keyPressHandler(event){
  if (event.ctrlKey && event.code === 'KeyM') 
  {
    if (myModalMenu.style.display === 'block') 
      closeModalMenu();
    else 
      openModalMenu();
  }
}