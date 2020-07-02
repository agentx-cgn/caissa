import './layout.scss';

// import { H }        from '../view/services/helper';
import Header       from './components/header/header';
import Backdrop     from './components/backdrop';
import { Nothing }  from './components/misc';
import Last         from './components/last';
import Factory      from './components/factory';
import Pages        from './pages/pages';

const Layout = Factory.create('Layout', {

    view( vnode ) {

        const { route, params } = vnode.attrs;
        const [ Page, Section ] = vnode.children;

        return m('div.layout', [
            m(Backdrop),
            m(Header, { route, params }),
            m('main', [
                m('section.pages', m(Pages, { route, params }, Page)),
                innerWidth >= 720

                    // desktop with board or something
                    ? m('section.content', {}, m(Section, { route, params } ))

                    // empty for mobile
                    : m('section.content', {}, m(Nothing))
                ,
            ]),
            m(Last, { msecs: Date.now() }),
        ]);

    },

});

export default Layout;
