import { H }   from './helper';
import DB      from './database';
import Caissa  from '../caissa';
import System  from '../data/state';
import History from '../services/history';

const Events = {
    listen () {
        document.addEventListener('selectionchange', Events.onselectionchange);
        document.addEventListener('swiped-right',    Events.onswipeback);
        document.addEventListener('swiped-left',     Events.onswipefore);
        document.addEventListener('dblclick',        H.eat);

        window.addEventListener('load',              Caissa.onload);
        window.addEventListener('beforeunload',      Events.onbeforeunload);
        window.addEventListener('online',            Events.ononline);
        window.addEventListener('offline',           Events.onoffline);

        window.addEventListener('popstate',          History.onpopstate);
        window.addEventListener('hashchange',        History.onhashchange);
        // window.addEventListener('pagehide',          Events.onpagehide);
        // window.addEventListener('pageshow',          Events.onpageshow);
    },
    onpagehide () {
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event
        // never seen
        // console.log('Events.onpagehide', e.persisted, e);
    },
    onpageshow () {
        // happens long after reload
        // console.log('events.onpageshow', e.persisted, e);
    },
    onswipeback (e) {
        console.log('events.onswipeBack', e);
    },
    onswipefore (e) {
        console.log('events.onswipeFore', e);
    },
    onbeforeunload () {
        DB.Usage('lastend', Date.now());
        console.log('Bye...');
    },
    onselectionchange () {
        // const selection = document.getSelection();
        // console.log('Info   :', 'Selection', selection);
    },
    onpopstate () {
        true && console.log('onpopstate');
    },
    ononline () {
        true && console.log('ononline');
        System.online = true;
    },
    onoffline () {
        true && console.log('onoffline');
        System.online = false;
    },
    hashchange (e) {
        // back button pressed
        // there may be duplicates, bc reroute
        // Caissa.oncreate too
        true && console.log('hashchange', e.oldURL);
        true && console.log('hashchange', e.newURL);
    },
};

(function whichTransitionEvent(){
    var t;
    var el = document.createElement('fakeelement');
    var transitions = {
        'WebkitTransition' :'webkitTransitionEnd',
        'MozTransition'    :'transitionend',
        'MSTransition'     :'msTransitionEnd',
        'OTransition'      :'oTransitionEnd',
        'transition'       :'transitionEnd',
    };

    for(t in transitions){
        if( el.style[t] !== undefined ){
            // return transitions[t];
            // console.log(transitions[t]);
        }
    }
}());

window.caissa.onimport && window.caissa.onimport('Events');
export { Events as default };
