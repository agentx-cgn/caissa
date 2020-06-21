
import Chess           from 'chess.js';
import { COLOR }       from '../../../extern/cm-chessboard/Chessboard';
import Tools           from '../../tools/tools';
import InputController from './input-controller';

// basic controller, only controls decoration, buttons and flags
class BoardController {

    constructor (game, board) {

        this.mode      = game.mode;
        this.game      = game;
        this.board     = board;
        this.chess     = new Chess();
        this.turn      = game.turn;
        this.isRunning = false;
        this.update();
    }
    update () {
        this.turn  = this.game.turn;
        this.chess.load(Tools.board.game2fen(this.game));
        this.updateFlags();
        this.updateButtons();
        this.updateDecoration();
        this.chess.load(Tools.board.game2fen(this.game));
    }
    listen (chessBoard) {
        if (this.game.mode !== 'h-h' && this.game.mode !== 's-s' && this.isRunning){
            chessBoard.enableMoveInput(InputController(this));
        }
    }
    onmove (move) {
        // {from: event.squareFrom, to: event.squareTo}
        // update game with move
        // redirect to new turn
        console.log(move);
    }
    updateFlags () {
        const flags = this.game.flags;
        const chess = this.chess;
        flags.turn  = this.turn === -2 ? null : chess.turn();
        flags.over  = chess.game_over();
        flags.chck  = chess.in_check();
        flags.mate  = chess.in_checkmate();
        flags.draw  = chess.in_draw();
        flags.stal  = chess.in_stalemate();
        flags.insu  = chess.insufficient_material();
        flags.repe  = chess.in_threefold_repetition();
        console.log('updateFlags.turn', flags.turn);

    }
    updateButtons () {
        const btn = this.game.buttons;
        const canplay  = !this.isRunning && this.mode !== 'h-h';
        const canpause = this.isRunning  && this.mode !== 'h-h';
        btn.rotate =   true;
        btn.backward = this.turn > 0;
        btn.forward =  this.turn < this.game.moves.length -1;
        btn.left =     this.turn > -2;
        btn.right =    this.turn < this.game.moves.length -1;
        btn.play =     canplay;
        btn.pause =    canpause;
        btn.evaluate = this.game.moves.length > 0 && !this.isRunning;
    }
    updateDecoration () {

    }

}

export default BoardController;
