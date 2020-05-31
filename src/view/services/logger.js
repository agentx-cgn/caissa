
const abbr = {
    'engine':     'ENGI',
    'stockfish':  'FISH',
    'analyzer':   'ANLY',
    'logger':     'LOGG',
    'dispatcher': 'DISP',
    'games':      'GAMS',
    'evalgame':   'NEWG',
};

let 
    cnt  = 0,
    list = []
;

log('logger', 'init: ' + new Date().toLocaleTimeString());

function log (source, line) {
    list.unshift (
        counter() + ' ' + (abbr[source] || '----') + ' - ' + colorize(line),
    );
    cnt += 1;
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

function counter () {
    return ('00000' + cnt).slice(-5);
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
