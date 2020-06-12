import Caissa         from '../caissa';
import { $$ }         from '../services/helper';
import History        from '../services/history';
import Factory        from '../components/factory';
import { CompPages }  from '../data/config-pages';
import System         from '../data/system';
import touchSlider    from './toucher';

const DEBUG = false;

let
    anim,
    endEvent = System.transitionEnd,
    transLeft, transCenter, transRight
;

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
    onresize (width) {
        if (width <= 360){
            transLeft   = 'translateX(    0);';
            transCenter = 'translateX( 100vw );';
            transRight  = 'translateX( calc(2*100vw) );';
        } else {
            transLeft   = 'translateX(    0);';
            transCenter = 'translateX( 360px );';
            transRight  = 'translateX( 720px );';
        }
    },
    view ( ) {

        const [ slides ] = History.slides();
        const [ left, center, right, animation ] = slides;

        // DEBUG && History.log();
        // DEBUG && console.log('pages', log);

        History.log();
        console.log('PAGES.view', slides.slice(0, 3).map( s => s.content.name), animation);

        // keep this
        anim = animation;

        return m('div.pages', {}, CompPages.map( Comp => {

            const isLeft   = left.content   === Comp;
            const isCenter = center.content === Comp;
            const isRight  = right.content  === Comp;
            const $Comp    = $$('div.page.' + Comp.name.toLowerCase());

            // ensure (still) not updating vnodes have proper classes and styles
            if (isLeft || isCenter || isRight){
                Comp.preventUpdates = false;
                if ($Comp){
                    $Comp.classList.remove('dn');
                    if (isLeft){
                        $Comp.classList.add('slide', 'left');
                        $Comp.setAttribute('style', 'z-index: 12; transform: ' + transLeft);
                    }
                    if (isCenter) {
                        $Comp.classList.add('slide', 'center');
                        $Comp.setAttribute('style', 'z-index: 11; transform: ' + transCenter);
                    }
                    if (isRight) {
                        $Comp.classList.add('slide', 'right');
                        $Comp.setAttribute('style', 'z-index: 12; transform: ' + transRight);
                    }
                }

            } else {
                Comp.preventUpdates = true;
                if ($Comp){
                    $Comp.classList.remove('slide', 'left', 'center', 'right');
                    $Comp.classList.add('dn');
                    $Comp.removeAttribute('style');
                }

            }

            return (
                isLeft   ? m(left.content,   {route: left.route,   params: left.params,
                    className: 'slide left',   style: 'z-index: 12; transform: ' + transLeft}) :

                isCenter ? m(center.content, {route: center.route, params: center.params,
                    className: 'slide center', style: 'z-index: 11; transform: ' + transCenter}) :

                isRight  ? m(right.content,  {route: right.route,   params: right.params,
                    className: 'slide right',  style: 'z-index: 12; transform: ' + transRight}) :

                // all other, no updates, no display
                m(Comp, {route: '', params: {}, className: 'dn' })
            );

        }));

    },

    onafterupdates () {

        const $Left   = $$('div.slide.left');
        const $Center = $$('div.slide.center');
        const $Right  = $$('div.slide.right');

        DEBUG && console.log('pages.onafterupdates', !!$Left, !!$Center, !!$Right, anim);

        if (anim === '=1=' || anim === '=r=' || anim === '=s=' || anim === '=w=') {
            $Left  && ( $Left.style.transform  = transLeft);  //'translateX(0)' );
            $Right && ( $Right.style.transform = transRight); //'translateX(720px)' );

        } else if (anim === '=b>') {
            $Right && ( $Right.style.zIndex = 10 );
            if ($Left) {
                $Left.style.zIndex  = 12;
                $Left.addEventListener(endEvent, onafteranimate);
                $Left.classList.add('slide-transition');
            }

        } else if (anim === '<c=' || anim === '<f=') {
            $Left && ( $Left.style.zIndex  = 10 );
            if ($Right) {
                $Right && ( $Right.style.zIndex = 12 );
                $Right.addEventListener(endEvent, onafteranimate);
                $Right.classList.add('slide-transition');
            }

        } else {
            console.warn('pages.onafterupdates.unknown anim', anim);

        }

    },

});

function onafteranimate( ) {

    console.log('%cpages.onafteranimate.in %s', {color: 'green'}, anim);

    const $Left   = $$('div.slide.left');
    // const $Center = $$('div.slide.center');
    const $Right  = $$('div.slide.right');

    if (anim === '=1=' || anim === '=r=' || anim === '=s=' || anim === '=w=') {

        $Left.style.transform  = transLeft;  //'translateX(0)';
        $Right.style.transform = transRight; //'translateX(720px)';
        // touchSlider.go($Left, $Center, $Right);

    } else if (anim === '<c=' || anim === '<f=') {

        $Left && ( $Left.style.transform  = transLeft); //'translateX(0)' );

        $Right.removeEventListener(endEvent, onafteranimate);
        $Right.classList.remove('slide-transition');
        $Right.style.transform = transCenter; //'translateX(360px)';

    } else if (anim === '=b>') {

        $Right && ( $Right.style.transform = transRight); //'translateX(720px)' );

        $Left.removeEventListener(endEvent, onafteranimate);
        $Left.classList.remove('slide-transition');
        $Left.style.transform  = transCenter; //'translateX(360px)';

    }

    // needed bc preventUpdates
    // $$$('div.slide.dn').forEach( slide => slide.classList.remove('left', 'center', 'right'));

    DEBUG && console.log('pages.onafteranimate.out', anim);
    DEBUG && console.log(' ');
    anim = '';

    // reorder back to LCR after animation
    Caissa.redraw();

}

export default Pages;
