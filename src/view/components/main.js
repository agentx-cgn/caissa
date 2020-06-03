
import { H }        from '../services/helper';
import Slider       from './slider';

const Main = H.create({
    name: 'Main',

    // https://mithril.js.org/route.html#advanced-component-resolution
    // oninit() {},
    // oncreate() {},

    onupdate() {},
    view( vnode ) {

        const anim  = vnode.attrs.anim;
        const flags = vnode.attrs.page.flags.trim();
        const [ childrens, section] = vnode.children;

        return m('main.bg-fff',
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

window.caissa.onimport && window.caissa.onimport('Main');
export default Main;
