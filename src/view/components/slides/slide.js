import Component from '../component';

const Slide = Component.create('Slide', {

    oncreate(  ) {
        // console.log('slider.oncreate', anim);
    },
    view ( vnode ) {
        return m('div.slide', {style: vnode.attrs.style}, vnode.children );
    },

});

export default Slide;
