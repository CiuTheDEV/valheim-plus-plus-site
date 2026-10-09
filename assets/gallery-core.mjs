export function createGallery(length,reducedMotion=false){
 if(!Number.isInteger(length)||length<1)throw new Error('Galeria musi mieć screeny.');
 let index=0,paused=false;const blockers=new Set();
 const model={
  get index(){return index;},get paused(){return paused;},
  get autoplay(){return length>1&&!paused&&!blockers.size;},
  move(delta,manual=true){if(!manual&&!model.autoplay)return;index=((index+delta)%length+length)%length;},
  select(value){if(!Number.isInteger(value)||value<0||value>=length)return;index=value;},
  pause(){paused=true;},resume(){paused=false;},
  setReducedMotion(on){reducedMotion=on;},
  block(reason,on){if(on)blockers.add(reason);else blockers.delete(reason);}
 };return model;
}
