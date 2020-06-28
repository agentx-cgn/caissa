import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'tachyons/css/tachyons.min.css';
import './app.scss';

import Caissa, { Routes, DefaultRoute } from './view/caissa';

const DEBUG = false;

module.hot && module.hot.accept();

// Wire up mithril app to DOM
try {
    const $root = document.body.querySelector('.root');

    // window.H = H;
    window.Caissa = Caissa;
    Caissa.onafterImport(process.env.NODE_ENV);

    m.route.prefix = '#!';
    m.route($root, DefaultRoute, Routes);

} catch (e) {
    console.error('index.js', e);

}
DEBUG && console.log('Info   :', 'index.js loaded after', Date.now() - window.t0, 'msecs');
