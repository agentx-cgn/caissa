import { $$ }    from '../services/helper';
import Component from '../components/component';

let anim;

// https://stackoverflow.com/questions/16989585/css-3-slide-in-from-left-transition

function reduce (childs) {
    return childs.map( child => child.tag.name );
}

const mapping = {
    'Left':   {hit: '', index: 0, name: 'Nothing', transForm: ''},
    'Center': {hit: '', index: 0, name: 'Nothing', transForm: ''},
    'Right':  {hit: '', index: 0, name: 'Nothing', transForm: ''},
};

function updateMapping (childs) {

    // first look for existing (hit), ignoring 'Nothing'
    Object.keys(mapping).forEach ( slide => {
        mapping[slide].hit = '';
        if (slide.name !== 'Nothing'){
            const childname  = childs.find( childname => slide.name === childname);
            const childindex = childs.findIndex(child => child === childname);
            if (childname) {
                mapping[slide].hit   = 'hit';
                mapping[slide].index = childindex;
                mapping[slide].name  = childname;
                mapping[slide].transForm = (
                    childindex   === 0 ? 'translateX(0)'
                    : childindex === 1 ? 'translateX(360px)'
                    : childindex === 2 ? 'translateX(720px)'
                    : console.log('WTF')
                );
            }
        }
    });

    // populate the others
    Object.keys(mapping).forEach ( slide => {
        if (slide.hit !== 'hit'){
            childs.forEach (childname => {
                // check for new, not yet mapped
                const slide = Object.keys(mapping).find(slide => {
                    return (mapping[slide].name !== childname || mapping[slide].name === 'Nothing') && mapping[slide].hit !== 'hit';
                });
                const childindex = childs.findIndex(child => child === childname);
                mapping[slide].hit   = 'new';
                mapping[slide].index = childs.findIndex(child => child === childname);
                mapping[slide].transForm = (
                    childindex   === 0 ? 'translateX(0)'
                    : childindex === 1 ? 'translateX(360px)'
                    : childindex === 2 ? 'translateX(720px)'
                    : console.log('WTF')
                );
            });
        }
    });

}

const Slider = Component.create('Slider', {
    onafterupdates (msg) {
        console.log('slider.onafterupdates', msg);
    },
    view (vnode) {

        anim = vnode.attrs.anim;
        console.log('slider.view.childs', reduce(vnode.children, anim));

        updateMapping(reduce(vnode.children));
        console.table(mapping);

        return m('div.slider.flex.flex-row', [
            m(Slide, {style: 'z-index: 12; transform: translateX(    0);', pos: 'left'  }, vnode.children[0]),
            m(Slide, {style: 'z-index: 11; transform: translateX(360px);', pos: 'center'}, vnode.children[1]),
            m(Slide, {style: 'z-index: 12; transform: translateX(720px);', pos: 'right' }, vnode.children[2]),
        ]);

    },

});

const Slide = Component.create('Slider', {
    oncreate(  ) {
        console.log('slider.oncreate', anim);
    },
    view ( vnode ) {
        const pos = vnode.attrs.pos;
        // console.log('slide.view', pos);
        return (
            pos === 'left'     ? m('div.slide.left',   {style: vnode.attrs.style}, vnode.children )
            : pos === 'center' ? m('div.slide.center', {style: vnode.attrs.style}, vnode.children )
            : pos === 'right'  ? m('div.slide.right' , {style: vnode.attrs.style}, vnode.children )
            : console.log('wtf')
        );
    },
    onupdate ( {attrs: {pos} }) {

        // console.log('slide.onupdate', pos);
        const $Left  = $$('div.slide.left');
        const $Right = $$('div.slide.right');

        if (anim === '=1=' || anim === '=r=' || anim === '=s=') {
            $Left.style.transform = 'translateX(0)';
            $Right.style.transform = 'translateX(720px)';

        } else if (pos === 'left' && anim === '=b>') {
            // console.log('slide.onupdate', pos, anim);
            console.log('slide.onupdate', pos, anim, $Left.style.left, getComputedStyle($Left).transform);
            $Left.style.zIndex  = 12;
            $Right.style.zIndex = 10;
            // $Left.addEventListener('webkitTransitionEnd', transend);
            setTimeout(transend, 600);
            $Left.classList.add('transition');

        } else if (pos === 'right' && (anim === '<c=' || anim === '<f=')) {
            console.log('slide.onupdate', pos, anim, $Right.style.left, getComputedStyle($Right).transform);
            $Left.style.zIndex  = 10;
            $Right.style.zIndex = 12;
            // $Right.addEventListener('webkitTransitionEnd', transend);
            setTimeout(transend, 600);
            $Right.classList.add('transition');
        }

    },
});

function transend( ) {

    console.log('slider.transend.in', anim);

    const $Left   = $$('div.slide.left');
    // const $Center = $$('div.slide.center');
    const $Right  = $$('div.slide.right');

    if (anim === '=1=' || anim === '=r=' || anim === '=s=') {
        $Left.style.transform = 'translateX(0)';
        $Right.style.transform = 'translateX(720px)';

    } else if (anim === '<c=' || anim === '<f=') {
        $Right.removeEventListener('webkitTransitionEnd', Slider.transend);
        $Right.classList.remove('transition');
        $Right.style.transform = 'translateX(360px)';
        $Left.style.transform = 'translateX(0)';

    } else if (anim === '=b>') {
        $Left.removeEventListener('webkitTransitionEnd', Slider.transend);
        $Left.classList.remove('transition');
        $Left.style.transform = 'translateX(360px)';
        $Right.style.transform = 'translateX(720px)';
    }

    console.log('right', $Right.style.left, getComputedStyle($Right).transform);
    console.log('left',  $Left.style.left,  getComputedStyle($Left).transform);

    console.log('slider.transend.out', anim);

}

window.caissa.onimport && window.caissa.onimport('Layout');
export default Slider;
