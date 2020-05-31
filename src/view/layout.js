import Header from './components/header/header';
import './layout.scss';

export default {
    // https://mithril.js.org/route.html#advanced-component-resolution
    oninit() {},
    oncreate() {},
    view(  vnode ) {

        return m('div.layout.flex.flex-column.h-100', [
            m(Header, vnode.attrs),
            m('div.content.flex.h-100.overflow-hidden.bg-fff', vnode.children),
        ]);

    },
};
