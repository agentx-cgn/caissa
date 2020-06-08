import './layout.scss';

// import { H }        from '../view/services/helper';
import Header       from './components/header/header';
import Backdrop     from './components/backdrop';
import Main         from './components/main';
import Last        from './components/last';
import Component    from './components/component';

const Layout = Component.create('Layout', {
    view( vnode ) {

        const navi  = vnode.attrs.page.navi;

        return m('div.layout', [
            m(Backdrop),
            m(Header, { navi }),
            m(Main, vnode.attrs, vnode.children),
            m(Last, {msecs: Date.now()}),
        ]);

    },
});

export default Layout;

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
