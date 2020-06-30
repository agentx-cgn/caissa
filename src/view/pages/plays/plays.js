
import Caissa     from '../../caissa';
import DB         from '../../services/database';
import { H }      from '../../services/helper';
import Factory    from '../../components/factory';
import Forms      from '../../components/forms';
import Config     from '../../data/config';
import Tools      from '../../tools/tools';

import {
    Nothing,
    GrowSpacer,
    PageTitle,
    FlexListShrink,
    FixedList,
    FlexListEntry,
    FixedButton,
    HeaderLeft } from '../../components/misc';

const DEBUG = true;

const forms  = {};
const plays  = game => game.mode !== 'h-h' && game.mode !== 'x-x';
const solos  = game => game.mode === 'x-x';
const dbgame = game => game.mode !== 'h-h';

Array.from(Config.templates.plays)
    .filter(plays)
    .forEach( play =>  {
        const group = 'play-' + play.mode;
        const form  = {
            group,
            autosubmit: false,
            ...DB.Options.first[group],
            submit: (form) => {
                const game = Tools.Games.fromPlayForm(play, form);
                DB.Games.create(game, true);
                DB.Boards.create(H.clone(Config.templates.board, { uuid: game.uuid }));
                DEBUG && console.log('plays.form.submitted', game.uuid, game.mode, game.white, game.black);
                Caissa.route('/game/:turn/:uuid/', { uuid: game.uuid, turn: game.turn });
            },
        };
        forms[play.mode] = form;

    })
;

function startGame(playTemplate) {
    const game = H.clone(Config.templates.game, playTemplate, {
        turn: -1,
        uuid:  H.hash(String(Date.now())),
        timestamp: Date.now(),
    });
    DB.Games.create(game, true);
    DB.Boards.create(H.clone(Config.templates.board, { uuid: game.uuid }));
    Caissa.route('/game/:turn/:uuid/', { uuid: game.uuid, turn: game.turn });
}

const PlayEntry = {
    view ( vnode ) {
        const { play, className, onclick } = vnode.attrs;
        return m(FlexListEntry, { className, onclick }, [
            m('div.fiom.f4', play.header.White + ' vs. ' + play.header.Black),
            m('div.fior.f5', play.subline),
        ]);
    },
};

const PlayListEntry = {
    view ( vnode ) {
        const { play, className, onclick } = vnode.attrs;
        return m(FlexListEntry, { className, onclick }, [
            m('.fiom.f4', play.header.White + ' vs ' + play.header.Black),
            m('.fior.f5', H.date2isoLocal(new Date(play.timestamp))),
            m('.fior.f5', `${play.difficulty} (${play.depth}) / ${play.time} secs`),
        ]);
    },
};



const Plays = Factory.create('Plays', {

    view ( vnode ) {

        const { className, style } = vnode.attrs;
        const { mode } = vnode.attrs.params;

        const clicker = play => {
            return (
                play.mode === 'x-x'
                    ? e => {e.redraw = false; startGame(play);}
                    : play.mode === mode
                        ? (e) => {e.redraw = false; Caissa.route('/plays/',       {},                {replace: true});}
                        : (e) => {e.redraw = false; Caissa.route('/plays/:mode/', {mode: play.mode}, {replace: true});}
            );
        };

        return m('div.page.plays', { className, style }, [

            m(PageTitle,  'Start a new Game'),
            m(FixedList, Array.from(Config.templates.plays)
                .filter(solos)
                .map( play => {
                    return m('[', [
                        m(PlayEntry, { play, onclick: clicker(play) }),
                    ]);
                })),

            m(HeaderLeft, 'Play with Machines'),
            m(FixedList, Array.from(Config.templates.plays)
                .filter(plays)
                .map( play => {

                    const formdata  = forms[play.mode];
                    const className = play.mode === mode ? 'active' : '';

                    return m('[', [
                        m(PlayEntry, { play, className, onclick: clicker(play) }),
                        play.mode === mode
                            ? m(Forms, {formdata, noheader: true, className: 'play-options'})
                            : m(Nothing)
                        ,
                    ]);

                })),

            m(HeaderLeft, 'Resume a Game [' + DB.Games.filter(dbgame).length + ']'),
            m(FlexListShrink, DB.Games.filter(dbgame).map ( play => {
                return m(PlayListEntry, { play, onclick: e => {
                    e.redraw = false;
                    Caissa.route('/play/:uuid/', {uuid: play.uuid});
                } });
            })),

            m(GrowSpacer),
            m(FixedButton, { onclick: () => DB.Games.delete(dbgame) }, 'DB.Plays.clear()' ),

        ]);

    },

});

export default Plays;
