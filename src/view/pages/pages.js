
import { $$, $$$ }    from '../services/helper';
import History        from '../services/history';
import Factory        from '../components/factory';
import { Nothing }    from '../components/misc';
import { CompPages }  from '../data/config-pages';
import System         from '../data/system';
import Config         from '../data/config';
import touchSlider    from './toucher';

let
    anim,
    endEvent = System.transitionEnd
;

/*

    view must always be correct because of redraws, filter or something
    view : from History:                Center          zIndex 11
    view :                        Left          Right   zIndex 12

    onupdate                      Left  Center  Right

    onafterupdates => animate
                            <=    Left  Center          zIndex 11
                                        Right           zIndex 12
                            =>          Center          zIndex 11
                                        Left    Right   zIndex 12
    onafteranimate =>

    click or swipe

 */


const Pages = Factory.create('Pages', {

    // Each page has a slot here
    // special are the slides from history (includes content)
    // content gets updated all other not
    // slides from history are positioned and possibly animated
    // Nothing is shown for pages not in cache

    oninit () {
        touchSlider.listen();
    },
    onbeforeupdate () {
        touchSlider.pause();
    },
    onremove () {
        touchSlider.remove();
    },
    view ( ) {

        const [ slides, log ] = History.slides();
        const [ left, center, right, animation ] = slides;
        const cache = History.recent(Config.pagecache.size);

        History.log();
        console.log('pages', log);

        // keep this
        anim = animation;

        return m('div.pages', {}, CompPages.map( Comp => {

            const isLeft   = left.content   === Comp;
            const isCenter = center.content === Comp;
            const isRight  = right.content  === Comp;
            const isCached = cache.includes(Comp);

            // Comp.preventUpdates = !(isLeft || isCenter || isRight);

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

        const $Left   = $$('div.slide.left');
        // const $Center = $$('div.slide.center');
        const $Right  = $$('div.slide.right');

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
            $Right &&  ( $Right.style.zIndex = 10 );
            $Left.style.zIndex  = 12;
            $Left.addEventListener(endEvent, onafteranimate);
            $Left.classList.add('slide-transition');

        } else if (anim === '<c=' || anim === '<f=') {
            $Left  && ( $Left.style.zIndex  = 10 );
            $Right && ( $Right.style.zIndex = 12 );
            $Right.addEventListener(endEvent, onafteranimate);
            $Right.classList.add('slide-transition');

        } else {
            console.log('pages.onafterupdates.unknown anim', anim);

        }

    },

});

function onafteranimate( ) {

    console.log('%cpages.onafteranimate.in %s', {color: 'green'}, anim);

    const $Left   = $$('div.slide.left');
    // const $Center = $$('div.slide.center');
    const $Right  = $$('div.slide.right');

    if (anim === '=1=' || anim === '=r=' || anim === '=s=') {

        $Left.style.transform  = 'translateX(0)';
        $Right.style.transform = 'translateX(720px)';
        // touchSlider.go($Left, $Center, $Right);

    } else if (anim === '<c=' || anim === '<f=') {

        $Left && ( $Left.style.transform  = 'translateX(0)' );

        $Right.removeEventListener(endEvent, onafteranimate);
        $Right.classList.remove('slide-transition');
        $Right.style.transform = 'translateX(360px)';

    } else if (anim === '=b>') {

        $Right && ( $Right.style.transform = 'translateX(720px)' );

        $Left.removeEventListener(endEvent, onafteranimate);
        $Left.classList.remove('slide-transition');
        $Left.style.transform  = 'translateX(360px)';

    }

    // preventUpdates forces this
    $$$('div.slide.dn').forEach( slide => slide.classList.remove('left', 'center', 'right'));

    console.log('pages.onafteranimate.out', anim);
    console.log('');
    anim = '';

    m.redraw();

}

export default Pages;
