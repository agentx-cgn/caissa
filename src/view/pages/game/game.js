import './game.scss';

import Tools             from '../../tools/tools';
import { H }             from '../../services/helper';
import DB                from '../../services/database';
import State             from '../../data/state';
// import Config            from '../../data/config';
// import GamesList         from '../../components/gameslist';
import Factory           from '../../components/factory';
import Moves             from './moves';

import { GameFlags, GameButtons } from './game-bars';
import { Spacer, GrowSpacer, HeaderCentered, TextCenter, Error, Nothing} from '../../components/misc';

// const state = State.game;
// Object.assign(state, H.create({uuid: undefined, turn: undefined}));

let width;

const Game = Factory.create('Game', {

    onresize (innerWidth) {
        width = innerWidth;
    },
    view ( vnode ) {

        const { params: { uuid, turn }, className, style } = vnode.attrs;

        let game, players, resultline;

        if (uuid && turn !== undefined){

            game = DB.Games.find(uuid);

            if (game) {
                DB.Games.update(uuid, { turn: ~~turn });
                players    = game.white  + '<br>' + game.black;
                resultline = game.result + ' '    + game.termination + ' ' + game.timecontrol;
                Tools.scrollTurnIntoView(turn);
            }
        }




        // // let uuid  = params.uuid === ':uuid' ? undefined :   params.uuid;
        // // let turn  = params.turn === ':turn' ? undefined : ~~params.turn;

        // // no uuid, show DB List
        // //TODO: this is superflouos
        // if (!uuid) {
        //     return m('div.page.game', { className, style }, [
        //         m(PageTitle, 'Recent Games (DB)'),
        //         m(GamesList, { games: DB.Games.list() }),
        //     ]);

        //     // // route /wo uuid, take from state
        //     // } else if (!uuid && state.uuid) {
        //     //     uuid = state.uuid;
        //     //     turn = state.turn;

        // // new game, overwrite state
        // } else if (uuid !== state.game.uuid) {
        //     const game    = DB.Games.get(uuid);
        //     const moves   = Tools.games.pgn2moves(game.pgn);
        //     turn =  moves.length -1;
        //     Object.assign(state, H.deepcopy(Config.gamestatetemplate), {
        //         game: DB.Games.update(uuid, {turn, plycount: moves.length}),
        //         moves,
        //     });

        // // same game, new turn
        // // from game-buttons or user reclicked game
        // } else if (state.game.turn !== turn && turn !== undefined){
        //     state.game = DB.Games.update(uuid, { turn });

        // }

        // update board, showing fen
        // fire('board', 'game', [ state ]);
        // Tools.scrollTurnIntoView(state.turn);

        // const players    = state.game.white  + '<br>' + state.game.black;
        // const resultline = state.game.result + ' '    + state.game.termination + ' ' + state.game.timecontrol;

        return !uuid
            ? m(Nothing)
            : !game
                ? m('div.page.game', { className, style }, m(Error, 'Game not found: ' + uuid))
                : width >= 720
                    ? m('div.page.game', { className, style }, [
                        m(HeaderCentered, {class: 'gm-players'}, m.trust(players)),
                        m(Moves, { game }),
                        m(Spacer),
                        m(Spacer),
                        m(TextCenter, {class: 'gm-result', title: 'result termination timecontrol'}, resultline ),
                        m(GrowSpacer),
                    ])
                    : m('div.page.game', { className, style }, [
                        m(GameButtons, { game }),
                        m(HeaderCentered, {class: 'gm-players'}, m.trust(players)),
                        m(Moves,      { game }),
                        m(Spacer),
                        m(GameFlags,  { game }),
                        m(Spacer),
                        m(TextCenter, {class: 'gm-result', title: 'result termination timecontrol'}, resultline ),
                        m(GrowSpacer),
                    ]);

    },
});

export default Game;
