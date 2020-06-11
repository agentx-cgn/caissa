
import System     from '../data/system';
import History    from '../services/history';
import { H, $$ }  from '../services/helper';

const abs = Math.abs;
const threshold = System.screen.width / 3;

let touch = { target: null, time: NaN, down: { x: NaN, y: NaN }, diff: { x: NaN, y: NaN } };
let pageLeft, pageRight; // may get moved

const touchSlider = {
    listen () {
        if (System.touch){
            document.addEventListener('touchstart', touchSlider.start, false);
            document.addEventListener('touchmove',  touchSlider.move,  false);
            document.addEventListener('touchend',   touchSlider.end,   false);
            console.log('touchSlider.listening');
        }
    },
    remove () {
        document.removeEventListener('touchstart', touchSlider.start, false);
        document.removeEventListener('touchmove',  touchSlider.move,  false);
        document.removeEventListener('touchend',   touchSlider.end,   false);
        console.log('touchSlider.removed');
    },
    pause () {
        touch.target = null;
    },
    go (left, center,right) {
        pageLeft     = $$(left);
        pageRight    = $$(right);
        touch.target = center;
    },
    start (e) {
        if (e.target.closest(touch.target)){
            touch.time   = Date.now();
            touch.down.x = e.touches[0].clientX;
            touch.down.y = e.touches[0].clientY;
            touch.diff.x = 0;
            touch.diff.y = 0;
            console.log('touchSlider.start', H.shrink(touch));
        }
    },
    move  (e) {

        if (touch.down.x || touch.down.y) {

            console.log('touchSlider.move', H.shrink(touch));

            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;

            touch.diff.x = touch.down.x - x;
            touch.diff.y = touch.down.y - y;

            if (History.canBack && touch.diff.x > 0){
                if (abs(touch.diff.x) > threshold){
                    History.onback();
                } else {
                    pageLeft.style.transform = 'translateX(' + abs(touch.diff.x) + 'px)';
                }
            }

            if (History.canFore && touch.diff.x < 0){
                if (abs(touch.diff.x) > threshold){
                    History.onfore();
                } else {
                    pageRight.style.transform = 'translateX(-' + abs(touch.diff.x) + 'px)';
                }
            }

        }

    },
    end   () {

        touch = { target: null, time: NaN, down: { x: NaN, y: NaN }, diff: { x: NaN, y: NaN } };

        pageLeft  && (pageLeft.style.transform  = 'translateX(0)');
        pageRight && (pageRight.style.transform = 'translateX(360px)');
    },

};

export default touchSlider;
