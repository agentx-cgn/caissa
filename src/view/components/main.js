
import Factory  from './factory';

const Main = Factory.create('Main', {
    view( vnode ) {
        return m('main.flex.flex-row', {}, vnode.children);
    },
});

export default Main;
