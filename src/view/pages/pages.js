
import { $$ }   from '../services/helper';
import Factory     from '../components/factory';
import { Nothing } from '../components/misc';
import { CompPages } from '../data/config-pages';
import History     from '../services/history';
import System      from '../data/system';
import Config      from '../data/config';

let
    anim,
    endevent = System.transitionEnd
;


const Pages = Factory.create('Pages', {

    // Each page has a slot here
    // special are the slides from history (includes content)
    // content gets updated all other not
    // slides from history are positioned and possibly animated
    // Nothing is shown for pages not in cache

    view ( ) {

        const [ slides, log ] = History.slides();
        const [ left, center, right, animation ] = slides;
        const cache = History.recent(Config.pagecache.size);

        History.log();
        console.log('pages', log);
        // console.log('pages', slides);

        anim = animation;


        // return m('div.pages', {}, H.map(ConfigPages, (route, pagedata) => {
        return m('div.pages', {}, CompPages.map( Comp => {

            // const Page     = pagedata[1];
            const isLeft   = left.content   === Comp;
            const isCenter = center.content === Comp;
            const isRight  = right.content  === Comp;
            const isCached = cache.includes(Comp);

            Comp.preventUpdates = !(isLeft || isCenter || isRight);

            return (
                isLeft   ? m(left.content,   {route: left.route,   params: left.params,
                    className: 'slide left',   style: 'z-index: 12; transform: translateX(    0);'}) :

                isCenter ? m(center.content, {route: center.route, params: center.params,
                    className: 'slide center', style: 'z-index: 11; transform: translateX(360px);'}) :

                isRight  ? m(right.content,  {route: right.route,   params: right.params,
                    className: 'slide right',  style: 'z-index: 12; transform: translateX(720px);'}) :

                isCached ? m(Comp,           {route: '', params: {}, className: 'dn' }):

                m(Nothing)
            );

        }));

    },

    onafterupdates () {

        const $Left  = $$('div.slide.left');
        const $Right = $$('div.slide.right');

        console.log('pages.onafterupdates', anim, !!$Left, !!$Right);

        [...$$('div.pages').children].forEach( div => {
            if (div.className !== 'nothing dn'){
                console.log('pages.child', [div.className]);
            }
        });

        if (anim === '=1=' || anim === '=r=' || anim === '=s=') {
            $Left  && ( $Left.style.transform  = 'translateX(0)' );
            $Right && ( $Right.style.transform = 'translateX(720px)' );

        } else if (anim === '=b>') {
            // console.log('slide.onafterupdates', anim, $Left.style.left, getComputedStyle($Left).transform);
            $Right &&  ( $Right.style.zIndex = 10 );
            $Left.style.zIndex  = 12;
            $Left.addEventListener(endevent, onTransitionEnd);
            // setTimeout(onTransitionEnd, 600);
            $Left.classList.add('slide-transition');

        } else if (anim === '<c=' || anim === '<f=') {
            // console.log('slide.onafterupdates', anim, $Right.style.left, getComputedStyle($Right).transform);
            $Left  && ( $Left.style.zIndex  = 10 );
            $Right && ( $Right.style.zIndex = 12 );
            $Right.addEventListener(endevent, onTransitionEnd);
            // setTimeout(onTransitionEnd, 600);
            $Right.classList.add('slide-transition');

        } else {
            console.log('wtf');

        }
    },

});

function onTransitionEnd( ) {

    console.log('pages.onTransitionEnd.in', anim);

    const $Left  = $$('div.slide.left');
    const $Right = $$('div.slide.right');

    if (anim === '=1=' || anim === '=r=' || anim === '=s=') {

        $Left.style.transform  = 'translateX(0)';
        $Right.style.transform = 'translateX(720px)';

    } else if (anim === '<c=' || anim === '<f=') {

        $Left && ( $Left.style.transform  = 'translateX(0)' );

        $Right.removeEventListener(endevent, onTransitionEnd);
        $Right.classList.remove('slide-transition');
        $Right.style.transform = 'translateX(360px)';

    } else if (anim === '=b>') {

        $Right && ( $Right.style.transform = 'translateX(720px)' );

        $Left.removeEventListener(endevent, onTransitionEnd);
        $Left.classList.remove('slide-transition');
        $Left.style.transform  = 'translateX(360px)';

    }

    // console.log('right', $Right.style.left, getComputedStyle($Right).transform);
    // console.log('left',  $Left.style.left,  getComputedStyle($Left).transform);

    console.log('pages.onTransitionEnd.out', anim);
    anim = '';

}

export default Pages;
