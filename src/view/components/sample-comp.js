
import Factory   from './factory';

const Tree = Factory.create('Tree', {

    onupdate () {
    },
    oncreate () {
    },

    view ( vnode ) {

        // eslint-disable-next-line no-unused-vars
        const { tree } = vnode.attrs;

        return m('div', 'tree');

    },


});

export default Tree;
