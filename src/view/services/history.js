import { H }       from './helper';
import { Nothing } from '../components/misc';
import Caissa      from '../caissa';

const DEBUG = false;

const candidate = {};
const stack     = [];
let pointer     = NaN;

const detected  = {
    back:        false,
    fore:        false,
    same:        false,
    replace:     false,
    redraw:      false,
    popstate:    false,
    hashchange:  false,
    noanimation: false,
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
    get canBack () {
        return !isNaN(History.pointer) && History.pointer > 0;
    },
    get canFore () {
        return !isNaN(History.pointer) && History.pointer < History.stack.length -1;
    },

    // no checks here
    // inits 'silent' back, no animation
    goback () {
        const { route, params } = stack[pointer -1];
        Caissa.route(route, params, {back: true, noanimation: true});
    },
    gofore (){
        const { route, params } = stack[pointer +1];
        Caissa.route(route, params, {fore: true, noanimation: true});
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

    recent (amount) {
        return stack
            .map(entry => entry.content)
            .slice(-amount)
        ;

    },

    prepare (route, params={}, options={replace: false}) {
        /**
         *  called from onmatch/route,
         *  creates candidate on new route
         *  lots of special cases
        */
        const key = m.buildPathname(route, params);

        // fresh stack, e.g. after reload
        if (isNaN(pointer)) {
            DEBUG && console.log('history.check.pointer NaN', 'OK');
            candidate[key] = { ...options };

        // candidate exists from former cycle
        } else if (candidate[key]) {
            DEBUG && console.log('history.prepare.ignored.exists', key);

        // ignored, because already there, e.g. options form submit, system+module, or filtered content, e.g. GamesList
        } else if (stack[pointer] && stack[pointer].key === key) {
            detected.same = true;
            DEBUG && console.log('history.prepare.ignored.same', key);

        // e.g. pages.afteranimate
        } else if (options.redraw) {
            detected.redraw = true;
            DEBUG && console.log('history.prepare.redraw', key);

        // route.set w/ replace e.g. game+turn
        } else if (options.replace || detected.replace) {
            candidate[key] = { ...options };
            detected.replace = true;
            DEBUG && console.log('history.prepare.replace', key, '=>', stack[pointer].key), H.shrink(options);

        // back from caissa
        } else if (options.back || detected.back) {
            detected.back = true;
            if (typeof options.noanimation !== 'undefined'){
                detected.noanimation = !!options.noanimation;
            }
            DEBUG && console.log('history.prepare.back', key, H.shrink(options));

        // fore from caissa
        } else if (options.fore || detected.fore) {
            detected.fore = true;
            if (typeof options.noanimation !== 'undefined'){
                detected.noanimation = !!options.noanimation;
            }
            DEBUG && console.log('history.prepare.fore', key, H.shrink(options));

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

            // assuming fore ???
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

        const key = m.buildPathname(route, params);

        if (detected.replace && candidate[key]) {
            stack[pointer].key    = key;
            stack[pointer].params = params;
            delete candidate[key];
            DEBUG && console.log('history.finalize.replace.done', key, '==', stack[pointer].key);

        } else if (detected.redraw) {
            DEBUG && console.log('history.finalize.redraw.done', stack[pointer]);

        } else if (detected.same || (stack[pointer] && stack[pointer].key === key)) {
            detected.same = true;
            DEBUG && console.log('history.finalize.same.done', stack[pointer]);

        } else if (detected.back) {
            pointer -= 1;
            DEBUG && console.log('history.finalize.back.done', stack[pointer]);

        } else if (detected.fore) {
            pointer += 1;
            DEBUG && console.log('history.finalize.fore.done', stack[pointer]);

        } else if (!candidate[key]) {
            DEBUG && console.log('history.finalize.nocandidate.ignored', key);

        } else {
            // kick out entries from old browsing path
            while (pointer < stack.length -1){
                // eslint-disable-next-line no-unused-vars
                const entry = stack.pop();
                DEBUG && console.log('history.finalize.next.popped', pointer, stack.length, entry);
            }
            pointer = stack.push(H.create({key, route, params, content})) -1;
            delete candidate[key];
            DEBUG && console.log('history.finalize.next.done', key, stack[pointer]);
        }

    },
    get animation () {
        return (
            stack.length === 1 ? '=1=' :
            detected.replace   ? '=r=' :
            detected.redraw    ? '=w=' :
            detected.same      ? '=s=' :
            (detected.back &&  detected.noanimation)  ? '=b=' :
            (detected.back && !detected.noanimation)  ? '=b>' :
            (detected.fore &&  detected.noanimation)  ? '=f=' :
            (detected.fore && !detected.noanimation)  ? '<f=' :
            '<c='
        );
    },

    /**
     * return three contents from history stack + needed animation
     */
    slides () {

        const noContent = H.create({content: Nothing, route: '', params: {}});
        let log, res, offset;

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
            offset = -1; //pointer === stack.length -1 ? -1 : -2;
            log = collectNamesFrom(offset,   '=r=');
            res = collectContentFrom(offset, '=r=');

        } else if (detected.redraw) {
            offset = -1; //pointer === stack.length -1 ? -1 : -2;
            log = collectNamesFrom(offset,   '=w=');
            res = collectContentFrom(offset, '=w=');

        } else if (detected.same) {
            offset = -1; //pointer === stack.length -1 ? -1 : -2;
            log = collectNamesFrom(offset,   '=s=');
            res = collectContentFrom(offset, '=s=');

        } else if (detected.back) {
            const anim = (detected.noanimation) ? '=b=' : '=b>';
            log = collectNamesFrom(0,    anim);
            res = collectContentFrom(0,  anim);

        } else if (detected.fore) {
            const anim = (detected.noanimation) ? '=f=' : '<f=';
            log = collectNamesFrom(-2,   anim);
            res = collectContentFrom(-2, anim);

        // clicked
        } else {
            log = collectNamesFrom(-2,   '<c=');
            res = collectContentFrom(-2, '<c=');
        }

        // cleanup
        H.clear(candidate);
        detected.replace     = false;
        detected.back        = false;
        detected.fore        = false;
        detected.same        = false;
        detected.redraw      = false;
        detected.popstate    = false;
        detected.hashchange  = false;
        detected.noanimation = false;

        return [ res, log ];
    },

};
export default History;
