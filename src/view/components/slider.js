import { $$ }    from '../services/helper';
import Component from '../components/component';

let anim, domSlider;

const Slider = Component.create('Slider', {
    oncreate( { dom } ) {
        domSlider = dom;
        console.log('slider.oncreate', domSlider.childNodes);
        $$('div.slider').scrollLeft = 360; // [0, 290, 580]; // 340 for main 400
    },
    view (vnode) {
        // https://stackoverflow.com/questions/16989585/css-3-slide-in-from-left-transition

        anim = vnode.attrs.anim;
        console.log('slider.view', anim);

        if (anim === '=1=' || anim === '=r=' || anim === '=s=') {
            return m('div.slider.flex.flex-row', [
                m('div.slide.left.ll0.z12',   {style: 'transform: translateX(0); order:1'}, vnode.children[0] ),
                m('div.slide.center.ll0.z10', {style: 'transform: translateX(0); order:2'}, vnode.children[1] ),
                m('div.slide.right.ll0.z12' , {style: 'transform: translateX(0); order:3'}, vnode.children[2] ),
            ]);

        } else if (anim === '<c=' || anim === '<f=') {
            $$('div.slide.right').addEventListener('webkitTransitionEnd', Slider.transend);
            return m('div.slider.flex.flex-row', [
                m('div.slide.left.ll0.z12',   {style: 'transform: translateX(0); order:1'}, vnode.children[0] ),
                m('div.slide.center.ll0.z10', {style: 'transform: translateX(0); order:2'}, vnode.children[1] ),
                m('div.slide.right.ll0.z12.transitionLeft' , {style: 'order:3'}, vnode.children[2] ),
            ]);

        } else if (anim === '=b>') {
            $$('div.slide.left').addEventListener('webkitTransitionEnd', Slider.transend);
            return m('div.slider.flex.flex-row', [
                m('div.slide.left.ll0.z12.transitionRight',   {style: 'order:1'}, vnode.children[0] ),
                m('div.slide.center.ll0.z10', {style: 'transform: translateX(0); order:2'}, vnode.children[1] ),
                m('div.slide.right.ll0.z12' , {style: 'transform: translateX(0); order:3'}, vnode.children[2] ),
            ]);

        // bail out
        } else {
            console.log('slider.anim.unknown', anim);
        }

    },
    transend( ) {

        $$('div.slide.left').removeEventListener('webkitTransitionEnd', Slider.transend);
        $$('div.slide.right').removeEventListener('webkitTransitionEnd', Slider.transend);
        $$('div.slide.right').classList.remove('transitionLeft');
        $$('div.slide.left').classList.remove('transitionRight');
        $$('div.slide.left').style.transform = 'translateX(0)';
        $$('div.slide.right').style.transform = 'translateX(0)';

        if (anim === '=1=' || anim === '=r=' || anim === '=s=') {
            $$('div.slide.left').style.order   = '1';
            $$('div.slide.center').style.order = '2';
            $$('div.slide.right').style.order  = '3';

        } else if (anim === '<c=' || anim === '<f=') {
            $$('div.slide.left').style.order   = '1';
            $$('div.slide.center').style.order = '3';
            $$('div.slide.right').style.order  = '2';

        } else if (anim === '=b>') {
            $$('div.slide.left').style.order   = '2';
            $$('div.slide.center').style.order = '1';
            $$('div.slide.right').style.order  = '3';
        }

        console.log('slider.transend', anim);

    },
});

window.caissa.onimport && window.caissa.onimport('Layout');
export default Slider;
