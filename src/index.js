import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'tachyons/css/tachyons.min.css';
import './app.scss';

import System from './view/data/system';
import State  from './view/data/state';
import DB     from './view/services/database';
import { Events, Routes, DefaultRoute } from './view/caissa';

console.log('Info   :', 'Loaded imports after', Date.now() - window.t0, 'msecs', process.env.NODE_ENV);

if (module.hot) { module.hot.accept(); }

window.caissa = {
    system: System,
    state:  State,
    db:     DB,
};

window.addEventListener('unload',            Events.onunload);
window.addEventListener('beforeunload',      Events.onbeforeunload);
document.addEventListener('selectionchange', Events.onselectionchange);

// Extend Mithril
m.cls = (def = {}, sep = ' ', classes = '') => {
    for (const cls in def) {
        if (def[cls]) {
            classes += `${classes && sep}` + cls;
        }
    }
    return classes;
};

// Wire up mithril app to DOM
const $root = document.body.querySelector('#root');
m.route.prefix = '#!';
m.route($root, DefaultRoute, Routes);

console.log('Info   :', 'index.js loaded after', Date.now() - window.t0, 'msecs');
