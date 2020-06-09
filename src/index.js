import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'tachyons/css/tachyons.min.css';
import './app.scss';

import System from './view/data/system';
import State  from './view/data/state';
import DB     from './view/services/database';
import { H }  from './view/services/helper';
import Events from './view/services/events';
import Caissa, { Routes, DefaultRoute } from './view/caissa';

const DEBUG = false;

DEBUG && console.log('Info   :', 'Loaded imports after', Date.now() - window.t0, 'msecs', process.env.NODE_ENV);

module.hot && module.hot.accept();

window.H = H;
window.caissa.system = System;
window.caissa.state = State;
window.caissa.db = DB;
window.caissa.onstart = Caissa.onstart;
Events.listen();

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
const $root = document.body.querySelector('.root');
m.route.prefix = '#!';
m.route($root, DefaultRoute, Routes);

DEBUG && console.log('Info   :', 'index.js loaded after', Date.now() - window.t0, 'msecs');
