/*
    https://sagegerard.com/mithril-router-cleanup.html
    Rejecting the promise makes Mithril fall back to the default route.
    State via import in any module od pass down as attrs.

 *  https://mithril.js.org/route.html#typed-routes also hidden w/ SKIP
 */

// import { H, $$ }       from './services/helper';
import { H }           from './services/helper';
import Caissa          from './caissa';
import Pages           from './pages';

const DefaultRoute = '/sources/';
const Routes = {};

Object.entries(Pages).forEach( entry => {

    const [route, [layout, content, sections, page]] = entry;

    Routes[route] = {
        onmatch ( args ) {
            console.log('routes.onmatch.in', 'keys', route, 'args', args, 'flags', page.flags);
            if (page.flags.includes('-')){
                return m.route.SKIP;
            }
            // if (page.flags.includes('c') && $$('section.section-center')){
            //     setTimeout( () => {
            //         $$('section.section-center').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' });
            //     }, 60);
            // }
            // if (page.flags.includes('l') && $$('section.section-left')){
            //     setTimeout( () => {
            //         $$('section.section-left').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' });
            //     }, 60);
            // }
        },
        render ( vnode ) {
            console.log('routes.render.in', H.strip(vnode));
            return m(Caissa.view, { page, ...vnode.attrs}, [layout, content, sections]);
        },
    };

});

export { Routes, DefaultRoute };
