
import { Chessboard } from '../../../extern/cm-chessboard/Chessboard';
import { $$ }         from '../../services/helper';
import Factory        from '../../components/factory';
import Config         from '../../data/config';
import Tools          from '../../tools/tools';

const DEBUG = true;

let chessBoard;

const   ChessBoard = Factory.create('ChessBoard', {

    onresize : Tools.Board.resize,

    oncreate ( vnode ) {

        const { board } = vnode.attrs;

        chessBoard = new Chessboard(
            $$('div.chessboard'), // try vnode.dom
            Config.board.config,
        );
        chessBoard.initialization.then( () => {
            chessBoard.disableContextInput();
            Tools.Board.resize(innerWidth, innerHeight);
            chessBoard.view.handleResize();
            chessBoard.setOrientation(board.orientation);
        });

    },
    view (  ) {
        return m('div.chessboard');
    },
    onupdate ( vnode ) {

        const { board, controller } = vnode.attrs;

        controller.stopListening(chessBoard);
        chessBoard.view.handleResize();
        chessBoard.setOrientation(board.orientation);

        // DEBUG && console.log('ChessBoard.onupdate.out', !!chessBoard,  !!board, vnode);

    },
    onafterupdates (vnode) {

        // DEBUG && console.log('ChessBoard.onafterupdates.in', vnode);
        const { board, controller } = vnode.attrs;

        chessBoard
            .setPosition(board.fen, true)
            .then( () => {
                controller.onafterupdates(chessBoard);
            })
        ;

    },

    onbeforeremove ( vnode ) {

        const { controller } = vnode.attrs;
        const $chessboard = $$('div.chessboard'); // vnode.dom

        $chessboard.removeEventListener('mousedown', controller.listener.onmousedown);
        $chessboard.removeEventListener('touchdown', controller.listener.ontouchdown);

        return chessBoard.destroy().then( () => {
            chessBoard = undefined;
            DEBUG && console.log('chessboard.destroyed');
        });

    },

});

export default ChessBoard;
