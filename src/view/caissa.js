
// Order matters :(
import { H, $$ }       from './services/helper';
import System          from './data/system';
import Logger          from './services/logger';
import DB              from './services/database';
import Events          from './services/events';
import Factory         from './components/factory';
import History         from './services/history';

// last :(
import { ConfigPages, DefaultRoute } from './data/config-pages';

const DEBUG = true;

let redraws = 0, offset = 50;

// available in console as window.Caissa
const Caissa = {

    // available for debugging
    H, DB, System,

    // happens once in index.js
    onafterImport () {
        Logger.log('caissa', 'onafterImport');
        Events.listen();
    },

    onregister : function (text) {
        offset += 50;
        setTimeout( function () {
            const $msgs = $$('loading-screen .messages');
            $msgs.innerHTML += '<br>' + text;
        }, offset);
    },

    //from loading screen
    start () {
        document.body.removeChild($$('loading-container'));
    },
    // == window.onload
    onload () {
        Logger.log('caissa', 'onload');
        const t = Date.now() - window.t0;
        t > 2000
            ? console.warn('Warn   :', '... done after', 0, t, 'msecs')
            : console.log ('Info   :', '... done after', 0, t, 'msecs')
        ;
        if (DB.Options.first['ui'].waitscreen) {
            $$('loading-screen .start').style.display        = 'inline-block';
            $$('loading-screen .reload').style.display       = 'inline-block';
            $$('loading-screen .a2home').style.display       = 'inline-block';
            $$('loading-screen .dump').style.display         = 'inline-block';
            $$('loading-screen .option-waitscreen').style.display  = 'inline-block';
        } else {
            document.body.removeChild($$('loading-container'));
        }
        console.log(' ');
    },

    redraw () {
        console.log(' ');
        History.prepare('',  {}, {redraw: true});
        m.redraw();
    },

    // wrapper for m.route.set
    route ( route, params={}, options={replace:false} ) {

        console.log(' ');
        DEBUG && console.log('%cCaissa.route.in %s %s %s', 'color:darkred; font-weight: 800', route, H.shrink(params), H.shrink(options) );

        const page = ConfigPages[route];

        if (page) {
            History.prepare(route, params, options);
            m.route.set(route, params, {title: page.title, ...options});

        } else {
            console.warn('caissa.route.error', route, params, options);

        }
    },

    resolver (route, pageentry) {
        return {
            onmatch ( params ) {

                try {
                    DEBUG && redraws && console.log(' ');
                    const target  = m.buildPathname(route, params);
                    const current = History.isCurrent(target) ? 'current' : 'new';
                    DEBUG && console.log('%cCaissa.onmatch.in %s %s ', 'color:darkblue; font-weight: 800', target, current);
                    History.prepare(route, params);

                } catch (e) {console.log(JSON.stringify(e), e);}

            },
            render ( vnode ) {

                const content = pageentry[1];
                const target  = m.buildPathname(route, vnode.attrs);
                const current = History.isCurrent(target) ? 'current' : 'new';
                DEBUG && console.log('%cCaissa.render.in %s %s', 'color:darkorange; font-weight: 800', target, current);

                History.finalize(route, vnode.attrs, content);

                return m(Caissa.comp, { route, params: vnode.attrs });
            },
        };
    },

    comp : Factory.create('Caissa', {
        view ( vnode ) {

            const { route, params } = vnode.attrs;
            const [ Layout, Content, Section, pagedata ] = ConfigPages[route];
            const target   = m.buildPathname(route, params);

            DEBUG && console.log('%cCaissa.view.in %s %s', 'color:darkgreen; font-weight: 800', target, History.animation);

            document.title = pagedata.title;

            return m(Layout, { route, params }, [ Content, Section ]);

        },

    }),

};

// const DefaultRoute = ConfigPages.DefaultRoute; //'/sources/';
const Routes = H.transform(ConfigPages, Caissa.resolver);

export {
    Caissa as default,
    Routes,
    DefaultRoute,
};
