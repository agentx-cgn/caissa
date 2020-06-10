
import Factory  from './factory';
import Slider   from './slides/slider';

const Main = Factory.create('Main', {

    // https://mithril.js.org/route.html#advanced-component-resolution
    // oninit() {},
    // oncreate() {},

    onupdate() {},
    view( vnode ) {

        const anim  = vnode.attrs.anim;
        const flags = vnode.attrs.pagedata.flags.trim();
        const [ childrens, section] = vnode.children;

        return m('main',
            // slider [ + board]
            flags === 'sb'
                ? [
                    m(Slider,  { anim }, childrens),
                    m('section', vnode.attrs, section),
                ]
                : m(vnode.children[0], vnode.attrs),

        );
    },
});

export default Main;
