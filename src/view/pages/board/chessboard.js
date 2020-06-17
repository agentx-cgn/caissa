
import { H, $$ } from '../../services/helper';
import Factory from '../../components/factory';
import State   from '../../data/state';
import Config   from '../../data/config';
// import GameController from '../../controller/game-controller';
import { Chessboard, COLOR } from '../../../extern/cm-chessboard/Chessboard';
// import { GameFlags, GameButtons } from '../../pages/game/game-bars';
// import BoardBar  from './board-bar';
import Tools from '../../tools/tools';
import DB from '../../services/database';

const state = State.board;
const DEBUG = true;

// let width, size, oldRoute, oldParams;

let chessBoard, lastParams = {};

function prepareState (oldParams, newParams) {
    const diff = H.difference(oldParams, newParams);
    if (diff.uuid){
        const board = DB.Boards.createget(diff.uuid);
        const game  = DB.Games.find(diff.uuid);
        Object.assign(state, board, {moves: game.moves});
        const turn = diff.turn ? ~~diff.turn : state.game.moves.length -1;
        state.fen = state.moves[turn];
        state.orientation = state.game.orientation || 'w';
    }
    if (diff.turn){
        state.fen = state.game.moves[~~diff.turn];
    }
}

const ChessBoard = Factory.create('ChessBoard', {
    onresize : Tools.board.resize,
    oncreate () {
        chessBoard = new Chessboard(
            $$('div.chessboard'),
            Config.board.config,
        );
        Tools.board.resize(innerWidth, innerHeight);
        console.log('chessboard.oncreate');
    },
    view () {
        console.log('chessboard.view');
        return m('div.chessboard');
    },
    onupdate ( vnode ) {
        prepareState(lastParams, vnode.attrs.params);
        lastParams = vnode.attrs;

        // chessBoard.enableMoveInput(inputHandler({move: (...args) => {
        //     console.log('board.onupdate.move', ...args);
        // }}, chess), COLOR.white);
    },
    onafterupdates () {

        const { route, params } = lastParams;

        if (chessBoard) {

            chessBoard.setOrientation(state.orientation);
            chessBoard.setPosition(state.fen, true);
            console.log('chessboard.onafterupdates', H.strip({ route, params }));

        } else {
            console.log('chessboard.onafterupdates', 'NO BOARD');

        }

    },

});

export default ChessBoard;


/*

state.games[uuid/hash] = {
    moves // show last move
    turn  // current move // -2, -1, 0
    rotation //
    arrow flags // show decoration
    gameController // manipulate game, input methods // move validation // drag new pieces

}




 */
