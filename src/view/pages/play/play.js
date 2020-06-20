
import DB         from '../../services/database';
// import State      from '../../data/state';
// import Config     from '../../data/config';
import Clock      from '../../components/chessclock';
import Factory    from '../../components/factory';
import Controller from './play-controler';

import {FlexList, Spacer, Nothing}   from '../../components/misc';

// const state = State.play;
// let isReady = false;

const Play = Factory.create('Play', {

    view ( vnode ) {

        const { className, style, uuid } = vnode.attrs;
        const play = DB.Games.find(uuid);

        return m('div.page.play', { className, style },

            !play
                // ? m(TextLeft, 'Please wait...')
                ? m(Nothing)
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
