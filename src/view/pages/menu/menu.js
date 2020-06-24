
import './menu.scss';

import Caissa       from '../../caissa';
import Factory      from '../../components/factory';
import Config       from '../../data/config';

import { FlexList, PageTitle, TextLeft, FlexListEntry }    from '../../components/misc';

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
                //TODO: oly show 'Game', if at least one exists in DB
                ...Array.from(Config.navigation).map( ([route, params, entry]) => {
                    return m(FlexListEntry, { class: '', onclick: clicker(route, params) }, [
                        m(TextLeft, {class: 'f3'}, [
                            m('i.menu.fa.fa-chess-board'),
                            entry,
                            m('div.f5.c666.pb1', 'some clever hints'),
                        ]),
                    ]);
                }),
            ]),
        );

    },
});

export default Menu;
