
import { Chessboard } from '../../../extern/cm-chessboard/Chessboard';
import { $$ }         from '../../services/helper';
import Factory        from '../../components/factory';
import Config         from '../../data/config';
import Tools          from '../../tools/tools';

const DEBUG = true;

let chessBoard, board, game, controller;

const ChessBoard = Factory.create('ChessBoard', {
    onresize : Tools.board.resize,
    oncreate () {
        chessBoard = new Chessboard(
            $$('div.chessboard'),
            Config.board.config,
        );
        chessBoard.disableContextInput();
        Tools.board.resize(innerWidth, innerHeight);
        try {
            // svg may be not yet loaded
            chessBoard.view.handleResize();
        } catch(e){DEBUG && console.log('chessBoard.oncreate.handleResize', e);}
        DEBUG && console.log('chessboard.oncreate');
    },
    onbeforeremove () {
        return chessBoard.destroy().then( () => {
            chessBoard = undefined;
            DEBUG && console.log('chessboard.destroyed');
        });
    },
    view ( vnode ) {

        game  = vnode.attrs.game;
        board = vnode.attrs.board;
        controller = vnode.attrs.controller;

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
            controller = vnode.attrs.controller;
            chessBoard.disableMoveInput();

            try {
                // svg may be not yet loaded
                chessBoard.view.handleResize();
            } catch(e){DEBUG && console.log('chessBoard.onupdate.handleResize', e);}

            (chessBoard.getOrientation() !== board.orientation) && chessBoard.setOrientation(board.orientation);
            // Tools.board.resize(innerWidth, innerHeight);
            DEBUG && console.log('chessboard.onupdate.cbgb', !!chessBoard, !!game, !!board);
        }

    },
    onafterupdates () {

        if (chessBoard && game && board) {
            DEBUG && console.log('chessboard.onafterupdates', board.fen);
            chessBoard
                .setPosition(board.fen, true)
                .then( () => {
                    controller.listen(chessBoard);
                })
            ;

        } else {
            DEBUG && console.warn('chessboard.onafterupdates.cbgb', !!chessBoard, !!game, !!board);

        }

    },

});

export default ChessBoard;
