
import { INPUT_EVENT_TYPE } from '../../../extern/cm-chessboard/Chessboard';
import Tools        from '../../tools/tools';

const InputController = function( controller ) {

    const { chess, game, onmove } = controller;

    return function inputHandler(event) {

        let move, result;

        // console.log('event', event);
        switch (event.type) {
        case INPUT_EVENT_TYPE.moveStart:
            game.moveStart = event.square;
            // Tools.updateArrows(chess, chessBoard, state);
            return true;

        case INPUT_EVENT_TYPE.moveDone:

            // isValid (chess, move) {
            //     const chess1 = new Chess();
            //     chess1.load(chess.fen());
            //     const result = chess1.move(move);
            //     return result ? chess1.fen() : '';
            // },

            game.moveStart = '';
            move   = {from: event.squareFrom, to: event.squareTo};
            result = Tools.isValid(chess, move);

            if (Tools.isValid(chess, move)) {
                // board.move([move]);
                onmove(move);
            } else {
                console.log('illegal: ', move, result);
            }

            return !!result;

        case INPUT_EVENT_TYPE.moveCanceled:
            game.moveStart = '';
        }

    };

};

export default InputController;