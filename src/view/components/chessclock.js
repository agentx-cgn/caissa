// TODO: realize other timecontrols w/ time budgets per player

import { H } from '../services/helper';
import Component from '../components/component';

const clock = (function () {

    let isRunning, turn, start, interval, timecontrol, total, counter, divisor;
    let domBlack, domWhite, domTotal;

    const template = { format: H.msec2HMS, time: 0, color: 'cred' };
    const white = {};
    const black = {};

    return {
        start (msecs) {

            turn         = 'w';
            timecontrol  = msecs;
            counter      = 0;
            total        = 0;
            divisor      = 5;
            start        = Date.now();

            Object.assign(white, template);
            Object.assign(black, template);

            interval && clearInterval(interval);
            interval  = setInterval(clock.tick, 100);
            isRunning = true;

        },
        stop () {
            clearInterval(interval);
            isRunning = false;
        },
        render () {
            m.render(domWhite, clock.white);
            m.render(domBlack, clock.black);
            m.render(domTotal, clock.total);
        },
        tick () {

            counter += 1;
            total    = Date.now() - start;

            white.time = turn === 'w' ? total - black.time : white.time;
            black.time = turn === 'b' ? total - white.time : black.time;

            // at least one player is running out of time
            if (timecontrol - white.time < 10 * 1000) {
                white.format = H.msec2HMSm;
                white.color  = 'darkred';
                divisor = 1;
            }
            if (timecontrol - black.time < 10 * 1000) {
                black.format = H.msec2HMSm;
                black.color  = 'darkred';
                divisor = 1;
            }

            // that's it, game over
            if (white.time >= timecontrol || black.time >= timecontrol){
                white.time = white.time > timecontrol ? timecontrol : white.time;
                black.time = black.time > timecontrol ? timecontrol : black.time;
                clock.render();
                clearInterval(interval);
                clock.over && clock.over(white.time, black.time);
            }

            // don't update too often
            if (!(counter % divisor)) {
                clock.ontick && clock.ontick();
                clock.render();
            }

        },
        blackclick () {
            if (turn === 'b')  turn = 'w';
        },
        whiteclick () {
            if (turn === 'w')  turn = 'b';
        },
        get white () {
            return white.format(timecontrol - white.time);
        },
        get black () {
            return black.format(timecontrol - black.time);
        },
        get total () {
            return H.msec2HMSm(total);
        },
        comp () {
            return Component.create({
                name: 'Chessclock',
                oncreate ( vnode ) {
                    const { player } = vnode.attrs;
                    if (player === 'w'){domWhite = vnode.dom;}
                    if (player === 'b'){domBlack = vnode.dom;}
                    if (player === '*'){domTotal = vnode.dom;}
                },
                view ( vnode ) {
                    const { player } = vnode.attrs;
                    const tag      = 'div.fiom.f4.';
                    // must match with board-bar-top/bottom (bbb as of now)
                    const tagwhite = tag + (isRunning ? white.color : 'c999');
                    const tagblack = tag + (isRunning ? black.color : 'cddd');
                    const tagtotal = tag + 'orange';
                    return (
                        player === 'w' ? m(tagwhite, isRunning ? clock.white : '0:00:00') :
                        player === 'b' ? m(tagblack, isRunning ? clock.black : '0:00:00') :
                        m(tagtotal, clock.total)
                    );
                },
            });
        },

    };

})();

export { clock as default };
