
import { Chessboard } from '../../../extern/cm-chessboard/Chessboard';
import { $$ }         from '../../services/helper';
import Factory        from '../../components/factory';
import Config         from '../../data/config';
import Tools          from '../../tools/tools';

const DEBUG = false;

let chessBoard, board, controller;

const ChessBoard = Factory.create('ChessBoard', {
    onresize : Tools.Board.resize,
    oncreate ( vnode ) {

        board      = vnode.attrs.board;
        controller = vnode.attrs.controller;

        chessBoard = new Chessboard(
            $$('div.chessboard'),
            Config.board.config,
        );
        chessBoard.initialization.then( () => {
            chessBoard.disableContextInput();
            Tools.Board.resize(innerWidth, innerHeight);
            chessBoard.view.handleResize();
            chessBoard.setOrientation(board.orientation);
            DEBUG && console.log('ChessBoard.oncreate.then');
        });
    },
    view (  ) {
        return m('div.chessboard');
    },
    onupdate ( vnode ) {

        board      = vnode.attrs.board;
        controller = vnode.attrs.controller;

        controller.stopListening(chessBoard);

        try {
            // svg may be not yet loaded
            chessBoard.view.handleResize();
        } catch(e){DEBUG && console.log('ChessBoard.onupdate.handleResize', e);}

        chessBoard.setOrientation(board.orientation);

        DEBUG && console.log('ChessBoard.onupdate.cbgb', !!chessBoard,  !!board);

    },
    onafterupdates () {

        chessBoard
            .setPosition(board.fen, true)
            .then( () => {
                controller.onafterupdates(chessBoard);
            })
        ;

    },

    onbeforeremove () {

        $$('div.chessboard').removeEventListener('mousedown', controller.listener.onmousedown);
        $$('div.chessboard').removeEventListener('touchdown', controller.listener.ontouchdown);

        return chessBoard.destroy().then( () => {
            chessBoard = undefined;
            DEBUG && console.log('chessboard.destroyed');
        });

    },

});

export default ChessBoard;
