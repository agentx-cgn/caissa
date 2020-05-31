
import Chess        from  'chess.js';
import { Chessboard, COLOR } from '../../../../extern/cm-chessboard/Chessboard';
import { H }        from '../../../services/helper';
import State        from '../../../data/state';
import Config       from '../../../data/config';
import Dispatcher   from '../../../services/dispatcher';
import Tools        from '../../../tools/tools';
import inputHandler from './board-input';

const state = State.board;

let chess = new Chess(), chessBoard = null;

const board = {

    name: 'board',

    fen (fen) {
        chessBoard && chessBoard.setPosition(fen, true);
    },

    game (gamestate) {
        // TODO: THIS IS SLOW
        // console.log('board.game', gamestate.game.uuid);

        // loads game, shows turn
        // valid moves must work

        if (gamestate.game.turn === -2) {
            state.fen = Config.fens.empty;

        } else if (gamestate.game.turn === -1) {
            state.fen = Config.fens.start;

        } else {
            const turn = gamestate.game.turn;
            const move = gamestate.moves[turn];
            if (!move) {
                console.log('board.game', gamestate.game.uuid, turn, move, gamestate.moves.length);
            }
            state.fen = move.fen;

        }
        state.white = gamestate.game.white;
        state.black = gamestate.game.black;

        !chess.load(state.fen) && console.warn('board.fen.failed', state.fen);
        // try {
        // setTimeout( () => {
        // NO INPUT FOR GAMES
        // chessBoard && chessBoard.enableMoveInput(inputHandler, state.turn % 2 ? COLOR.white : COLOR.black);
        // chessBoard && chessBoard.setOrientation(state.orientation);
        // chessBoard && chessBoard.setPosition(state.fen, true);
        // }, 60);
        // } catch(e){console.log('board.game.try');}

        Tools.updateFlags(chess);
    },

    piece (action, piece, field) {

        // chess.put({ type: chess.PAWN, color: chess.BLACK }, 'a5')
        // chess.put({ type: 'k', color: 'w' }, 'h1')
        // chess.remove('h1')

        if (action === 'add') {
            const type = piece[1], color = piece[0];
            chess.put({ type, color}, field);
            chessBoard.setPosition(chess.fen(), true);

        } else {
            console.log('WTF');
        }
    },

    mark (what) {

        const illu = state.illustrations;

        if (illu.marker[what] !== undefined ) illu.marker[what] =  !illu.marker[what];
        if (illu.arrows[what] !== undefined ) illu.arrows[what] =  !illu.arrows[what];

        Tools.updateMarker(chess, chessBoard, state);
        Tools.updateArrows(chess, chessBoard, state);

    },

};

Dispatcher.connect(board, false);


export default {
    onremove: function( /* vnode */ ) {
        chessBoard.destroy();
    },
    onupdate: function( vnode ) {

        // DOM elements whose vnodes have an onupdate hook do not get recycled.
        // setPosition returns a Promise which will be resolved, after the Animation has finished.

        if (chessBoard) {

            chessBoard.setOrientation(state.orientation);
            chessBoard.enableMoveInput(inputHandler({move: (...args) => {
                console.log('board.onupdate.move', ...args);
            }}, chess), COLOR.white);
            chessBoard.setPosition(state.fen, true);
            console.log('board.onupdate', H.strip(vnode.attrs));

        } else {
            console.log('board.onupdate', 'NO BOARD');

        }

    },
    oncreate: function( /* vnode */ ) {

        chessBoard = new Chessboard(
            document.querySelector('div.chessboard'),
            // with orientation = 'w'
            Config.board.config,
        );
        console.log('board.oncreate.out');

        // Tools.updateArrows(chess, chessBoard, state);
        // Tools.updateMarker(chess, chessBoard, state);

    },
    view( /*vnode*/ ) {
        return m('div.chessboard.dropzoneXX');
    },

};
