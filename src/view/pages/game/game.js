import './game.scss';

import Tools             from '../../tools/tools';
import { H }             from '../../services/helper';
import Dispatcher        from '../../services/dispatcher';
import DB                from '../../services/database';
import State             from '../../data/state';
import Config            from '../../data/config';
import GamesList         from '../../components/gameslist';
import Factory           from '../../components/factory';
import Moves             from './moves';

import { GameFlags, GameButtons } from './game-bars';
import { Spacer, GrowSpacer, TitleLeft, HeaderCentered, TextCenter} from '../../components/misc';

const state = State.game;
const fire  = Dispatcher.connect({ name: 'game'});

const Game = Factory.create('Game', {
    oninit () {
        Object.assign(state, H.deepcopy(Config.gamestatetemplate));
    },
    view ( vnode ) {

        const { className, style } = vnode.attrs;

        let uuid  = vnode.attrs.params.uuid === ':uuid' ? undefined :   vnode.attrs.params.uuid;
        let turn  = vnode.attrs.params.turn === ':turn' ? undefined : ~~vnode.attrs.params.turn;

        // there is nothing, show DB List
        if (!uuid && !state.game.uuid) {
            return m('div.page.game', { className, style }, [
                m(TitleLeft, 'Recent Games (DB)'),
                m(GamesList, { games: DB.Games.list() }),
            ]);

        // route /wo uuid, take from state
        } else if (!uuid && state.game.uuid) {
            uuid = state.game.uuid;
            turn = state.game.turn;

        // new game, overwrite state
        } else if (uuid !== state.game.uuid) {
            const game    = DB.Games.get(uuid);
            const moves   = Tools.genMoves(game.pgn);
            turn =  moves.length -1;
            Object.assign(state, H.deepcopy(Config.gamestatetemplate), {
                game: DB.Games.update(uuid, {turn, plycount: moves.length}),
                moves,
            });

        // same game, new turn
        // from game-buttons or user reclicked game
        } else if (state.game.turn !== turn && turn !== undefined){
            state.game = DB.Games.update(uuid, { turn });

        }

        // update board, showing fen
        fire('board', 'game', [ state ]);
        Tools.scrollTurnIntoView(state);

        const players    = state.game.white  + '<br>' + state.game.black;
        const resultline = state.game.result + ' '    + state.game.termination + ' ' + state.game.timecontrol;

        return m('div.page.game', { className, style }, [
            m(GameButtons),
            m(HeaderCentered, {class: 'gm-players'}, m.trust(players)),
            m(Moves),
            m(Spacer),
            m(GameFlags),
            m(Spacer),
            m(TextCenter, {class: 'gm-result', title: 'result termination timecontrol'}, resultline ),
            m(GrowSpacer),
        ]);

    },
});

export default Game;
