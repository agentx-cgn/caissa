
import { Chessboard } from '../../../extern/cm-chessboard/Chessboard';
import { $$ }         from '../../services/helper';
import Factory        from '../../components/factory';
import Config         from '../../data/config';
import Tools          from '../../tools/tools';

const DEBUG = true;

let chessBoard, board, game, controller;

const ChessBoard = Factory.create('ChessBoard', {
    onresize : Tools.board.resize,
    oncreate ( vnode ) {

        game  = vnode.attrs.game;
        board = vnode.attrs.board;
        controller = vnode.attrs.controller;

        chessBoard = new Chessboard(
            $$('div.chessboard'),
            Config.board.config,
        );
        chessBoard.initialization.then( () => {
            chessBoard.disableContextInput();
            Tools.board.resize(innerWidth, innerHeight);
            chessBoard.view.handleResize();
            DEBUG && console.log('ChessBoard.oncreate.then');
        });
    },
    onbeforeremove () {
        return chessBoard.destroy().then( () => {
            chessBoard = undefined;
            DEBUG && console.log('chessboard.destroyed');
        });
    },
    view (  ) {
        DEBUG && console.log('ChessBoard.view.cbgb', !!chessBoard, !!game, !!board);
        return m('div.chessboard');
    },
    onupdate ( vnode ) {
        if (!chessBoard) {
            // eslint-disable-next-line no-debugger
            debugger;

        } else {
            game  = vnode.attrs.game;
            board = vnode.attrs.board;
            controller = vnode.attrs.controller;
            chessBoard.disableMoveInput();

            try {
                // svg may be not yet loaded
                chessBoard.view.handleResize();
            } catch(e){DEBUG && console.log('ChessBoard.onupdate.handleResize', e);}

            (chessBoard.getOrientation() !== board.orientation) && chessBoard.setOrientation(board.orientation);
            // Tools.board.resize(innerWidth, innerHeight);
            DEBUG && console.log('ChessBoard.onupdate.cbgb', !!chessBoard, !!game, !!board);
        }

    },
    onafterupdates () {

        if (chessBoard && game && board) {
            chessBoard
                .setPosition(board.fen, true)
                .then( () => {
                    controller.update(chessBoard);
                    DEBUG && console.log('ChessBoard.onafterupdates.then', chessBoard.getPosition());
                })
            ;

        } else {
            DEBUG && console.warn('ChessBoard.onafterupdates.cbgb', !!chessBoard, !!game, !!board);

        }

    },

});

export default ChessBoard;
