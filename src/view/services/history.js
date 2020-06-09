import { H }       from './helper';
import { Nothing } from '../components/misc';
import Caissa      from '../caissa';
import Tools       from '../tools/tools';

const DEBUG = true;

const candidate = {};
const stack     = [];
let pointer     = NaN;

const detected  = {
    back:       false,
    fore:       false,
    same:       false,
    replace:    false,
    popstate:   false,
    hashchange: false,
};

const History = {

    stack, // needed in Header
    // candidate,
    get pointer () {return pointer;},

    log () {
        stack.forEach( (entry, idx) => {
            if (idx === pointer) {
                console.log('HIST.' + idx, [entry.key, entry.content.name, H.shrink(entry.params)]);
            } else {
                console.log('hist.' + idx, [entry.key, entry.content.name, H.shrink(entry.params)]);
            }
        });
    },

    isCurrent (key) {
        return !!(stack[pointer] && stack[pointer].key === key);
    },

    get current () {
        return !stack.length  ? '' : stack[pointer].key;
    },

    // comes from UI
    onback (e) {
        e.redraw = false;
        const { route, params } = stack[pointer -1];
        Caissa.route(route, params, {back: true});
        return H.eat(e);
    },
    onfore (e) {
        e.redraw = false;
        const { route, params } = stack[pointer +1];
        Caissa.route(route, params, {fore: true});
        return H.eat(e);
    },
    /**
     * Events come on BACK/FORE, user edits adressbar and bookmark click
     * there is always onpopstate and hashchange, except no hashchange if url is same
     */
    onhashchange (e) {
        detected.hashchange = true;
        // console.log('history.onadresschange', e.type);
        return H.eat(e);
    },
    onpopstate (e) {
        detected.popstate = true;
        // console.log('history.onadresschange', e.type);
        return H.eat(e);
    },

    prepare (route, params={}, options={replace: false}) {
        /**
         *  called from onmatch/route,
         *  creates candidate on new route
         *  lots of special cases
        */
        const key = Tools.interpolate(route, params);

        // fresh stack, e.g. after reload
        if (isNaN(pointer)) {
            DEBUG && console.log('history.check.pointer NaN', 'OK');
            candidate[key] = { ...options };

        // candidate exists from former cycle
        } else if (candidate[key]) {
            DEBUG && console.log('history.prepare.ignored.exists', key);

        // ignored, because already there
        } else if (stack[pointer] && stack[pointer].key === key) {
            detected.same = true;
            DEBUG && console.log('history.prepare.ignored.same', key);

        // route.set w/ replace
        } else if (options.replace || detected.replace) {
            candidate[key] = { ...options };
            detected.replace = true;
            DEBUG && console.log('history.prepare.replace', key, '=>', stack[pointer].key), H.shrink(options);

        // back from caissa
        } else if (options.back || detected.back) {
            detected.back = true;
            DEBUG && console.log('history.prepare.back.found', key);

        // fore from caissa
        } else if (options.fore || detected.fore) {
            detected.fore = true;
            DEBUG && console.log('history.prepare.fore', key);

        // something changed addressbar
        } else if (detected.hashchange || detected.popstate) {

            // assuming back
            if (detected.hashchange && stack[pointer -1] && stack[pointer -1].key === key){
                detected.back = true;
                DEBUG && console.log('history.prepare.urlChangeDetected.back', key);

            // assuming fore
            } else if (detected.hashchange && stack[pointer +1] && stack[pointer +1].key === key){
                detected.fore = true;
                DEBUG && console.log('history.prepare.urlChangeDetected.fore', key);

            // assuming fore
            } else if (!detected.hashchange && detected.popstate){
                detected.same = true;
                DEBUG && console.log('history.prepare.urlChangeDetected.same', key);

            // start over
            } else {
                candidate[key] = { ...options };
                while (stack.length){ stack.pop(); }
                DEBUG && console.log('history.prepare.urlChangeDetected.clear', key);
            }

        } else {
            candidate[key] = { ...options };
            DEBUG && console.log('history.prepare.done', key, H.shrink(options));
        }
    },

    finalize (route, params, content) {

        const key = Tools.interpolate(route, params);

        if (detected.replace && candidate[key]) {
            stack[pointer].key    = key;
            stack[pointer].params = params;
            delete candidate[key];
            DEBUG && console.log('history.finalize.replace.done', key, '==', stack[pointer].key);

        } else if (detected.back) {
            pointer -= 1;
            DEBUG && console.log('history.finalize.back.done', stack[pointer]);

        } else if (detected.fore) {
            pointer += 1;
            DEBUG && console.log('history.finalize.fore.done', stack[pointer]);

        } else if (!candidate[key]) {
            DEBUG && console.log('history.finalize.ignored/not prepared', key);

        } else {
            // kick out entries from old browsing path
            while (pointer < stack.length -1){
                // eslint-disable-next-line no-unused-vars
                const entry = stack.pop();
                DEBUG && console.log('history.finalize.popped', pointer, stack.length, entry);
            }
            pointer = stack.push(H.create({key, route, content})) -1;
            delete candidate[key];
            DEBUG && console.log('history.finalize.done', key, stack[pointer]);
        }

    },
    get canAnimate () {
        return !( detected.same || detected.replace || stack.length === 1 );
    },

    /**
     * return three contents from history stack + needed animation
     */
    slides () {

        const noContent = H.create({content: Nothing, params: H.create()});
        let log, res;

        function collectNamesFrom(start, dir) {
            return [0, 1, 2].map(diff => {
                return (stack[pointer + start + diff] || noContent).content.name;
            }).concat([dir, H.shrink(candidate)]);
        }
        function collectContentFrom(start, dir) {
            return [0, 1, 2].map(diff => {
                return (stack[pointer + start + diff] || noContent);
            }).concat([dir, H.shrink(candidate)]);
        }

        if (stack.length === 1) {
            log = collectNamesFrom(-1,   '=1=');
            res = collectContentFrom(-1, '=1=');

        } else if (detected.replace) {
            log = collectNamesFrom(-1,   '=r=');
            res = collectContentFrom(-1, '=r=');

        } else if (detected.same) {
            log = collectNamesFrom(-1,   '=s=');
            res = collectContentFrom(-1, '=s=');

        } else if (detected.back) {
            log = collectNamesFrom(0,    '=b>');
            res = collectContentFrom(0,  '=b>');

        } else if (detected.fore) {
            log = collectNamesFrom(-2,   '<f=');
            res = collectContentFrom(-2, '<f=');

        // clicked
        } else {
            log = collectNamesFrom(-2,   '<c=');
            res = collectContentFrom(-2, '<c=');
        }

        // cleanup
        H.clear(candidate);
        detected.replace    = false;
        detected.back       = false;
        detected.fore       = false;
        detected.same       = false;
        detected.popstate   = false;
        detected.hashchange = false;

        // urlChangeDetected = false;

        return [ res, log ];
    },

};
window.caissa.onimport && window.caissa.onimport('History');
export default History;
