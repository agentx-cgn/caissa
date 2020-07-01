
import './menu.scss';

import Caissa       from '../../caissa';
import Factory      from '../../components/factory';
import Config       from '../../data/config';

import { FlexList, PageTitle, TextLeft, FlexListEntry, Spacer } from '../../components/misc';

const clicker  = (route, params) => {
    return (e) => {
        e.redraw = false;
        Caissa.route(route, params);
    };
};

const Menu = Factory.create('Menu', {
    view ( vnode ) {

        const { className, style } = vnode.attrs;

        //TODO: only show 'Game', if at least one exists in DB

        return m('div.page.menu', { className, style },
            m(PageTitle, 'Menu'),
            m(FlexList, [
                m(Spacer),
                ...Array.from(Config.navigation).map( ([route, entry, params, extras]) => {
                    return m(FlexListEntry, { onclick: clicker(route, params) }, [
                        m(TextLeft, {class: 'f3'}, [
                            extras.img
                                ? m('img.menu', { src: extras.img, width: 22, height: 22 })
                                : m('i.menu.fa.' + extras.ifa)
                            ,
                            entry,
                            m('div.menu.subline', 'some clever hints'),
                        ]),
                    ]);
                }),
            ]),
        );

    },
});

export default Menu;
