import { $$ }    from '../../services/helper';
import System    from '../../data/system';
import Factory   from '../factory';

let
    anim,
    endevent = System.transitionEnd
;

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

const Slider = Factory.create('Slider', {
    onafterupdates ( ) {

        // console.log('slide.onafterupdates');
        const $Left  = $$('div.slide.left');
        const $Right = $$('div.slide.right');

        if (anim === '=1=' || anim === '=r=' || anim === '=s=') {
            $Left.style.transform  = 'translateX(0)';
            $Right.style.transform = 'translateX(720px)';

        } else if (anim === '=b>') {
            console.log('slide.onafterupdates', anim, $Left.style.left, getComputedStyle($Left).transform);
            $Left.style.zIndex  = 12;
            $Right.style.zIndex = 10;
            $Left.addEventListener(endevent, onTransitionEnd);
            // setTimeout(onTransitionEnd, 600);
            $Left.classList.add('slide-transition');

        } else if (anim === '<c=' || anim === '<f=') {
            console.log('slide.onafterupdates', anim, $Right.style.left, getComputedStyle($Right).transform);
            $Left.style.zIndex  = 10;
            $Right.style.zIndex = 12;
            $Right.addEventListener(endevent, onTransitionEnd);
            // setTimeout(onTransitionEnd, 600);
            $Right.classList.add('slide-transition');

        } else {
            console.log('wtf');

        }
    },

    view (vnode) {

        anim = vnode.attrs.anim;
        console.log('slider.view.childs', reduce(vnode.children, anim));

        updateMapping(reduce(vnode.children));
        console.table(mapping);

        return m('div.slider.flex.flex-row', [
            m('div.slide.left',   {style: 'z-index: 12; transform: translateX(    0);'}, vnode.children[0]),
            m('div.slide.center', {style: 'z-index: 11; transform: translateX(360px);'}, vnode.children[1]),
            m('div.slide.right',  {style: 'z-index: 12; transform: translateX(720px);'}, vnode.children[2]),
        ]);

    },

});


function onTransitionEnd( ) {

    console.log('slider.onTransitionEnd.in', anim);

    const $Left  = $$('div.slide.left');
    const $Right = $$('div.slide.right');

    if (anim === '=1=' || anim === '=r=' || anim === '=s=') {

        $Left.style.transform  = 'translateX(0)';
        $Right.style.transform = 'translateX(720px)';

    } else if (anim === '<c=' || anim === '<f=') {

        $Right.removeEventListener(endevent, onTransitionEnd);
        $Right.classList.remove('slide-transition');

        $Right.style.transform = 'translateX(360px)';
        $Left.style.transform  = 'translateX(0)';

    } else if (anim === '=b>') {

        $Left.removeEventListener(endevent, onTransitionEnd);
        $Left.classList.remove('slide-transition');

        $Left.style.transform  = 'translateX(360px)';
        $Right.style.transform = 'translateX(720px)';

    }

    // console.log('right', $Right.style.left, getComputedStyle($Right).transform);
    // console.log('left',  $Left.style.left,  getComputedStyle($Left).transform);

    console.log('slider.onTransitionEnd.out', anim);
    anim = '';

}

export default Slider;
