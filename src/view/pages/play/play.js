
import DB         from '../../services/database';
import State      from '../../data/state';
import Config     from '../../data/config';
import Clock      from '../../components/chessclock';
import Factory    from '../../components/factory';
import Controller from './play-controler';

import {FlexList, TextLeft, Spacer}   from '../../components/misc';

const state = State.play;
let isReady = false;

const Play = Factory.create('Play', {

    onbeforeremove ( ) {
        isReady = false;
    },
    oninit  ( vnode ) {

        const { uuid } = vnode.attrs;
        const play = DB.Plays.list.filter( play => play.uuid = uuid);

        Object.assign(state, Config.playstatetemplate, { play });

        // console.log('play.oninit');
        // Controller
        //     .start(5 * 1000)
        //     .then( () => {
        //         console.log('play.oninit.done');
        //         isReady = true;
        //         Caissa.redraw();
        //     })
        // ;

    },

    view ( vnode ) {

        const { className, style } = vnode.attrs;

        return m('div.page.play', { className, style },

            !isReady
                ? m(TextLeft, 'Please wait...')
                : m(FlexList, [
                    m('button.pv1.mh3.mv1', {onclick: () => Controller.start(60 * 1000) }, 'Controller.start(60secs)'),
                    m('button.pv1.mh3.mv1', {onclick: () => Controller.white.move() }, 'white.move()'),
                    m('button.pv1.mh3.mv1', {onclick: () => Controller.black.move() }, 'black.move()'),
                    m('button.pv1.mh3.mv1', {onclick: () => Controller.stop() }, 'Controller.stop'),
                    m(Spacer),
                    m(Clock.comp(), {player: '*'}),
                ])
            ,
        );
    },

});

export default Play;
