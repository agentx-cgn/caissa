
import Chess           from 'chess.js';
import Caissa          from '../../caissa';
import Config          from '../../data/config';
import DB              from '../../services/database';
import { H }           from '../../services/helper';
import Tools           from '../../tools/tools';
import ChessClock      from '../../components/chessclock';

import { MARKER_TYPE, INPUT_EVENT_TYPE } from '../../../extern/cm-chessboard/Chessboard';

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
        this.clock       = ChessClock;

        this.squareMoves    = []; // all moves from or to selected square
        this.validMoves     = []; // these are all possible moves, for current color
        this.selectedSquare = '';
        this.selectedPiece  = '';

        this.illustrations  = DB.Options.first['board-illustrations'];
        this.opponents      = {
            'w': new Opponent('w', this.mode[0]),
            'b': new Opponent('b', this.mode[0]),
            'n': { tomove: () => {}, towait: () => {} },
        };
        this.update();
    }

    // also called from board.view after new turn, and chessboard.onafterupdates

    update () {

        this.turn  = ~~this.game.turn;
        this.fen   = Tools.Games.fen(this.game);
        !this.chess.load(this.fen) && console.warn('BoardController.update.load.failed', this.fen);

        this.color  = this.chess.turn();
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

        DEBUG && console.log('BoardController.update.out', {uuid: this.uuid, turn: this.turn, color: this.color});

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

        const btns      = this.board.buttons;
        const lastTurn  = this.game.moves.length -1;
        const canplay   = (
            this.mode !== 'h-h' && this.mode !== 'x-x' &&
            (!this.clock.isTicking() || this.clock.isPaused())
        );
        const canpause  = (
            this.mode !== 'h-h' && this.mode !== 'x-x' &&
            this.clock.isTicking()
        );

        btns.backward    = this.turn > 0;
        btns.left        = this.turn > -2;
        btns.right       = this.turn < lastTurn;
        btns.forward     = this.turn < lastTurn;
        btns.play        = canplay;
        btns.pause       = canpause;
        btns.rotate      = true;
        btns.evaluate    = lastTurn > 0 && !this.isRunning;

        DB.Boards.update(this.board.uuid, { buttons: btns }, true);
        //TODO: When is a game terminated?
        true && console.log('BoardController.updateButtons', 'btn.play', btns.play);
    }

    // Button Actions
    play () {
        if (this.clock.isPaused()) {
            this.clock.continue();
        } else {
            this.clock.start(this.game.clock);
        }
        Caissa.redraw();
    }
    pause () {
        this.clock.pause();
        Caissa.redraw();
    }
    step (turn) {
        DB.Games.update(this.game.uuid, { turn });
        Caissa.route('/game/:turn/:uuid/', { turn, uuid: this.game.uuid }, { replace: true });
    }


    disableInput () {
        this.chessBoard.disableMoveInput();
    }
    enableInput () {

        if (this.turn !== -2){

            const oppToMove = this.opponents[this.tomove];
            const oppToWait = this.opponents[this.towait];

            if (this.mode === 'x-x'){
                const dragHandler = oppToMove.dragHandler.bind(oppToMove);
                this.chessBoard.enableMoveInput(dragHandler, this.color);
            }

            oppToMove.tomove(this);
            oppToWait.towait(this);

            true && console.log('BoardController.enableInput.out', { towait: this.towait, tomove: this.tomove });

        }
    }

    // user clicks/touches board
    onfield (e) {

        const idx           = e.target.dataset.index;
        const square        = Tools.Board.squareIndexToField(idx);
        this.selectedSquare = square !== this.selectedSquare ? square : '';
        this.selectedPiece  = this.chessBoard.getPiece(this.selectedSquare) || '';
        this.updateIllustration();

        DEBUG && console.log('BoardController.onfield.out', {
            idx, square: this.selectedSquare, piece: this.selectedPiece,
        });

    }
    onmovestart ( square ) {
        const piece  = this.chessBoard.getPiece(square);
        DEBUG && console.log('onmovestart', piece, square);
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
            if (move.turn < this.game.moves.length) {
                // throw away all moves after this new one
                this.game.moves.splice(this.turn +1);
            }
            this.game.newmove = move;
            this.game.moves.push(move);
            this.game.turn = move.turn;
            DB.Games.update(this.game.uuid, this.game, true);
            Caissa.route('/game/:turn/:uuid/', {turn: this.game.turn, uuid: this.game.uuid}, {replace: true});

        }

        DEBUG && console.log('BoardController.onmovedone', move);
    }

    // comes with setPosition.then in chessboard.js, onafterupdates, with every redraw
    onmovefinished (chessBoard) {

        this.chessBoard = chessBoard;

        if (this.clock.isTicking()){
            if (this.color === 'w'){
                this.clock.whiteclick();
            } else {
                this.clock.blackclick();
            }
        }
        this.updateIllustration();

        DEBUG && console.log('BoardController.onmovefinished.out', chessBoard.getPosition());

    }

    updateIllustration () {

        const squareFilter  = m =>  m.from === this.selectedSquare || m.to === this.selectedSquare ;

        this.illustrations  = DB.Options.first['board-illustrations'];
        this.validMoves     = this.chess.moves({verbose: true});
        this.squareMoves    = this.validMoves.filter(squareFilter);

        DEBUG && console.log('BoardController.updateIllustration', {
            square: this.selectedSquare, piece: this.selectedPiece, color: this.color, turn: this.turn, moves: this.squareMoves.length,
        });

        // chessboard on page w/ dn has height 0
        if (this.chessBoard && this.chessBoard.view.height && this.game.turn !== -2){

            this.chessBoard.removeArrows( null );
            this.chessBoard.removeMarkers( null, null);
            this.updateArrows();
            this.updateMarker();

        }
    }
    updateArrows () {

        const illus = this.illustrations;

        // if (arrows.bestmoves){
        //     const bm = state.bestmove.move;
        //     const po = state.bestmove.ponder;
        //     if (bm.from && po.from){
        //         chessBoard.addArrow(po.from, po.to, {class: 'arrow ponder'});
        //         chessBoard.addArrow(bm.from, bm.to, {class: 'arrow bestmove', onclick: function () {
        //             fire('board', 'move', [[arrows.bestmove.move]]);
        //         }});
        //     }
        // }

        if (illus.heatmap) {
            //
        }

        if (illus.validmoves){
            this.squareMoves.forEach( move => {
                this.chessBoard.addArrow(move.from, move.to, {class: 'arrow validmove'});
            });
        }

        if (illus.lastmove){
            const lm = this.game.moves[this.turn];
            if (lm) {
                this.chessBoard.addArrow(
                    lm.from, lm.to,
                    { class: lm.color === 'w' ? 'arrow lastmove white' : 'arrow lastmove black' },
                );
            }
        }

        if (illus.test){
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

        // marker need to be implemented/referenced in
        // Config.board, MARKER_TYPE and cm-chessboard/chessboard-sprite.svg

        const illus      = this.illustrations;
        const markerType = this.color === 'w' ? MARKER_TYPE.rectwhite : MARKER_TYPE.rectblack;

        if (this.selectedSquare){
            this.chessBoard.addMarker(this.selectedSquare, MARKER_TYPE.selected);
        }

        if (illus.attack){
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
