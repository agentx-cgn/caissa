
import Factory  from './factory';

const Main = Factory.create('Main', {
    view( vnode ) {
        // return m('main.flex.flex-row', {}, vnode.children);
        return m('main', {}, [
            m('section.pages',   {}, vnode.children[0]),
        ]);
    },
});

export default Main;
