// TODO: realize other timecontrols w/ time budgets per player

import './chessclock.scss';

import { H }     from '../services/helper';
import DB        from '../services/database';
import Config    from '../data/config';
import Factory   from './factory';

const DEBUG = true;

const now      = Date.now;
// const template = { format: H.msec2HMS, pressure: false, consumed: 0, budget: 0 };

let turn, start, onover, isPausing, interval, counter, divisor, pressure, lastTimestamp;
let domBlack, domWhite, domTotal;
let options   = DB.Options.first['chessclock'];
let timestate = H.clone(Config.templates.time);

const ChessClock = Factory.create('ChessClock', {
    start (timecontrol, onclockover) {

        options = DB.Options.first['chessclock'];

        timestate = H.clone(
            Config.templates.time,
            timecontrol,
            { start: now() },
            { white: { format: H.msec2HMS, pressure: false } },
            { black: { format: H.msec2HMS, pressure: false } },
        );

        turn          = 'w';
        counter       = 0;
        divisor       = options.divisor.big;
        pressure      = 10 * 1000;
        isPausing     = false;
        onover        = onclockover;

        interval && clearInterval(interval);
        interval  = setInterval(ChessClock.tick, 100);

        DEBUG && console.log('ChessClock.start', {turn, timestate});

    },
    state() {
        return timestate;
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
        DEBUG && console.log('ChessClock.continue', {turn});
    },
    pause () {
        ChessClock.tick();
        isPausing = true;
        clearInterval(interval);
        interval = 0;
        DEBUG && console.log('ChessClock.pause', {turn});
    },

    tick () {

        const diff = now() - lastTimestamp;
        lastTimestamp = now();

        const white  = timestate.white;
        const black  = timestate.black;

        turn === 'w' && ( white.consumed += diff );
        turn === 'b' && ( black.consumed += diff );
        counter += 1;

        // detect pressure
        if (white.budget - white.consumed < pressure) {
            white.format   = H.msec2HMSm;
            white.pressure = true;
            divisor = options.divisor.small;
        }
        if (black.budget - black.consumed < pressure) {
            black.format   = H.msec2HMSm;
            black.pressure = true;
            divisor = options.divisor.small;
        }

        // that's it, game over
        if (white.consumed >= white.budget || black.consumed >= black.budget){
            clearInterval(interval);
            interval  = 0;
            isPausing = false;
            ChessClock.render();
            onover && onover(white.budget, black.budget);
        }

        // don't update too often
        if (!(counter % divisor)) {
            ChessClock.ontick && ChessClock.ontick();
            ChessClock.render();
        }

    },
    blackclick () {
        const black     = timestate.black;
        black.consumed += now() - lastTimestamp;
        lastTimestamp   = now();
        black.budget   += timestate.timecontrol.bonus;
        turn = 'w';
    },
    whiteclick () {
        const white     = timestate.white;
        white.consumed += now() - lastTimestamp;
        lastTimestamp   = now();
        white.budget   += timestate.timecontrol.bonus;
        turn = 'b';

    },
    white () {
        const white = timestate.white;
        return white.format ? white.format(white.budget - white.consumed) : '0:00:00';
    },
    black () {
        const black = timestate.black;
        return black.format ? black.format(black.budget - black.consumed) : '0:00:00';
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
    onupdate ( vnode ) {
        const { player } = vnode.attrs;
        if (player === 'w'){domWhite = vnode.dom;}
        if (player === 'b'){domBlack = vnode.dom;}
        if (player === '*'){domTotal = vnode.dom;}
        // console.log('Clock.onupdate', player );
    },
    render () {
        domWhite && m.render(domWhite, ChessClock.white());
        domBlack && m.render(domBlack, ChessClock.black());
        domTotal && m.render(domTotal, ChessClock.total());
    },
    view ( vnode ) {

        const { player } = vnode.attrs;
        const white      = timestate.white;
        const black      = timestate.black;
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

        // console.log('Clock.view', {player});

        return m('div.clock', { className }, time);

    },

});

export default ChessClock;
