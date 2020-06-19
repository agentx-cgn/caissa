
import { $$ } from '../../services/helper';
import Factory from '../../components/factory';
import Config   from '../../data/config';
// import GameController from '../../controller/game-controller';
import { Chessboard } from '../../../extern/cm-chessboard/Chessboard';
import Tools from '../../tools/tools';
// import DB from '../../services/database';

const DEBUG = true;

let chessBoard, board, game;

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
    onbeforeremove () {
        // Removes the board from the DOM. Returns a Promise which will be resolved, after destruction.
        // If a Promise is returned, Mithril only detaches the DOM element after the promise completes.
        return chessBoard.destroy().then( () => {
            chessBoard = undefined;
            DEBUG && console.log('chessboard.destroyed');
        });
    },
    view ( vnode ) {

        game  = vnode.attrs.game;
        board = vnode.attrs.board;

        DEBUG && console.log('chessboard.view.cbgb', !!chessBoard, !!game, !!board);
        return m('div.chessboard');
    },
    onupdate ( vnode ) {
        if (!chessBoard) {
            // eslint-disable-next-line no-debugger
            debugger;

        } else {
            game  = vnode.attrs.game;
            board = vnode.attrs.board;

            (chessBoard.getOrientation() !== board.orientation) && chessBoard.setOrientation(board.orientation);
            // Tools.board.resize(innerWidth, innerHeight);
            DEBUG && console.log('chessboard.onupdate.cbgb', !!chessBoard, !!game, !!board);
        }

        // chessBoard.enableMoveInput(inputHandler({move: (...args) => {
        //     console.log('board.onupdate.move', ...args);
        // }}, chess), COLOR.white);
    },
    onafterupdates () {

        if (chessBoard && game && board) {
            DEBUG && console.log('chessboard.onafterupdates', board.fen);
            chessBoard.setPosition(board.fen, true);

        } else {
            DEBUG && console.warn('chessboard.onafterupdates.cbgb', !!chessBoard, !!game, !!board);

        }

    },

});

export default ChessBoard;
