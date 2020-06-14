import './layout.scss';

// import { H }        from '../view/services/helper';
import Header       from './components/header/header';
import Backdrop     from './components/backdrop';
import Main         from './components/main';
import Last         from './components/last';
import Factory      from './components/factory';
import Pages        from './pages/pages';
import Sections     from './pages/sections';

const Layout = Factory.create('Layout', {

    view( vnode ) {

        const { route, params }    = vnode.attrs;
        const [ Content, Section ] = vnode.children;

        return m('div.layout', [
            m(Backdrop),
            m(Header,  { route, params }),
            m(Main, [
                m(Pages,    { route, params }, Content),
                m(Sections, { route, params }, Section),
            ]),
            m(Last,    { msecs: Date.now() }),
        ]);

    },

});

export default Layout;

