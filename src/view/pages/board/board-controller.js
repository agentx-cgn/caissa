
import Chess           from 'chess.js';
import { MARKER_TYPE } from '../../../extern/cm-chessboard/Chessboard';
import Caissa          from '../../caissa';
import Config          from '../../data/config';
import DB              from '../../services/database';
import { H, $$ }       from '../../services/helper';
import Tools           from '../../tools/tools';
import ChessClock      from '../../components/chessclock';
import Opponent        from './opponent';

const DEBUG = true;

class BoardController {

    constructor (game, board) {

        this.mode           = game.mode;
        this.uuid           = game.uuid;
        this.game           = game;
        this.board          = board;
        this.mode           = game.mode;
        this.chess          = new Chess();
        this.clock          = ChessClock;
        this.newmove        = '';
        this.selectedSquare = '';
        this.selectedPiece  = '';
        this.squareMoves    = []; // all moves from or to selected square
        this.validMoves     = []; // these are all possible moves, for current color

        this.illustrations  = DB.Options.first['board-illustrations'];
        this.opponents      = {
            'w': new Opponent('w', this.mode[0]),
            'b': new Opponent('b', this.mode[2]),
            'n': { update: () => {}, destroy: () => {} },
        };
        this.listener = {
            onmove:        this.onmove.bind(this),
            onclockover:   this.onclockover.bind(this),
            onfieldselect: this.onfieldselect.bind(this),
        };
        this.update();
    }

    destroy () {
        this.opponents.w && this.opponents.w.destroy();
        this.opponents.b && this.opponents.b.destroy();
        this.opponents.n && this.opponents.n.destroy();
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

        // forget onfield clicks
        this.selectedSquare = '';
        this.selectedPiece  = '';
        this.squareMoves    = [];
        this.validMoves     = [];

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

        // button pairs are tri-state (play/pause, evaluate/spinner)
        // null  => .dn
        // false => .disabled
        // true  => .enabled

        const btns     = this.board.buttons;
        const lastTurn = this.game.moves.length -1;

        // always possible
        btns.rotate = true;

        // default
        btns.play  = false;
        btns.pause = null;

        // game with timecontrol and not empty board
        if ( this.mode !== 'h-h' && this.mode !== 'x-x' && this.turn > -2 ){

            btns.play       = true;
            btns.pause      = null;

            if ( this.clock.isTicking() ) {
                btns.play       = null;
                btns.pause      = true;
            }

        }

        // eval / spinner
        btns.spinner   = null;
        btns.evaluate  = lastTurn > 0 && !this.isRunning;

        // game moves navigation
        btns.backward  = this.turn > 0;
        btns.left      = this.turn > -2;
        btns.right     = this.turn < lastTurn;
        btns.forward   = this.turn < lastTurn;

        DB.Boards.update(this.board.uuid, { buttons: btns }, true);
        //TODO: When is a game terminated?
        true && console.log('BoardController.updateButtons', 'btn.play', btns.play);
    }

    onclockover (whitebudget, blackbudget) {
        console.log('BoardController.onclockover', whitebudget, blackbudget);
        Caissa.redraw();
    }

    // Button Actions
    play () {

        if (this.clock.isPaused()) {
            this.clock.continue();
        } else {
            this.clock.start(this.game.clock, this.listener.onclockover);
        }

        ( async () => {
            this.opponents[this.towait].pause(this.chessBoard);
            const move = await this.opponents[this.tomove].domove(this.chessBoard);
            this.listener.onmove(move);
        })();

        Caissa.redraw();

    }
    pause () {
        this.opponents[this.tomove].pause();
        this.opponents[this.towait].pause();
        this.clock.pause();
        Caissa.redraw();
    }
    step (turn) {
        DB.Games.update(this.game.uuid, { turn });
        Caissa.route('/game/:turn/:uuid/', { turn, uuid: this.game.uuid }, { replace: true });
    }

    // called from board.onupdate
    stopListening (chessBoard) {
        chessBoard.disableMoveInput();
        $$('div.chessboard').removeEventListener('mousedown', this.listener.onfieldselect);
        $$('div.chessboard').removeEventListener('touchstart', this.listener.onfieldselect);
    }
    startListening () {

        if (this.turn !== -2){

            const oppToMove = this.opponents[this.tomove];
            const oppToWait = this.opponents[this.towait];

            oppToMove.update(this);
            oppToWait.update(this);


            $$('div.chessboard').addEventListener('mousedown', this.listener.onfieldselect);
            $$('div.chessboard').addEventListener('touchdown', this.listener.onfieldselect);

            if (this.mode === 'x-x'){
                ( async () => {
                    this.opponents[this.towait].pause(this.chessBoard);
                    const move = await this.opponents[this.tomove].domove(this.chessBoard);
                    this.listener.onmove(move);
                })();
            }

            DEBUG && console.log('BoardController.startListening.out', { mode: this.mode, tomove: this.tomove });

        }

    }

    onfieldselect (e) {

        const idx           = e.target.dataset.index;
        const square        = Tools.Board.squareIndexToField(idx);
        this.selectedSquare = square !== this.selectedSquare ? square : '';
        this.selectedPiece  = this.chessBoard.getPiece(this.selectedSquare) || '';
        this.updateIllustration();

        // DEBUG && console.log('BoardController.onfieldselect.out', {
        //     square: this.selectedSquare, piece: this.selectedPiece,
        // });

    }

    // Opponent sends move
    onmove ( candidate ) {

        const move = this.chess.move(candidate, { sloppy: true });

        if (move) {

            const pgn = this.chess.pgn().trim();
            move.fen  = this.chess.fen();

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
                this.newmove = move;
                this.game.moves.push(move);
                this.game.turn = move.turn;
                DB.Games.update(this.game.uuid, this.game, true);
                Caissa.route('/game/:turn/:uuid/', {turn: this.game.turn, uuid: this.game.uuid}, {replace: true});

            }

        } else {
            console.log(this.chess.ascii());
            console.warn('BoardController.onmove.illegal', candidate);

        }

        DEBUG && console.log('BoardController.onmove.out', candidate);

    }

    // comes with with every redraw
    onafterupdates (chessBoard) {

        this.chessBoard = chessBoard;

        // if clock and move => 'press' clock
        if (this.newmove && this.clock.isTicking()){

            this.color === 'w' && this.clock.whiteclick();
            this.color === 'b' && this.clock.blackclick();

            // mark move as done
            this.newmove = '';

        }

        this.updateIllustration();
        this.startListening();

        // DEBUG && console.log('BoardController.onafterupdates.out');

    }

    updateIllustration () {

        const squareFilter  = m =>  m.from === this.selectedSquare || m.to === this.selectedSquare;

        this.illustrations  = DB.Options.first['board-illustrations'];
        this.validMoves     = this.chess.moves({verbose: true});
        this.squareMoves    = this.validMoves.filter(squareFilter);

        // DEBUG && console.log('BoardController.updateIllustration', {
        //     square: this.selectedSquare, piece: this.selectedPiece, color: this.color, turn: this.turn, moves: this.squareMoves.length,
        // });

        // chessboard on page w/ dn has height 0
        if (this.chessBoard && this.chessBoard.view.height && this.game.turn !== -2){

            this.chessBoard.removeArrows( null );

            // keep internal markers (move, emphasize)
            this.chessBoard.removeMarkers( null, MARKER_TYPE.rectwhite);
            this.chessBoard.removeMarkers( null, MARKER_TYPE.rectblack);
            this.chessBoard.removeMarkers( null, MARKER_TYPE.selectedmoves);
            this.chessBoard.removeMarkers( null, MARKER_TYPE.selectednomoves);

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

        const illus = this.illustrations;

        if (this.selectedSquare){
            if (this.squareMoves.length){
                this.chessBoard.addMarker(this.selectedSquare, MARKER_TYPE.selectedmoves);
            } else {
                this.chessBoard.addMarker(this.selectedSquare, MARKER_TYPE.selectednomoves);
            }
        }

        if (illus.attack){
            this.validMoves.forEach( square => {
                this.chessBoard.addMarker(square.to, this.color === 'w' ? MARKER_TYPE.rectwhite : MARKER_TYPE.rectblack);
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
