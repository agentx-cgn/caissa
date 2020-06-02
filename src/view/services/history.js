import { H } from './helper';

const history = [];
let pointer = 0;

function interpolate (target, params) {
    H.each(params, (key, val) => {
        target = target.replace(':' + key, val);
    });
    return target;
}

export default {
    reset () {
        while (history.length){
            history.splice(0, 1);
        }
    },
    onpopstatechange () {
        // detet backbutton pressed
    },
    back () {
        // prepare listener for URL change
        // keep history in track
        pointer -= 1;
        window.history.back();
    },
    forward () {
        // prepare listener for URL change
        // keep history in track
        window.history.forward();
        // check upper bound
        pointer += 1;
    },
    route (target, params) {
        history.push(interpolate(target, params));
    },

};
