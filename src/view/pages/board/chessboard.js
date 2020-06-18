
import { $$ } from '../../services/helper';
import Factory from '../../components/factory';
import Config   from '../../data/config';
// import GameController from '../../controller/game-controller';
import { Chessboard } from '../../../extern/cm-chessboard/Chessboard';
import Tools from '../../tools/tools';
import DB from '../../services/database';

const DEBUG = true;

let chessBoard, game;

const ChessBoard = Factory.create('ChessBoard', {
    onresize : Tools.board.resize,
    oncreate () {
        chessBoard = new Chessboard(
            $$('div.chessboard'),
            Config.board.config,
        );
        Tools.board.resize(innerWidth, innerHeight);
        DEBUG && console.log('chessboard.oncreate');
    },
    view () {
        DEBUG && console.log('chessboard.view');
        return m('div.chessboard');
    },
    onupdate ( vnode ) {
        Tools.board.resize(innerWidth, innerHeight);
        game = vnode.attrs.game;
        DEBUG && console.log('chessboard.onupdate', game);

        // chessBoard.enableMoveInput(inputHandler({move: (...args) => {
        //     console.log('board.onupdate.move', ...args);
        // }}, chess), COLOR.white);
    },
    onafterupdates () {

        if (game && game.uuid) {
            // DEBUG && console.log('chessboard.onafterupdates', game.uuid);

            const board = DB.Boards.createget(game.uuid);

            if (chessBoard && board) {
                chessBoard.setOrientation(board.orientation);
                chessBoard.setPosition(board.fen, true);
                // DEBUG && console.log('chessboard.onafterupdates', game.uuid, board.fen);

            } else {
                DEBUG && console.log('chessboard.onafterupdates', 'NO BOARD', chessBoard, board);

            }
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
