import System from '../data/system';

const abbr = {
    'engine':     'ENGI',
    'stockfish':  'FISH',
    'analyzer':   'ANLY',
    'logger':     'LOGG',
    'dispatcher': 'DISP',
    'games':      'GAMS',
    'evalgame':   'NEWG',
    'events':     'EVTS',
    'caissa':     'CAIS',
};

let list = [];

log('logger', 'init: ' + new Date().toLocaleDateString());
log('logger', 'init: ' + new Date().toLocaleTimeString());
log('logger', 'init: ' + System.userAgent);

function log (source, line) {
    list.unshift (
        new Date().toLocaleTimeString() + ' ' + (abbr[source] || '----') + ' - ' + colorize(line),
    );
}
function shrink (obj) {
    return JSON.stringify(obj).replace(/"/g, '').slice(0, 140);
}

function colorize (line) {
    return (
        line
            .replace(/infinite/g, '<strong class="dark-blue">infinite</strong>')
            .replace(/readyok/g,  '<strong class="dark-green">readyok</strong>')
            .replace(/uciok/g,    '<strong class="dark-green">uciok</strong>')
            .replace(/bestmove/g, '<strong class="dark-blue">bestmove</strong>')
            .replace(/ponder/g,   '<strong class="dark-blue">ponder</strong>')
            .replace(/-r>/g,      '<strong class="dark-red">==></strong>')
            .replace(/-g>/g,      '<strong class="dark-green">==></strong>')
    );
}

export default {
    log,
    shrink,
    search (what) {
        if ((what).length > 2){
            return list.filter( line => line.includes(what));
        } else {
            return list;
        }
    },

};
