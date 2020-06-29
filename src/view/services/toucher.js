
import System     from '../data/system';
import History    from './history';
import { $$ }     from './helper';

const DEBUG = true;

const abs = Math.abs;
let threshold = innerWidth / 3;

let touch = { selektor: '', time: NaN, down: { x: NaN, y: NaN }, diff: { x: NaN, y: NaN } };
let slideLeft, slideRight; // may get moved
let endEvent = System.transitionEnd;
let width;

const touchSlider = {
    listen () {
        if (System.touch){
            document.addEventListener('touchstart', touchSlider.down,  false);
            document.addEventListener('touchmove',  touchSlider.move,  false);
            document.addEventListener('touchend',   touchSlider.end,   false);
            DEBUG && console.log('touchSlider.listening');
        }
    },
    remove () {
        document.removeEventListener('touchstart', touchSlider.down,  false);
        document.removeEventListener('touchmove',  touchSlider.move,  false);
        document.removeEventListener('touchend',   touchSlider.end,   false);
        DEBUG && console.log('touchSlider.removed');
    },
    pause () {
        touch.selektor = '';
    },
    init (pageWidth) {
        // next frame
        setTimeout ( () => {
            slideLeft       = $$('div.slide.left');
            slideRight      = $$('div.slide.right');
            touch.selektor  = 'div.slide.center';
            width           = pageWidth;
            threshold       = innerWidth / 4;
            DEBUG && console.log('touchSlider.init', pageWidth);
        });
    },
    down (e) {
        if (touch.selektor && e.target.closest(touch.selektor)){
            touch.time   = Date.now();
            touch.down.x = e.touches[0].clientX;
            touch.down.y = e.touches[0].clientY;
            touch.diff.x = 0;
            touch.diff.y = 0;
            DEBUG && console.log('touch.down', touch.selektor);
        }
    },
    onafterback () {
        slideLeft.removeEventListener(endEvent, touchSlider.onafterback);
        History.goback();
    },
    onafterfore () {
        slideRight.removeEventListener(endEvent, touchSlider.onafterfore);
        History.gofore();
    },
    move  (e) {

        if (touch.down.x || touch.down.y) {

            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;

            touch.diff.x = touch.down.x - x;
            touch.diff.y = touch.down.y - y;

            // console.log('touchSlider.move', History.canBack, touch.diff.x, threshold);

            if (abs(touch.diff.x) > 3 * abs(touch.diff.y)){

                if (slideLeft && History.canBack && touch.diff.x < 0){
                    if (abs(touch.diff.x) > threshold){
                        slideLeft.addEventListener(endEvent, touchSlider.onafterback);
                        slideLeft.classList.add('page-slide', 'trans-center');
                    } else {
                        slideLeft.style.transform = 'translateX(' + abs(touch.diff.x) + 'px)';
                    }
                }

                if (slideRight && History.canFore && touch.diff.x > 0){
                    if (abs(touch.diff.x) > threshold){
                        slideRight.addEventListener(endEvent, touchSlider.onafterfore);
                        slideRight.classList.add('page-slide', 'trans-center');
                    } else {
                        slideRight.style.transform = 'translateX(' + ( 2 * width - abs(touch.diff.x) ) + 'px)';
                    }
                }

            }

        }

    },

    end () {

        if (touch.selektor) {

            touch.down = { x: NaN, y: NaN };
            touch.diff = { x: NaN, y: NaN };

            if (slideLeft){
                slideLeft.addEventListener(endEvent, function onEnd () {
                    slideLeft.removeEventListener(endEvent, onEnd);
                    slideLeft.classList.remove('page-slide');
                });
                slideLeft.classList.add('trans-left', 'page-slide');
            }
            if (slideRight){
                slideRight.addEventListener(endEvent, function onEnd () {
                    slideRight.removeEventListener(endEvent, onEnd);
                    slideRight.classList.remove('page-slide');
                });
                slideRight.classList.add('trans-right', 'page-slide');
            }

            DEBUG && console.log('touchSlider.ended', touch.selektor);

        }

    },

};

export default touchSlider;
