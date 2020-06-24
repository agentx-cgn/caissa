
import Chess           from 'chess.js';
import Caissa          from '../../caissa';
import { H }           from '../../services/helper';
// import { COLOR }       from '../../../extern/cm-chessboard/Chessboard';
// import { MARKER_TYPE } from '../../../extern/cm-chessboard/Chessboard';
import { INPUT_EVENT_TYPE } from '../../../extern/cm-chessboard/Chessboard';

import Tools           from '../../tools/tools';
import DB from '../../services/database';

// basic controller, only controls decoration, buttons and flags
// moveInputMode: MOVE_INPUT_MODE.viewOnly,
// set to MOVE_INPUT_MODE.dragPiece or MOVE_INPUT_MODE.dragMarker for interactive movement

const DEBUG = true;

class Opponent {
    constructor(color, mode) {
        this.color = color;
        this.mode  = mode;
    }
    tomove (chessBoard, onmovedone, onmovestart, onmovecancel ) {
        this.chessBoard   = chessBoard;
        this.movedone     = onmovedone;
        this.movestart    = onmovestart;
        this.movecancel   = onmovecancel;
        this.fen          = chessBoard.getPosition();
        this.chess        = new Chess();
        this.chess.load(this.fen) && console.warn(this.fen);
        this.chessBoard.enableMoveInput(this.dragHandler.bind(this), this.color);
        // DEBUG && console.log('Opponent.tomove', this.color, this.fen);
    }
    towait () {

    }
    dragHandler(event) {

        // DEBUG && console.log('dragHandler.event', this.color, event.type);

        let move, result;
        switch (event.type) {
        case INPUT_EVENT_TYPE.moveStart:

            this.movestart(event.square);
            return true;

        case INPUT_EVENT_TYPE.moveDone:

            move   = { from: event.squareFrom, to: event.squareTo };
            result = this.chess.move(move);

            if (result) {
                // DEBUG && console.log('dragHandler.legal: ',  this.color,  move, result);
                this.movedone(move);
            } else {
                console.log(this.chess.ascii());
                DEBUG && console.log('Opponent.illegal: ', this.color, move, result);
            }

            return !!result;

        case INPUT_EVENT_TYPE.moveCanceled:
            this.movecancel();
        }

    }

}

class BoardController {

    constructor (game, board) {

        this.mode      = game.mode;
        this.game      = game;
        this.board     = board;
        this.mode      = game.mode;
        this.chess     = new Chess();
        this.turn      = game.turn;
        // this.isRunning = false;
        this.opponents = {
            'w': new Opponent('w', this.mode[0]),
            'b': new Opponent('b', this.mode[0]),
            'n': { tomove: () => {}, towait: () => {} },
        };
        this.update();
    }
    update (chessBoard) {

        this.turn  = this.game.turn;
        this.fen   = Tools.board.game2fen(this.game);
        this.chess.load(this.fen);
        this.tomove = (
            this.turn === -2 ? 'n' :
            this.turn  %   2 ? 'w' : 'b'
        );
        this.towait = (
            this.turn === -2 ? 'n' :
            this.turn  %   2 ? 'b' : 'w'
        );

        if (chessBoard){
            this.chessBoard = chessBoard;
            this.updateFlags();
            this.updateButtons();
            this.updateMarker();
            this.listen();
        }

    }
    listen () {
        if (this.turn !== -2){
            this.opponents[this.tomove].tomove(
                this.chessBoard,
                this.onmovedone.bind(this),
                this.onmovestart.bind(this),
                this.onmovecancel.bind(this),
            );
            this.opponents[this.towait].towait(this.chessBoard);
        }
    }
    onmovecancel () {
        DEBUG && console.log('onmovecancel');
    }
    onmovedone ( move ) {

        // check for first move of default
        if (this.game.uuid === 'default'){
            this.chess.move(move);
            const pgn = this.chess.pgn().trim();
            const timestamp = Date.now();
            const game = H.create(this.game, {
                uuid:   H.hash(String(timestamp)),
                mode:   'x-x',
                turn :  0,
                moves : Tools.games.pgn2moves(pgn),
                pgn,
                timestamp,
            });
            DB.Games.create(game, true);
            Caissa.route('/game/:turn/:uuid/', {turn: game.turn, uuid: game.uuid});

        }

        DEBUG && console.log('onmovedone', move);
    }
    onmovestart ( square ) {
        DEBUG && console.log('onmovestart', square);
    }
    updateFlags () {
        const flags = this.board.flags;
        const chess = this.chess;
        flags.turn  = this.turn === -2 ? null : chess.turn();
        flags.over  = chess.game_over();
        flags.chck  = chess.in_check();
        flags.mate  = chess.in_checkmate();
        flags.draw  = chess.in_draw();
        flags.stal  = chess.in_stalemate();
        flags.insu  = chess.insufficient_material();
        flags.repe  = chess.in_threefold_repetition();
        DEBUG && console.log('updateFlags.turn', flags.turn);

    }
    updateButtons () {
        const btn       = this.board.buttons;
        const canplay   = !this.isRunning && this.mode !== 'h-h';
        const canpause  =  this.isRunning && this.mode !== 'h-h';
        btn.rotate      = true;
        btn.backward    = this.turn > 0;
        btn.forward     = this.turn < this.game.moves.length -1;
        btn.left        = this.turn > -2;
        btn.right       = this.turn < this.game.moves.length -1;
        btn.play        = canplay;
        btn.pause       = canpause;
        btn.evaluate    = this.game.moves.length > 0 && !this.isRunning;
    }
    updateDecoration () {

    }
    updateMarker () {

        // const validSquares = this.chess.moves({verbose: true});
        // const markerType   = this.turn === 'w' ? MARKER_TYPE.rectwhite : MARKER_TYPE.rectblack;

        this.chessBoard.removeMarkers( null, null);

        // if (state.illustrations.marker.attack){
        //     validSquares.forEach( square => {
        //         chessBoard.addMarker(square.to, markerType);
        //     });
        // }

    }

}

export default BoardController;
