import Caissa         from '../caissa';
import { $$ }         from '../services/helper';
import History        from '../services/history';
import Factory        from '../components/factory';
import { CompPages }  from '../data/config-pages';
import System         from '../data/system';
import touchSlider    from '../services/toucher';

const DEBUG = false;

let
    anim, pageWidth,
    endEvent = System.transitionEnd
;

const Pages = Factory.create('Pages', {

    // Each page has it's own slot here
    // special are the slides from history (includes content)
    // only slides get displayed and updated
    // slides are transformed and possibly animated


    oninit () {
        touchSlider.listen();
    },
    oncreate() {

    },
    onbeforeupdate () {
        touchSlider.pause();
    },
    onremove () {
        touchSlider.remove();
    },
    onresize (width, height) {
        pageWidth = width <= 360 ? width : 360;
        DEBUG && console.log('pages.onresize', width, height);
    },
    view ( ) {

        const [ slides ] = History.slides();
        const [ left, center, right, animation ] = slides;

        DEBUG && History.log();
        true && console.log('Pages.view.slides', slides.slice(0, 3).map( s => s.content.name), animation);

        // keep this
        anim = animation;

        return m('div.pages', CompPages.map( Comp => {

            const isLeft   = left.content   === Comp;
            const isCenter = center.content === Comp;
            const isRight  = right.content  === Comp;
            const $Comp    = $$('div.page.' + Comp.name.toLowerCase());

            // ensure (still) not updating vnodes have proper classes and styles
            if (isLeft && isRight){
                console.warn('Pages.view', Comp.name, 'is left & right');
                // eslint-disable-next-line no-debugger
                // debugger;
            }

            if (isLeft || isCenter || isRight) {
                Comp.preventUpdates = false;
                if ($Comp){
                    $Comp.classList.remove('dn');
                    if (isLeft){
                        $Comp.classList.add('slide', 'left', 'trans-left');
                    }
                    if (isCenter) {
                        $Comp.classList.add('slide', 'center', 'trans-center');
                    }
                    if (isRight) {
                        $Comp.classList.add('slide', 'right', 'trans-right');
                    }
                }
                else {
                    // eslint-disable-next-line no-debugger
                    console.warn('Pages.view', Comp.name, 'not found');
                }

            } else {
                Comp.preventUpdates = true;
                if ($Comp){
                    $Comp.classList.remove(
                        'slide', 'left', 'center', 'right', 'trans-left', 'trans-center', 'trans-right',
                    );
                    $Comp.classList.add('dn');
                    $Comp.removeAttribute('style'); // WHY?
                }

            }

            return (
                isLeft   ? m(left.content,   {route: left.route,   params: left.params,
                    className: 'slide left trans-left'}) :

                isCenter ? m(center.content, {route: center.route, params: center.params,
                    className: 'slide center trans-center'}) :

                isRight  ? m(right.content,  {route: right.route,   params: right.params,
                    className: 'slide right trans-right'}) :

                // all other, no updates, no display
                m(Comp, {route: '', params: {}, className: 'dn' })
            );

        }));

    },

    onafterupdates () {

        const $Left   = $$('div.slide.left');
        const $Center = $$('div.slide.center');
        const $Right  = $$('div.slide.right');

        DEBUG && console.log('pages.onafterupdates.in', !!$Left, !!$Center, !!$Right, anim);

        if (anim === '=1=' || anim === '=r=' || anim === '=s=' || anim === '=w=') {

            if ($Left) {
                $Left.classList.remove('trans-center');
                $Left.classList.add('trans-left');
            }
            if ($Right) {
                $Right.classList.remove('trans-center');
                $Right.classList.add('trans-right');
            }

            if (History.canBack || History.canFore){
                touchSlider.init(pageWidth);
            }

        } else if (anim === '=b>') {
            if ($Left) {
                $Left.addEventListener(endEvent, onafteranimate);
                $Left.classList.remove('trans-left');
                $Left.classList.add('page-slide', 'trans-center');
                $Center.classList.remove('trans-center');
                $Center.classList.add('page-slide', 'trans-right');
            }

        } else if (anim === '<c=' || anim === '<f=') {
            if ($Right) {
                $Right.addEventListener(endEvent, onafteranimate);
                $Right.classList.remove('trans-right');
                $Right.classList.add('page-slide', 'trans-center');
                $Center.classList.remove('trans-center');
                $Center.classList.add('page-slide', 'trans-left');
            }

        } else if (anim === '=b=' || anim === '=f=') {
            Caissa.redraw();

        } else {
            console.warn('pages.onafterupdates.unknown anim', anim);
        }

    },

});

function onafteranimate( ) {

    const $Left  = $$('div.slide.left');
    const $Right = $$('div.slide.right');

    if (anim === '<c=' || anim === '<f=') {
        $Right.removeEventListener(endEvent, onafteranimate);
        $Right.classList.remove('page-slide', 'trans-right');
        $Right.classList.add('trans-center');

    } else if (anim === '=b>') {
        $Left.removeEventListener(endEvent, onafteranimate);
        $Left.classList.remove('page-slide', 'trans-left');
        $Left.classList.add('trans-center');

    }

    DEBUG && console.log('pages.onafteranimate.out', anim);
    DEBUG && console.log(' ');

    anim = '';

    // reorder back to LCR after animation
    Caissa.redraw();

}

export default Pages;
