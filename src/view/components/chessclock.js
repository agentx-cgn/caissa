// TODO: realize other timecontrols w/ time budgets per player

import { H }     from '../services/helper';
import Factory   from './factory';

const DEBUG = true;

const now      = Date.now;
const template = { format: H.msec2HMS, pressure: false, consumed: 0, budget: 0 };

let turn, start, isPausing, interval, counter, divisor, timebonus, pressure, lastTimestamp;
let domBlack, domWhite, domTotal;

let white = H.clone(template);
let black = H.clone(template);

const ChessClock = Factory.create('ChessClock', {
    start (clock) {

        turn          = 'w';
        timebonus     = ~~clock.timecontrol.bonus; // msecs
        counter       = 0;
        divisor       = 5;
        lastTimestamp = now();
        start         = now();
        pressure      = 10 * 1000;
        isPausing     = false;

        white = H.clone(template, { budget: clock.white });
        white.format = H.msec2HMS;
        black = H.clone(template, { budget: clock.black });
        black.format = H.msec2HMS;

        interval && clearInterval(interval);
        interval  = setInterval(ChessClock.tick, 100);

        DEBUG && console.log('ChessClock.start', clock);

    },
    isTicking() {
        // console.log('interval', interval);
        return !!interval;
    },
    isPaused() {
        return isPausing;
    },
    stop () {
        clearInterval(interval);
        interval = 0;
    },
    continue () {
        lastTimestamp = now();
        isPausing = false;
        interval && clearInterval(interval);
        interval  = setInterval(ChessClock.tick, 100);
    },
    pause () {
        ChessClock.tick();
        isPausing = true;
        clearInterval(interval);
        interval = 0;
    },

    tick () {

        const diff = now() - lastTimestamp;
        lastTimestamp = now();

        turn === 'w' && ( white.consumed += diff );
        turn === 'b' && ( black.consumed += diff );
        counter += 1;

        // detect pressure
        if (white.budget - white.consumed < pressure) {
            white.format   = H.msec2HMSm;
            white.pressure = true;
            divisor = 1;
        }
        if (black.budget - black.consumed < pressure) {
            black.format   = H.msec2HMSm;
            black.pressure = true;
            divisor = 1;
        }

        // that's it, game over
        if (white.consumed >= white.budget || black.consumed >= black.budget){
            ChessClock.render();
            clearInterval(interval);
            interval = 0;
            ChessClock.over && ChessClock.over(white.budget, black.budget);
        }

        // don't update too often
        if (!(counter % divisor)) {
            ChessClock.ontick && ChessClock.ontick();
            ChessClock.render();
        }

    },
    blackclick () {
        black.consumed += now() - lastTimestamp;
        lastTimestamp   = now();
        black.budget   += timebonus;
        turn = 'w';
    },
    whiteclick () {
        white.consumed += now() - lastTimestamp;
        lastTimestamp   = now();
        white.budget   += timebonus;
        turn = 'b';

    },
    white () {
        return (isPausing || interval) ? white.format(white.budget - white.consumed) : '0:00:00';
    },
    black () {
        return (isPausing || interval) ? black.format(black.budget - black.consumed) : '0:00:00';
    },
    total () {
        return (isPausing || interval) ? H.msec2HMSm(now() - start) : '0:00:00';
    },
    oncreate ( vnode ) {
        const { player } = vnode.attrs;
        if (player === 'w'){domWhite = vnode.dom;}
        if (player === 'b'){domBlack = vnode.dom;}
        if (player === '*'){domTotal = vnode.dom;}
    },
    render () {
        domWhite && m.render(domWhite, ChessClock.white());
        domBlack && m.render(domBlack, ChessClock.black());
        domTotal && m.render(domTotal, ChessClock.total());
    },
    view ( vnode ) {

        const { player } = vnode.attrs;
        const className  = H.classes({
            white:    player === 'w',
            black:    player === 'b',
            total:    player === '*',
            active:   !!interval || isPausing,
            pressure: player === 'w' && white.pressure || player === 'b' && black.pressure,
        });
        const time =
            player === 'w' ? ChessClock.white() :
            player === 'b' ? ChessClock.black() :
            ChessClock.total()
        ;

        return m('div.clock', { className }, time);

    },

});

export default ChessClock;
