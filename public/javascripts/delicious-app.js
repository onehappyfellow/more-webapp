import '../sass/style.scss';
import { $, $$ } from './modules/bling';
import refillVideo from './modules/refillVideo';
import ajaxSetRate from './modules/setRate';

refillVideo( $('.player') );
/*
const rateForms = $$('#setrate form');
rateForms.on('submit', ajaxSetRate);
*/
function setFill(){
  const fill = document.querySelector('.fill');
  if (!fill) return;
  let percent = 100 - (fill.dataset.fill * 100);
  fill.style.height = `${percent}%`;
};
document.addEventListener("DOMContentLoaded", setFill);
