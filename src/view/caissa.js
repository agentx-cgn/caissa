
// Order matters :(
import { H, $$ }       from './services/helper';
import System          from './data/system';
import Config          from './data/config';
import Options         from './data/options';
import Logger          from './services/logger';
import DB              from './services/database';
import ECOS            from './services/ecos';
import History         from './services/history';
import Events          from './services/events';
import Factory         from './components/factory';

// last :(
import { ConfigPages, DefaultRoute } from './data/config-pages';

const DEBUG = true;

let redraws = 0; // that's a counter

// available in console as window.Caissa
const Caissa = {

    // available for debugging
    H, DB, ECOS, System,

    //
    dumpDB () {
        const dump = JSON.stringify({
            DB:      DB.all(),
            SYSTEM:  System,
            CONFIG:  Config,
            OPTIONS: Options,
        }, null, 2).replace(/\\"/g, '\'');

        const body = document.body;
        body.style.whiteSpace   = 'pre';
        body.style.background   = 'white';
        body.style.overflow     = 'auto';
        body.style.color        = 'black';
        body.style.fontFamily   = 'monospace';
        document.body.innerText = dump;
    },

    // signal from index.js
    start (env) {

        Caissa.Env = env[0].toUpperCase() + env.substring(1);

        Logger.log('caissa', 'onafterImport', process);
        DEBUG && console.log('Info   :', Caissa.Env, 'loaded imports after', Date.now() - window.t0, 'msecs');

        Events.listen();
    },

    //from loader screen, //TODO: needed here?
    closeLoader () {
        document.body.removeChild($$('loader-container'));
    },

    // onComponentCreated : function (comp) {
    //     offset += 16;
    //     setTimeout( function () {
    //         const $msgs = $$('loader-screen .messages');
    //         $msgs.innerHTML += '<br>' + comp.name;
    //     }, offset);
    // },

    // == window.onload
    onload () {

        Logger.log('caissa', 'onload');

        const t = Date.now() - window.t0;

        t > 2000
            ? console.warn('Warn   :', '... done after', t, 'msecs', '\n')
            : console.log ('Info   :', '... done after', t, 'msecs', '\n')
        ;

        if (DB.Options.first['ui'].waitscreen) {
            $$('loader-screen h3').innerHTML = 'Caissa';
            $$('loader-screen .group2').style.display        = 'inline-block';
            $$('loader-screen .group3').style.display        = 'inline-block';
            $$('loader-screen .group4').style.display        = 'inline-block';
            $$('loader-screen .group5').style.display        = 'inline-block';
            $$('loader-screen .dump').style.display          = 'inline-block';
            $$('loader-screen input[type="checkbox"]').checked  = true;
            $$('loader-screen input[type="text"]').value      = DB.Options.first['user-data'].name;

        } else {
            Caissa.closeLoader();
            // document.body.removeChild($$('loader-container'));
        }

        // take over error handling
        window.onerror = function () {
            console.warn('Error :', arguments);
        };
        window.onunhandledrejection = function (e) {
            e.preventDefault();
            console.warn('Error :', e.type, e.reason, e);
        };
        console.log(' ');
    },

    redraw (e) {
        console.log(' ');
        e && (e.redaw = false);
        History.prepare('',  {}, {redraw: true});
        m.redraw();
    },

    // wrapper for m.route.set
    route ( route, params={}, options={replace:false} ) {

        console.log(' ');
        DEBUG && console.log('%cCaissa.route.in %s %s %s', 'color:darkred; font-weight: 800', route, H.shrink(params), H.shrink(options) );

        const cfgPage = ConfigPages[route];

        if (cfgPage) {
            History.prepare(route, params, options);
            m.route.set(route, params, {title: cfgPage.title, ...options});

        } else {
            console.error('caissa.route.error', route, params, options);

        }

    },

    resolver (route, pageConfig) {

        const pageComp = pageConfig[1];

        return {
            onmatch ( params ) {

                try {

                    if (DEBUG) {
                        redraws && console.log(' ');
                        const target  = m.buildPathname(route, params);
                        const current = History.isCurrent(target) ? 'current' : 'new';
                        console.log('%cCaissa.onmatch.in %s %s ', 'color:darkblue; font-weight: 800', target, current);
                    }

                    History.prepare(route, params);

                } catch (e) {console.log(JSON.stringify(e), e);}

            },
            render ( vnode ) {

                if (DEBUG){
                    const target  = m.buildPathname(route, vnode.attrs);
                    const current = History.isCurrent(target) ? 'current' : 'new';
                    const style   = 'color:darkorange; font-weight: 800';
                    console.log('%cCaissa.render.in %s %s', style, target, current);
                }

                History.finalize(route, vnode.attrs, pageComp);

                return m(Caissa.comp, { route, params: vnode.attrs });
            },
        };
    },

    comp : Factory.create('Caissa', {
        view ( vnode ) {

            const { route, params } = vnode.attrs;
            const [ Layout, Content, Section, pageOptions ] = ConfigPages[route];

            if (DEBUG) {
                const target = m.buildPathname(route, params);
                const style  = 'color:darkgreen; font-weight: 800';
                console.log('%cCaissa.view.in %s %s', style, target, History.animation);
            }

            //TODO: this is actually dynamic
            document.title = pageOptions.title;

            return m(Layout, { route, params }, [ Content, Section ]);

        },

    }),

};

const Routes = H.transform(ConfigPages, Caissa.resolver);

export {
    Caissa as default,
    Routes,
    DefaultRoute,
};
