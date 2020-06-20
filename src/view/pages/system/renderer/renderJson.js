/* eslint-disable no-prototype-builtins */

function renderCollapsed(sprop, isArray, path, statusLookup, length/*, level */) {
    return m('div', [
        '' + sprop + (isArray ? '[' : '{'),
        m('button', { onclick: () => statusLookup[path] = false }, '+'),
        (isArray ? '] [' + length + ']' : '}'),
    ]);
}

function renderExpanded(sprop, tree, paths, isArray, path, statusLookup, options, level) {
    var divs = [];
    divs.push('' + sprop + (isArray ? '[' : '{'));
    divs.push( m('button', {onclick: () => statusLookup[path] = true}, '-'));
    for (var key in tree) {
        // if (!tree.hasOwnProperty(key)) continue;
        var child = tree[key];
        var newpath = paths.slice();
        newpath.push(key);
        divs.push(renderTree(key, child, newpath, statusLookup, options, level +1));
    }
    divs.push((isArray ? ']' : '}'));
    return m('div', divs);
}

function renderTree(prop, tree, paths, statusLookup, options, level) {

    var length, value, filler;
    var sprop   = prop === null ? '' : prop + ' : ';
    var path   = JSON.stringify(paths);
    var collapsed = statusLookup[path] !== undefined ? statusLookup[path] : paths.length > options.collapseAfter;

    if (tree !== null && tree instanceof Array) {
        length = tree.length;
        return collapsed
            ? renderCollapsed(sprop, true, path, statusLookup, length, level)
            : renderExpanded (sprop, tree, paths,   true, path, statusLookup, options, level)
        ;
    }

    if (tree !== null && typeof tree === 'object') {
        return collapsed
            ? renderCollapsed(sprop, false, path, statusLookup, level )
            : renderExpanded (sprop, tree, paths, false, path, statusLookup, options, level)
        ;
    }

    value  =
        typeof tree === 'function'
            ? 'function'
            : (tree === undefined)
                ? 'undefined'
                : JSON.stringify(tree).replace(/"/g, '\'')
    ;
    filler = Array(Math.max(1, 12 - (prop||'').length)).fill('&nbsp;').join('');
    sprop  = prop + ' :' + filler;
    return level < 3 // 3 is top level
        ? m('div.fiob', m.trust(sprop), m('div.dib.fior.ma0', value))
        : m('div', m.trust(sprop + value))
    ;

    // return m(level < 3 ? 'div.fw8' : 'div.fw4', sprop + '#' + JSON.stringify(tree));

}

export default function ( ) {

    // var attrs = vnode.attrs;
    // var options = attrs.options || {};
    var statusLookup = {};

    return {
        view: function (vnode) {
            const { tree, options } = vnode.attrs;
            return renderTree(null, tree, [], statusLookup, options, 0);
        },
    };
}


