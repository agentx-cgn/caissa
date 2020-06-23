
import Caissa     from '../../caissa';
import DB         from '../../services/database';
import { H }      from '../../services/helper';
import Factory    from '../../components/factory';
import Forms      from '../../components/forms';
import Config     from '../../data/config';
import Tools      from '../../tools/tools';

import {
    Nothing,
    Spacer,
    PageTitle,
    FlexListShrink,
    FixedList,
    FlexListEntry,
    FlexListPlayEntry,
    HeaderLeft } from '../../components/misc';

const DEBUG = true;

const forms = {};
const plays = game => game.mode !== 'h-h';

Array.from(Config.templates.plays)
    .filter(plays)
    .forEach( play =>  {
        const group = 'play-' + play.mode;
        const form  = {
            group,
            autosubmit: false,
            ...DB.Options.first[group],
            submit: (form) => {
                const game = Tools.createGamefromPlay(play, form);
                DB.Games.create(game, true);
                DEBUG && console.log('plays.form.submitted', game.uuid, game.mode, game.white, game.black);
                Caissa.route('/game/:turn/:uuid/', { uuid: game.uuid, turn: game.turn });
            },
        };
        forms[play.mode] = form;

    })
;

function startGame(playTemplate) {
    const game = {
        ...Config.templates.game,
        ...playTemplate,
        turn: -1,
        uuid:  H.hash(String(Date.now())),
        timestamp: Date.now(),
    };
    DB.Games.create(game, true);
    Caissa.route('/game/:turn/:uuid/', { uuid: game.uuid, turn: game.turn });
}

const Plays = Factory.create('Plays', {

    view ( vnode ) {

        const { className, style } = vnode.attrs;
        const { mode } = vnode.attrs.params;

        return m('div.page.plays', { className, style }, [

            m(PageTitle,  'Start a new Game'),
            m(HeaderLeft, 'Play with Machines'),
            m(FixedList, Array.from(Config.templates.plays)
                .filter(plays)
                .map( play => {

                    const formdata = forms[play.mode];
                    const style = mode === play.mode
                        ? { marginBottom: '0px', backgroundColor: '#0e62993b', color: 'white' }
                        : {}
                    ;
                    // const onclick  = mode === play.mode
                    //     // just toggles
                    //     ? (e) => {e.redraw = false; Caissa.route('/plays/',       {},                {replace: true});}
                    //     : (e) => {e.redraw = false; Caissa.route('/plays/:mode/', {mode: play.mode}, {replace: true});}
                    // ;
                    const clicker = play => {
                        return (
                            play.mode === 'x-x'
                                ? e => {e.redraw = false; startGame(play);}
                                : play.mode === mode
                                    ? (e) => {e.redraw = false; Caissa.route('/plays/',       {},                {replace: true});}
                                    : (e) => {e.redraw = false; Caissa.route('/plays/:mode/', {mode: play.mode}, {replace: true});}
                        );
                    };

                    return m('[', [

                        m(FlexListEntry, { onclick: clicker(play),  style }, [
                            m('div.fiom.f4', play.white + ' vs. ' + play.black),
                            m('div.fior.f5', play.subline),
                        ]),

                        play.mode === mode
                            ? m(Forms, {formdata, noheader: true, className: 'play-options'})
                            : m(Nothing),

                    ]);

                })),

            m(HeaderLeft, 'Resume a Game (' + DB.Games.filter(plays).length + ')'),
            m(FlexListShrink, DB.Games.filter(plays).map (play => {
                const onclick = (e) => {e.redraw = false; Caissa.route('/play/:uuid/', {uuid: play.uuid});};
                return m(FlexListPlayEntry, { onclick, play });
            })),

            m(Spacer),
            m('button.pv1.mh3.mv1', {onclick: () => DB.Games.delete(plays) }, 'DB.Plays.clear()'),
            m('button.pv1.mh3.mv1', {onclick: () => DB.reset()       }, 'DB.reset()'),

        ]);

    },

});

export default Plays;
