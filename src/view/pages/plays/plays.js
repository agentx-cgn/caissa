
import Caissa     from '../../caissa';
import DB         from '../../services/database';
import { H }      from '../../services/helper';
import Factory    from '../../components/factory';
import Forms      from '../../components/forms/forms';
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
    HeaderLeft,
    FlexList} from '../../components/misc';

const DEBUG = true;

const forms  = {};
const plays  = game => game.mode !== 'h-h' && game.mode !== 'x-x';
const solos  = game => game.mode === 'x-x';
const dbgame = game => game.mode !== 'h-h' && game.uuid !== 'default';

Array.from(Config.templates.plays)
    .filter(plays)
    .forEach( play =>  {
        const group = 'play-' + play.mode;
        const form  = {
            ...DB.Options.first[group],
            group,
            autosubmit: false,
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

// Create a x-x play
function startGame(playTemplate) {

    const timestamp = Date.now();
    const uuid = H.hash(String(timestamp));
    const turn = -1;

    DB.Games.create(H.clone(Config.templates.game, playTemplate, { uuid, turn, timestamp }), true);
    DB.Boards.create(H.clone(Config.templates.board, { uuid }), true);

    Caissa.route('/game/:turn/:uuid/', { uuid, turn });

}

// Template Play
const PlayEntry = {
    view ( vnode ) {
        const { play, className, onclick } = vnode.attrs;
        return m(FlexListEntry, { className, onclick }, [
            m('div.fiom.f4', play.header.White + ' vs. ' + play.header.Black),
            m('div.fior.f5', play.subline),
        ]);
    },
};

const playerIcons = function (mode) {
    const fish  = m('i.f6.fa.fa-fish.fa-rotate-270');
    const human = m('i.f6.fa.fa-user');
    return (
        mode === 'x-x' ? m('span.pr2', {style: 'vertical-align: text-bottom' }, m('[', [ human, ' - ', human ]))  :
        mode === 's-s' ? m('span.pr2', {style: 'vertical-align: text-bottom' }, m('[', [ fish,  ' - ', fish  ]))  :
        mode === 'h-s' ? m('span.pr2', {style: 'vertical-align: text-bottom' }, m('[', [ human, ' - ', fish  ]))  :
        mode === 's-h' ? m('span.pr2', {style: 'vertical-align: text-bottom' }, m('[', [ fish,  ' - ', human ]))  :
        m('span', 'wtf')
    );
};

// DB Plays
const PlayListEntry = {
    view ( vnode ) {
        const { play, className, onclick, ondelete } = vnode.attrs;
        return m(FlexListEntry, { className, onclick }, [
            playerIcons(play.mode),
            m('span.fiom.f4', play.header.White + ' vs ' + play.header.Black),
            m('div.f5.fior.pv1',  H.date2isoLocal(new Date(play.timestamp)), m('i.f6.fa.fa-trash-alt.pl4', { onclick: ondelete })),
            play.opening
                ? m('div.f5.fior.pv1', `OP: ${play.opening}` )
                : '',
            play.difficulty
                ? m('div.f5.fior.pv1', `${play.difficulty} (${play.depth}) / ${play.time} secs`)
                : '',

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

            m(PageTitle, 'Start a new Game'),
            m(FlexList, [
                m(FixedList, Array.from(Config.templates.plays)
                    .filter(solos)
                    .map( play => {
                        return m(PlayEntry, { play, onclick: clicker(play) });
                    }),
                ),

                m(HeaderLeft, 'Play with Machines'),
                m(FixedList, Array.from(Config.templates.plays)
                    .filter(plays)
                    .map( play => {

                        const formdata  = forms[play.mode];
                        const className = play.mode === mode ? 'active' : '';

                        return m('[', [
                            m(PlayEntry, { play, className, onclick: clicker(play) }),
                            play.mode === mode
                                ? m(Forms, { formdata, noheader: true, className: 'play-options' })
                                : m(Nothing)
                            ,
                        ]);

                    })),

                m(HeaderLeft, 'Resume a Game [' + DB.Games.filter(dbgame).length + ']'),
                m(FlexListShrink, DB.Games.filter(dbgame).map ( play => {

                    const onclick = e => {
                        e.redraw = false;
                        Caissa.route('/play/:uuid/', { uuid: play.uuid });
                    };

                    const ondelete = e => {
                        DEBUG && console.log('plays.ondelete', play.uuid);
                        e.redraw = false;
                        // DB.Games.delete(play.uuid);
                        // Caissa.redraw();
                        return H.eat(e);
                    };

                    return m(PlayListEntry, { play, onclick, ondelete });

                })),

                m(GrowSpacer),
                m(FixedButton, { onclick: () => DB.Games.delete(dbgame) }, 'DB.Plays.clear()' ),
            ]),

        ]);

    },

});

export default Plays;
