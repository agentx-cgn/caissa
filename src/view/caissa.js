
import { H } from './services/helper';
import Pages from './pages';
import DB     from './services/database';

const Routes = {};
const DefaultRoute = '/sources/';

// TODO: This is annoying
// TODO: routes like https://0.0.0.0:3000/#!/game/6/-pw52bh/ don't work after db.reset();
Object.entries(Pages).forEach( entry => {

    const [route, [layout, content, sections, page]] = entry;

    Routes[route] = {
        onmatch ( args ) {
            // Rejecting the promise makes Mithril fall back to the default route.
            redraws && console.log(' ');
            console.log('routes.onmatch.in', 'keys', route, 'args', args, 'flags', page.flags);
            if (page.flags.includes('-')){
                return m.route.SKIP;
            }
        },
        render ( vnode ) {
            console.log('routes.render.in', H.strip(vnode));
            return m(Caissa.view, { page, ...vnode.attrs}, [layout, content, sections]);
        },
    };

});



let redraws = 0;

const Caissa = {

    route ( target, params={}, options={} ) {

        const page = Pages[target];

        if (page) {
            m.route.set(target, params, {title: page.title, ...options});

        } else {
            console.warn('caissa.route.error', target, params, options);

        }
    },

    // eslint-disable-next-line no-unused-vars
    view : function Caissa ( vnode ) {

        // happens only after load/reload
        // console.log('caissa.in', H.strip(vnode));

        return {

            // eslint-disable-next-line no-unused-vars
            oncreate ( vnode ) {
                console.log('Info   :', 'caissa created after', Date.now() - window.t0, 'msecs');
            },

            onupdate ( vnode ) {
                // DOM elements whose vnodes have an onupdate hook do not get recycled.
                console.log('RD', ++redraws, 'caissa.onupdate', H.strip(vnode.attrs));
            },

            view ( vnode ) {

                console.log('caissa.view', H.strip(vnode.attrs));

                const { page } = vnode.attrs;
                const [layout, content, sections] = vnode.children;

                document.title = page.title;

                return m(layout, vnode.attrs,
                    m(content, vnode.attrs, sections),
                );

            },

        };

    },
};

const Events = {
    onbeforeunload : function () {
        DB.caissa('lastend', Date.now());
        console.log('Bye');
    },
    onunload: function () {
        console.log('Info   :', '... done after', Date.now() - window.t0, 'msecs');
        console.log(' ');
    },
    onselectionchange : function() {
        const selection = document.getSelection();
        console.log('Info   :', 'Selection', selection);
    },
};

export { Caissa as default, Routes, DefaultRoute, Events };
