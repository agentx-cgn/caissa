
import Chess  from 'chess.js';
import { H }  from '../../services/helper';
import Tools  from '../../tools/tools';
import Pool   from '../../services/engine/pool';

import { INPUT_EVENT_TYPE } from '../../../extern/cm-chessboard/Chessboard';

const DEBUG = true;

class Opponent {
    constructor(color, mode) {

        this.color = color; // w, b, n
        this.mode  = mode;  // x, h, s,

        if (this.mode === 's'){

            this.slot = Pool.request(1)[0];
            this.slot.engine.init()
                .then( engine => {
                    return engine.isready();
                })
                .then( engine => {
                    return engine.ucinewgame();
                })
                .then( engine => {
                    this.engine = engine;
                    this.slot.name   = this.color;
                    console.log('Opponent.engine', this.color, this.mode, this.engine);
                })
            ;

        }
        DEBUG && console.log('Opponent.create', {color: this.color, mode: this.mode});
    }
    destroy () {
        if (this.slot) {
            this.slot.idle = true;
            this.slot.name = '';
        }
        DEBUG && console.log('Opponent.destroy', {color: this.color, mode: this.mode});
    }
    update (controller) {
        this.controller = controller;
        this.fen        = Tools.Games.fen(controller.game);
        this.chess      = new Chess();
        !this.chess.load(this.fen) && console.warn('Opponent.update.load.failed', this.fen);
    }
    pause () {

    }
    async domove (chessBoard) {

        if (this.mode === 's'){

            await H.sleep(1000);
            await this.engine.position(this.fen);

            const answer   = await this.engine.go({depth: 4});
            const bestmove = answer.bestmove;

            return bestmove;


        } else if (this.mode === 'x'){

            return new Promise(resolve => {

                let move, result;

                const dragHandler = (event) => {
                    switch (event.type) {
                    case INPUT_EVENT_TYPE.moveDone:

                        move   = { from: event.squareFrom, to: event.squareTo };
                        result = this.chess.move(move);

                        if (result) {
                            resolve(move);

                        } else {
                            DEBUG && console.log(this.chess.ascii());
                            DEBUG && console.warn('Opponent.illegal.move: ', this.color, move, result);
                        }
                        return !!result;
                    case INPUT_EVENT_TYPE.moveStart:
                            // this.controller.listener.onmovestart(event.square);
                        return true;
                    case INPUT_EVENT_TYPE.moveCanceled:
                        // this.controller.listener.onmovecancel();
                        return true;
                    }
                };

                chessBoard.enableMoveInput(dragHandler, this.color);

            });

        }

    }
    // dragHandler(event) {

    //     // DEBUG && console.log('dragHandler.event', this.color, event.type);

    //     let move, result;
    //     switch (event.type) {
    //     case INPUT_EVENT_TYPE.moveStart:
    //         this.controller.listener.onmovestart(event.square);
    //         return true;

    //     case INPUT_EVENT_TYPE.moveDone:

    //         move   = { from: event.squareFrom, to: event.squareTo };
    //         result = this.chess.move(move);

    //         if (result) {
    //             // DEBUG && console.log('dragHandler.legal: ',  this.color,  move, result);
    //             const fullmove = this.chess.history({verbose: true}).slice(-1)[0];
    //             const pgn = this.chess.pgn().trim();
    //             fullmove.fen = this.chess.fen();
    //             this.controller.listener.onmovedone(fullmove, pgn);

    //         } else {
    //             // DEBUG && console.log(this.chess.ascii());
    //             DEBUG && console.warn('Opponent.illegal.move: ', this.color, move, result);
    //         }

    //         return !!result;

    //     case INPUT_EVENT_TYPE.moveCanceled:
    //         this.controller.listener.onmovecancel();
    //     }

    // }

}

export default Opponent;
