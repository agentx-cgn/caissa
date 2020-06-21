
import './menu.scss';

import Caissa       from '../../caissa';
import Factory      from '../../components/factory';
import Config       from '../../data/config';

import { FlexList, PageTitle, HeaderLeft, FlexListEntry }    from '../../components/misc';

const clicker  = (route, params) => {
    return (e) => {
        e.redraw = false;
        Caissa.route(route, params);
    };
};

const Menu = Factory.create('Menu', {
    view ( vnode ) {

        const { className, style } = vnode.attrs;

        return m('div.page.menu', { className, style },
            m(FlexList, [
                m(PageTitle, 'Menu'),
                ...Array.from(Config.navigation).map( ([route, params, entry]) => {
                    return m(FlexListEntry, { class: '', onclick: clicker(route, params) }, [
                        m(HeaderLeft, [
                            m('i.menu.fa.fa-chess-board'),
                            entry,
                        ]),
                    ]);
                }),
            ]),
        );

    },
});

export default Menu;
