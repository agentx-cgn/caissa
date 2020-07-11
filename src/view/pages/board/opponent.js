
import Chess           from 'chess.js';
// import Caissa          from '../../caissa';
// import Config          from '../../data/config';
// import DB              from '../../services/database';
// import { H, $$ }       from '../../services/helper';
import Tools           from '../../tools/tools';

import { INPUT_EVENT_TYPE } from '../../../extern/cm-chessboard/Chessboard';

const DEBUG = true;

class Opponent {
    constructor(color, mode) {
        this.color = color; // w, b, n
        this.mode  = mode;  // x, h, s,
        DEBUG && console.log('Opponent.create', {color: this.color, mode: this.mode});
    }
    update (controller) {
        this.controller = controller;
        this.fen        = Tools.Games.fen(controller.game);
        this.chess      = new Chess();
        !this.chess.load(this.fen) && console.warn('Opponent.update.load.failed', this.fen);
    }
    dragHandler(event) {

        // DEBUG && console.log('dragHandler.event', this.color, event.type);

        let move, result;
        switch (event.type) {
        case INPUT_EVENT_TYPE.moveStart:
            this.controller.listener.onmovestart(event.square);
            return true;

        case INPUT_EVENT_TYPE.moveDone:

            move   = { from: event.squareFrom, to: event.squareTo };
            result = this.chess.move(move);

            if (result) {
                // DEBUG && console.log('dragHandler.legal: ',  this.color,  move, result);
                const fullmove = this.chess.history({verbose: true}).slice(-1)[0];
                const pgn = this.chess.pgn().trim();
                fullmove.fen = this.chess.fen();
                this.controller.listener.onmovedone(fullmove, pgn);

            } else {
                // DEBUG && console.log(this.chess.ascii());
                DEBUG && console.warn('Opponent.illegal.move: ', this.color, move, result);
            }

            return !!result;

        case INPUT_EVENT_TYPE.moveCanceled:
            this.controller.listener.onmovecancel();
        }

    }

}

export default Opponent;
