
import { Chessboard } from '../../../extern/cm-chessboard/Chessboard';
import { $$ }         from '../../services/helper';
import Factory        from '../../components/factory';
import Config         from '../../data/config';
import Tools          from '../../tools/tools';

const DEBUG = false;

let chessBoard, board, game, controller;

const ChessBoard = Factory.create('ChessBoard', {
    onresize : Tools.Board.resize,
    oncreate ( vnode ) {

        game  = vnode.attrs.game;
        board = vnode.attrs.board;
        controller = vnode.attrs.controller;
        // $$('div.chessboard').addEventListener('click', controller.onfield.bind(controller));
        // $$('div.chessboard').addEventListener('touchdown', controller.onfield.bind(controller));

        chessBoard = new Chessboard(
            $$('div.chessboard'),
            Config.board.config,
        );
        chessBoard.initialization.then( () => {
            chessBoard.disableContextInput();
            Tools.Board.resize(innerWidth, innerHeight);
            chessBoard.view.handleResize();
            DEBUG && console.log('ChessBoard.oncreate.then');
        });
    },
    onbeforeremove () {

        $$('div.chessboard').removeEventListener('mousedown', controller.onfield);
        $$('div.chessboard').removeEventListener('touchdown', controller.onfield);

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
            controller.disableInput();

            try {
                // svg may be not yet loaded
                chessBoard.view.handleResize();
            } catch(e){DEBUG && console.log('ChessBoard.onupdate.handleResize', e);}

            (chessBoard.getOrientation() !== board.orientation) && chessBoard.setOrientation(board.orientation);
            DEBUG && console.log('ChessBoard.onupdate.cbgb', !!chessBoard, !!game, !!board);
        }

    },
    onafterupdates () {

        if (chessBoard && game && board) {
            chessBoard
                .setPosition(board.fen, true)
                .then( () => {
                    controller.onmovefinished(chessBoard);
                    controller.enableInput();
                // }).then( () => {
                //     setTimeout( () => {
                //         console.log('huhu');
                //     });
                })
            ;

        } else {
            DEBUG && console.warn('ChessBoard.onafterupdates.cbgb', !!chessBoard, !!game, !!board);

        }

    },

});

export default ChessBoard;
