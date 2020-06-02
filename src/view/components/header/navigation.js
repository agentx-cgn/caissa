
import Config from '../../data/config';
import { $$ } from '../../services/helper';
import Caissa from '../../caissa';
import { Backdrop } from '../misc';

export default {

    view( vnode ) {

        const { navi } = vnode.attrs;
        const clicker  = (href) => {
            return () => {
                Backdrop.hide();
                Caissa.route(href);
                $$('#toggle-mobile-menu').checked = false;
            };
        };

        return m('nav', {id: 'site-navigation', ...vnode.attrs}, [

            // hamburger
            m('label', {for:'toggle-mobile-menu', 'aria-label':'Menu'},
                m('i.hamburger.fa.fa-bars '),
                m('span.home.f4.fiom.white.pl3', 'Caissa'),
            ),

            // toggle, needs id for label
            m('input[type=checkbox]', {id: 'toggle-mobile-menu', oninput: ({ target }) => {
                target.checked && Backdrop.show( () => {
                    $$('#toggle-mobile-menu').checked = false;
                });
            }}),

            m('ul', [
                ...Config.navigation.map( (item) => {
                    const [href, child] = item;
                    return m('li', {onclick: clicker(href), class: href.startsWith(navi) ? 'selected' : 'unselected'}, child);
                }),
                m('li.unselected', m('a.link', {target:'_blank', href: 'https://github.com/agentx-cgn/caissa'}, 'SOURCE')),
                m('li.unselected', m('a.link', {target:'_blank', href: 'https://caissa.js.org/'}, 'LIVE')),

            ]),

        ]);
    },
};
