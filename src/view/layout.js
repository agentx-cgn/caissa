import './layout.scss';

import { H }        from '../view/services/helper';
import Header       from './components/header/header';
import Backdrop     from './components/backdrop';
import Main         from './components/main';


const layout = H.create({
    name: 'Layout',


    onupdate() {},
    view( vnode ) {

        const navi  = vnode.attrs.page.navi;

        return m('div.layout', [
            m(Backdrop),
            m(Header, { navi }),
            m(Main, vnode.attrs, vnode.children),
        ]);

    },
});

window.caissa.onimport && window.caissa.onimport('Layout');
export default layout;

/*

        Sec1        Sec2        Sec3        Action
1                   Sources                 sourceclick
2                   Sources     Games       inject
3       Sources     Games                   scroll
4       Sources     Games                   gamesclick
5       Sources     Games       Game        inject
6       Games       Game                    scroll
7                                           swiperight
2

*/
