import { initTheme } from './theme.js';
import { initPillNavigation } from './navbar.js';
import { setupContact } from './contact.js';
import './clean.scss';
import './navbar.scss';
import './theme.scss';
import './product.scss';
let motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
try{if(localStorage.getItem('icypluto-motion')==='off')motion=false;}catch{}
const button=document.querySelector('#motion-toggle');
function sync(){document.body.classList.toggle('motion-off',!motion);button.textContent=motion?'Motion on':'Motion off';button.setAttribute('aria-pressed',String(!motion));document.documentElement.style.scrollBehavior=motion?'smooth':'auto';}
button.addEventListener('click',()=>{motion=!motion;try{localStorage.setItem('icypluto-motion',motion?'on':'off');}catch{}sync();});
setupContact();const disposeTheme=initTheme(),navigation=initPillNavigation(()=>motion);document.querySelector('#year').textContent=new Date().getFullYear();sync();
if(import.meta.hot)import.meta.hot.dispose(()=>{disposeTheme();navigation.dispose();});
