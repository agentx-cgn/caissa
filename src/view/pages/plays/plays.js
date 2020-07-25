
import Caissa     from '../../caissa';
import DB         from '../../services/database';
import { H }      from '../../services/helper';
import Factory    from '../../components/factory';
import Forms      from '../../components/forms/forms';
import Config     from '../../data/config';
import Tools      from '../../tools/tools';

import {
    GrowSpacer,
    PageTitle,
    FlexListShrink,
    FixedList,
    FlexListEntry,
    FixedButton,
    HeaderLeft,
    FlexList} from '../../components/misc';

const DEBUG = true;

// holds forms for machine plays
const forms  = {};

// play filter
const playSolo  = play => play.rivals === 'x-x';
const playMach  = play => play.rivals === 's-s' || play.rivals === 's-h' || play.rivals === 'h-s';

// game filter for resumables
const gameCont  = game => !!game.timestamp && !game.over;

function startGame(game) {

    /**
     * games with no timestamp and over === false, haven't stated yet
     * games with timestamp and over === false, have started, but not yet finished
     */

    const timestamp = Date.now();
    let uuid = H.hash(String(timestamp));
    let turn = -1;

    //resume game
    if (game.timestamp) {
        uuid = game.uuid;
        turn = game.moves.length -1;

    // new free game
    } else if (game.rivals === 'x-x'){
        const play = H.clone(Config.templates.game, game, { uuid, turn, timestamp });
        play.moves = Array.from(play.moves);
        DB.Games.create(play, true);
        DB.Boards.create(H.clone(Config.templates.board, { uuid }), true);

    // new machine game
    } else {
        const timecontrol = game.timecontrol;
        const game = Tools.Games.fromPlayForm(game, {
            uuid,
            timestamp,
            clock: { timecontrol, white: timecontrol.budget, black: timecontrol.budget},
        });
        DB.Games.create(game, true);
        DB.Boards.create(H.clone(Config.templates.board, { uuid: game.uuid }));

    }

    DEBUG && console.log('Plays.startGame', { uuid, turn, rivals: game.rivals });

    Caissa.route('/game/:turn/:uuid/', { uuid, turn });

}


// Build forms for machine plays
Array.from(Config.templates.plays)
    .filter(playMach)
    .forEach( play =>  {
        const group = 'play-' + play.rivals;
        forms[play.rivals] = {
            ...DB.Options.first[group],
            group,
            rivals: play.rivals,
            autosubmit: false,
            submit: startGame,
        };
    })
;

const playerIcons = function (rivals) {
    const fish  = m('i.f6.fa.fa-fish.fa-rotate-270');
    const human = m('i.f6.fa.fa-user');
    return (
        rivals === 'a-a' ? m('span.pr2.v-txt-btm.ceee', m('[', [ human, ' - ', human ]))  :
        rivals === 'x-x' ? m('span.pr2.v-txt-btm.ceee', m('[', [ human, ' - ', human ]))  :
        rivals === 's-s' ? m('span.pr2.v-txt-btm.ceee', m('[', [ fish,  ' - ', fish  ]))  :
        rivals === 'h-s' ? m('span.pr2.v-txt-btm.ceee', m('[', [ human, ' - ', fish  ]))  :
        rivals === 's-h' ? m('span.pr2.v-txt-btm.ceee', m('[', [ fish,  ' - ', human ]))  :
        m('span', 'wtf')
    );
};

// Template Play
const PlayEntry = {
    view ( vnode ) {
        const { play, className, onclick } = vnode.attrs;
        return m(FlexListEntry, { className, onclick }, [
            m('div.fiom.f4.ceee', play.header.White + ' vs. ' + play.header.Black),
            m('div.fior.f5', play.subline),
        ]);
    },
};

// DB Games
const PlayListEntry = {
    view ( vnode ) {

        const { play, className, onclick, ondelete } = vnode.attrs;

        return m(FlexListEntry, { className, onclick }, [
            playerIcons(play.rivals),
            m('span.fiom.f4.ceee', play.header.White + ' vs ' + play.header.Black),
            m('div.f5.fior.pt2',  H.date2isoLocal(new Date(play.timestamp)), m('i.fa.fa-trash-alt.f6.pl4', { onclick: ondelete })),
            play.opening    && m('div.f5.fior.pt1', `OP: ${play.opening.label}` ),
            play.difficulty && m('div.f5.fior.pt1', `${play.difficulty} (${play.depth}) / ${play.time} secs`),
        ]);

    },
};

const Plays = Factory.create('Plays', {

    view ( vnode ) {

        const { className, style } = vnode.attrs;
        const { rivals } = vnode.attrs.params;

        // toggles the form
        const clicker = play => {
            return (
                play.rivals === 'x-x'
                    ? e => { e.redraw = false; startGame(play); }
                    : play.rivals === rivals
                        ? e => {e.redraw = false; Caissa.route('/plays/', {}, {replace: true});}
                        : e => {e.redraw = false; Caissa.route('/plays/:rivals/', {rivals: play.rivals}, {replace: true});}
            );
        };

        return m('div.page.plays', { className, style }, [

            m(PageTitle, 'Start a new Game'),
            m(FlexList, [

                // Free game
                m(FixedList, Array.from(Config.templates.plays)
                    .filter(playSolo)
                    .map( play => m(PlayEntry, { play, onclick: clicker(play) })),
                ),

                // Machines
                m(HeaderLeft, 'Play with Machines'),
                m(FixedList, Array.from(Config.templates.plays)
                    .filter(playMach)
                    .map( play => {

                        const formdata  = forms[play.rivals];
                        const className = play.rivals === rivals ? 'active' : '';

                        return m('[', [
                            m(PlayEntry, { play, className, onclick: clicker(play) }),
                            !!rivals && m(Forms, { formdata, noheader: true, className: 'play-options' }),
                        ]);

                    }))
                ,
                //TODO: Only show if games exist
                // Unfinished games
                m(HeaderLeft, 'Resume a Game [' + DB.Games.filter(gameCont).length + ']'),
                m(FlexListShrink, DB.Games.filter(gameCont).map ( play => {

                    const onclick = e => {
                        e.redraw = false;
                        startGame(play);
                    };

                    const ondelete = e => {
                        DB.Games.delete(play.uuid);
                        DB.Boards.delete(play.uuid);
                        DEBUG && console.log('plays.ondelete.out', play.uuid);
                        return H.eat(e);
                    };

                    return m(PlayListEntry, { play, onclick, ondelete });

                })),

                m(GrowSpacer),
                m(FixedButton, { onclick: () => {
                    DB.Games.filter(gameCont).forEach( play => {
                        DB.Games.delete(play.uuid);
                        DB.Boards.delete(play.uuid);
                    });
                }}, 'DB.Plays.clear()' ),
            ]),

        ]);

    },

});

export default Plays;
