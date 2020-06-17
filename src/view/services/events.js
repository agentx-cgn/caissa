import { H }   from './helper';
import DB      from './database';
import Caissa  from '../caissa';
import System  from '../data/state';
import History from '../services/history';
import Factory from '../components/factory';
import Logger  from '../services/logger';

// https://developer.mozilla.org/en-US/docs/Web/Events

let deferredPrompt;
let oldWidth = 0;

const Events = {

    listen () {
        window.addEventListener('load',                  Caissa.onload);
        window.addEventListener('beforeunload',          Events.onbeforeunload);
        window.addEventListener('online',                Events.ononline);
        window.addEventListener('offline',               Events.onoffline);
        window.addEventListener('resize',                Events.onresize);
        window.addEventListener('popstate',              History.onpopstate);
        window.addEventListener('hashchange',            History.onhashchange);
        window.addEventListener('deviceorientation',     Events.ondeviceorientation);
        document.addEventListener('beforeinstallprompt', Events.onbeforeinstallprompt);
        document.addEventListener('selectionchange',     Events.onselectionchange);
        document.addEventListener('dblclick',            H.eat);
    },

    ondeviceorientation () {
        Caissa.redraw();
    },
    onresize () {
        const needsRedraw = (
            (oldWidth <= 360 && innerWidth  > 360) ||
            (oldWidth  > 360 && innerWidth <= 360) ||
            (oldWidth  > 720 && innerWidth <= 720) ||
            (oldWidth <= 720 && innerWidth  > 720)
        );
        Factory.onresize();
        needsRedraw && Caissa.redraw();
        oldWidth = innerWidth;
    },
    onbeforeinstallprompt (e) {

        console.log('onbeforeinstallprompt');
        Logger.log('events', 'onbeforeinstallprompt');

        const addBtn = document.querySelector('.a2hs-button');
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI to notify the user they can add to home screen
        addBtn.style.display = 'block';

        addBtn.addEventListener('click', () => {
            // hide our user interface that shows our A2HS button
            addBtn.style.display = 'none';
            // Show the prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {

                    console.log('User dismissed the A2HS prompt');
                }
                deferredPrompt = null;
            });
        });

    },
    // onpagehide () {
    //     // https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event
    //     // never seen
    //     // console.log('Events.onpagehide', e.persisted, e);
    // },
    // onpageshow () {
    //     // happens long after reload
    //     // console.log('events.onpageshow', e.persisted, e);
    // },
    // onswipeback (e) {
    //     console.log('events.onswipeBack', e);
    // },
    // onswipefore (e) {
    //     console.log('events.onswipeFore', e);
    // },
    ononline () {
        true && console.log('ononline');
        System.online = true;
    },
    onoffline () {
        true && console.log('onoffline');
        System.online = false;
    },
    onbeforeunload () {
        DB.Usage.update('0', {lastend: Date.now()}, true);
        console.log('Bye...');
    },
    onselectionchange () {
        // const selection = document.getSelection();
        console.log('Selection', document.getSelection().toString());
    },
    onpopstate () {
        true && console.log('onpopstate');
    },
    hashchange (e) {
        // back button pressed
        // there may be duplicates, bc reroute
        // Caissa.oncreate too
        true && console.log('hashchange', e.oldURL);
        true && console.log('hashchange', e.newURL);
    },
};

// (function whichTransitionEvent(){
//     var t;
//     var el = document.createElement('fakeelement');
//     var transitions = {
//         'WebkitTransition' :'webkitTransitionEnd',
//         'MozTransition'    :'transitionend',
//         'MSTransition'     :'msTransitionEnd',
//         'OTransition'      :'oTransitionEnd',
//         'transition'       :'transitionEnd',
//     };

//     for(t in transitions){
//         if( el.style[t] !== undefined ){
//             // return transitions[t];
//             // console.log(transitions[t]);
//         }
//     }
// }());

export { Events as default };
