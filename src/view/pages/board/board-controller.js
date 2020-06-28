
import Chess           from 'chess.js';
import Caissa          from '../../caissa';
import Config          from '../../data/config';
import DB              from '../../services/database';
import { H }           from '../../services/helper';
import Tools           from '../../tools/tools';

import { MARKER_TYPE, INPUT_EVENT_TYPE } from '../../../extern/cm-chessboard/Chessboard';

// basic controller, only controls decoration, buttons and flags
// moveInputMode: MOVE_INPUT_MODE.viewOnly,
// set to MOVE_INPUT_MODE.dragPiece or MOVE_INPUT_MODE.dragMarker for interactive movement

const DEBUG = true;

class Opponent {
    constructor(color, mode) {
        this.color = color; // w, b, n
        this.mode  = mode;  // x, h, s,
    }
    update (controller) {
        this.fen          = Tools.Games.fen(controller.game);
        this.chess        = new Chess();
        !this.chess.load(this.fen) && console.warn('Opponent.update.load.failed', this.fen);
    }
    tomove (controller) {
        this.update(controller);
        this.movedone     = controller.onmovedone.bind(controller);
        this.movestart    = controller.onmovestart.bind(controller);
        this.movecancel   = controller.onmovecancel.bind(controller);
        DEBUG && console.log('Opponent.tomove', {color: this.color, mode: this.mode});
    }
    towait (controller) {
        this.update(controller);
        DEBUG && console.log('Opponent.towait', {color: this.color, mode: this.mode});
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
                const fullmove = this.chess.history({verbose: true}).slice(-1)[0];
                const pgn = this.chess.pgn().trim();
                fullmove.fen = this.chess.fen();
                this.movedone(fullmove, pgn);

            } else {
                DEBUG && console.log(this.chess.ascii());
                DEBUG && console.log('Opponent.illegal.move: ', this.color, move, result);
            }

            return !!result;

        case INPUT_EVENT_TYPE.moveCanceled:
            this.movecancel();
        }

    }

}

class BoardController {

    constructor (game, board) {

        this.mode        = game.mode;
        this.uuid        = game.uuid;
        this.game        = game;
        this.board       = board;
        this.mode        = game.mode;
        this.chess       = new Chess();
        this.squareMoves = [];
        this.validMoves  = [];
        this.opponents   = {
            'w': new Opponent('w', this.mode[0]),
            'b': new Opponent('b', this.mode[0]),
            'n': { tomove: () => {}, towait: () => {} },
        };
        this.update();
    }
    // also called from board.view after new turn, and chessboard.onafterupdates
    update (chessBoard) {

        this.turn  = ~~this.game.turn;
        this.fen   = Tools.Games.fen(this.game);
        !this.chess.load(this.fen) && console.warn('BoardController.update.load.failed', this.fen);

        this.color      = this.chess.turn();
        this.lastMove   = this.game.moves.slice(-1)[0];
        this.validMoves = this.chess.moves({verbose: true});

        DEBUG && console.log('BoardController.update', {uuid: this.uuid, turn: this.turn}, 'validmoves', this.validMoves.length);

        this.tomove = (
            this.turn === -2 ? 'n' :
            this.turn  %   2 ? 'w' : 'b'
        );
        this.towait = (
            this.turn === -2 ? 'n' :
            this.turn  %   2 ? 'b' : 'w'
        );

        this.updateFlags();
        this.updateButtons();

        if (chessBoard){
            this.chessBoard = chessBoard;
            this.updateIllustration();
            this.listen();
        }

    }
    listen () {
        if (this.turn !== -2){

            const oppToMove = this.opponents[this.tomove];
            const oppToWait = this.opponents[this.towait];

            if (this.mode === 'x-x'){
                const dragHandler = oppToMove.dragHandler.bind(oppToMove);
                this.chessBoard.enableMoveInput(dragHandler, this.color);
            }

            oppToMove.tomove(this);
            oppToWait.towait(this);

            console.log('BoardController', 'towait:', this.towait, 'tomove:', this.tomove);

            // throw('Gotcha');
        }
    }
    step (turn) {
        DB.Games.update(this.game.uuid, { turn });
        Caissa.route('/game/:turn/:uuid/', { turn, uuid: this.game.uuid }, { replace: true });
    }
    // user clicks/touches board
    onfield (e) {
        const idx    = e.target.dataset.index;
        const square = Tools.Board.squareIndexToField(idx);
        const piece  = this.chessBoard.getPiece(square);
        this.squareMoves = this.validMoves.filter( m => m.from === square || m.to === square );
        DEBUG && console.log('Controller.onfield', idx, square, piece);
        this.updateIllustration();
    }
    onmovecancel () {
        DEBUG && console.log('BoardController.onmovecancel');
    }
    onmovedone ( move, pgn ) {

        this.chess.move(move);

        // if first move of default, create new game + board and reroute to
        if (this.game.uuid === 'default'){
            const timestamp = Date.now();
            const uuid = H.hash(String(timestamp));
            const game = H.create(this.game, {
                uuid,
                mode:   'x-x',
                turn :  0,
                pgn,
                timestamp,
            });
            Tools.Games.updateMoves(game);
            DB.Games.create(game, true);
            DB.Boards.create(H.clone(Config.templates.board, { uuid }));
            Caissa.route('/game/:turn/:uuid/', {turn: game.turn, uuid: game.uuid});

        // update move with turn, game with move and reroute to next turn
        } else {
            move.turn = this.turn +1;
            this.game.moves.push(move);
            this.game.turn = move.turn;
            DB.Games.update(this.game.uuid, this.game, true);
            Caissa.route('/game/:turn/:uuid/', {turn: this.game.turn, uuid: this.game.uuid}, {replace: true});

        }

        DEBUG && console.log('BoardController.onmovedone', move);
    }
    onmovestart ( square ) {
        const piece  = this.chessBoard.getPiece(square);
        DEBUG && console.log('onmovestart', piece, square);
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
        // DEBUG && console.log('BoardController.updateFlags.turn', flags.turn);

    }
    updateButtons () {
        const btn       = this.board.buttons;
        const canplay   = !this.isRunning && this.mode !== 'h-h' && this.mode !== 'x-x';
        const canpause  =  this.isRunning && this.mode !== 'h-h' && this.mode !== 'x-x';
        btn.rotate      = true;
        btn.backward    = this.turn > 0;
        btn.forward     = this.turn < this.game.moves.length -1;
        btn.left        = this.turn > -2;
        btn.right       = this.turn < this.game.moves.length -1;
        btn.play        = canplay;
        btn.pause       = canpause;
        btn.evaluate    = this.game.moves.length > 0 && !this.isRunning;
        //TODO: When is a game terminated?
        // DEBUG && console.log('BoardController.updateButtons', 'btn.play', btn.play);
    }
    updateIllustration () {
        // chessboard on page w/ dn has height 0
        if (this.chessBoard && this.chessBoard.view.height && this.game.turn !== -2){
            this.updateArrows();
            this.updateMarker();
        }
    }
    updateArrows () {

        this.chessBoard.removeArrows( null );

        if (this.board.illustrations.valid){
            this.squareMoves.forEach( move => {
                this.chessBoard.addArrow(move.from, move.to, {class: 'arrow validmove'});
            });
        }

        if (this.board.illustrations.last){
            const m = this.lastMove;
            this.chessBoard.addArrow(m.from, m.to, {class: m.color === 'w' ? 'arrow last-white' : 'arrow last-black'});
        }

        if (this.board.illustrations.test){
            this.chessBoard.addArrow('e2', 'e4', {class: 'arrow test'} );
            this.chessBoard.addArrow('f2', 'h4', {class: 'arrow test'} );
            this.chessBoard.addArrow('d2', 'c4', {class: 'arrow test'} );
            this.chessBoard.addArrow('c2', 'a3', {class: 'arrow test'} );
            this.chessBoard.addArrow('d7', 'd5', {class: 'arrow test'} );
            this.chessBoard.addArrow('c7', 'c5', {class: 'arrow test'} );

            this.chessBoard.addArrow('g7', 'g8', {class: 'arrow test'} );
            this.chessBoard.addArrow('g7', 'h8', {class: 'arrow test'} );
            this.chessBoard.addArrow('g7', 'h7', {class: 'arrow test'} );
            this.chessBoard.addArrow('g7', 'h6', {class: 'arrow test'} );
            this.chessBoard.addArrow('g7', 'g6', {class: 'arrow test'} );
            this.chessBoard.addArrow('g7', 'f6', {class: 'arrow test'} );
            this.chessBoard.addArrow('g7', 'f7', {class: 'arrow test'} );
            this.chessBoard.addArrow('g7', 'f8', {class: 'arrow test'} );
        }

    }
    updateMarker () {

        // const validSquares = this.chess.moves({verbose: true});
        const markerType   = this.color === 'w' ? MARKER_TYPE.rectwhite : MARKER_TYPE.rectblack;

        this.chessBoard.removeMarkers( null, null);

        if (this.board.illustrations.attack){
            this.validMoves.forEach( square => {
                this.chessBoard.addMarker(square.to, markerType);
            });
        }

        // DEBUG && console.log('BoardController.updateMarker');

    }

}

        // chess.put({ type: chess.PAWN, color: chess.BLACK }, 'a5')
        // chess.put({ type: 'k', color: 'w' }, 'h1')
        // chess.remove('h1')

        // if (action === 'add') {
        //     const type = piece[1], color = piece[0];
        //     chess.put({ type, color}, field);
        //     chessBoard.setPosition(chess.fen(), true);

export default BoardController;
