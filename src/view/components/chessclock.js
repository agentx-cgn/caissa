// TODO: realize other timecontrols w/ time budgets per player

import { H } from '../services/helper';
import Factory   from './factory';

let isRunning, turn, start, interval, timecontrol, total, counter, divisor;
let domBlack, domWhite, domTotal;

const template = { format: H.msec2HMS, time: 0, color: 'cred' };
const white = {};
const black = {};

const ChessClock = Factory.create('ChessClock', {
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
        interval  = setInterval(ChessClock.tick, 100);
        isRunning = true;

    },
    stop () {
        clearInterval(interval);
        isRunning = false;
    },
    render () {
        m.render(domWhite, ChessClock.white);
        m.render(domBlack, ChessClock.black);
        m.render(domTotal, ChessClock.total);
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
            ChessClock.render();
            clearInterval(interval);
            ChessClock.over && ChessClock.over(white.time, black.time);
        }

        // don't update too often
        if (!(counter % divisor)) {
            ChessClock.ontick && ChessClock.ontick();
            ChessClock.render();
        }

    },
    blackclick () {
        if (turn === 'b')  turn = 'w';
    },
    whiteclick () {
        if (turn === 'w')  turn = 'b';
    },
    white () {
        return white.format(timecontrol - white.time);
    },
    black () {
        return black.format(timecontrol - black.time);
    },
    total () {
        return H.msec2HMSm(total);
    },
    oncreate ( vnode ) {
        const { player } = vnode.attrs;
        if (player === 'w'){domWhite = vnode.dom;}
        if (player === 'b'){domBlack = vnode.dom;}
        if (player === '*'){domTotal = vnode.dom;}
        Object.assign(white, template);
        Object.assign(black, template);
    },
    view ( vnode ) {
        const { player } = vnode.attrs;
        const tag      = 'div.fiom.f4.';
        // must match with board-bar-top/bottom (bbb as of now)
        const tagwhite = tag + (isRunning ? white.color : 'c999');
        const tagblack = tag + (isRunning ? black.color : 'cddd');
        const tagtotal = tag + 'orange';
        return (
            player === 'w' ? m(tagwhite, isRunning ? ChessClock.white : '0:00:00') :
            player === 'b' ? m(tagblack, isRunning ? ChessClock.black : '0:00:00') :
            m(tagtotal, ChessClock.total)
        );
    },

});

export default ChessClock;
