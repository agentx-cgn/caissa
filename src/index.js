import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'tachyons/css/tachyons.min.css';
import './app.scss';

import Caissa, { Routes, DefaultRoute } from './view/caissa';

const DEBUG = false;

module.hot && module.hot.accept();

try {

    const $root = document.body.querySelector('.root');

    // setup routes + strategy and wire up mithril app to DOM
    m.route.prefix = '#!';
    m.route($root, DefaultRoute, Routes);

    // make Caissa available in console
    window.Caissa = Caissa;

    // tell Caissa we're ready
    Caissa.start(process.env.NODE_ENV);

} catch (e) {
    console.error('index.js', e);

}

DEBUG && console.log('Info   :', 'index.js loaded after', Date.now() - window.t0, 'msecs');
