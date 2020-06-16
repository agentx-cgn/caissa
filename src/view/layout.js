import './layout.scss';

// import { H }        from '../view/services/helper';
import Header       from './components/header/header';
import Backdrop     from './components/backdrop';
import { Nothing }  from './components/misc';
import Last         from './components/last';
import Factory      from './components/factory';
import Pages        from './pages/pages';

let width;

const Layout = Factory.create('Layout', {

    onresize (innerWidth) {
        width = innerWidth;
    },
    view( vnode ) {

        const { route, params } = vnode.attrs;
        const [ Page, Section ] = vnode.children;

        return m('div.layout', [
            m(Backdrop),
            m(Header,  { route, params }),
            m('main', {}, [
                m('section.pages', {}, m(Pages, { route, params }, Page)),
                width >= 720
                    ? m('section.content', {}, m(Section, { route, params } ))
                    : m('section.content', {}, m(Nothing))
                ,
            ]),
            m(Last, { msecs: Date.now() }),
        ]);

    },

});

export default Layout;

