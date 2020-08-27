
import Chess           from 'chess.js';
import { MARKER_TYPE } from '../../../extern/cm-chessboard/Chessboard';
import Caissa          from '../../caissa';
import Config          from '../../data/config';
import DB              from '../../services/database';
import { H, $$ }       from '../../services/helper';
import Pool            from '../../services/engine/pool';
import Tools           from '../../tools/tools';
import ChessClock      from '../../components/chessclock';
import evaluate        from '../game/game-evaluate';
import Opponent        from './opponent';
import Proposer        from './board-proposer';

const DEBUG = false;

/**
 * game modes:
 * a-a archived, game is finished, has no opponents, no timecontrol, can't be changed
 * x-x experimental, no timecontrol, accepts all input, default is x-x
 * [h|s]-[h|s] has opponents + timecontrol, is not finished, turn to a-a after finsish
 */

class BoardController {

    constructor () {}

    init (game, board) {

        this.destroy();

        this.isEvaluating   = false; // scoring moves
        this.isProposing    = false; // best move

        this.game           = game;
        this.board          = board;
        this.chess          = new Chess();
        this.clock          = ChessClock;

        this.newmove        = '';

        this.bestmove       = '';
        this.selectedSquare = '';
        this.selectedPiece  = '';
        this.squareMoves    = []; // all moves from or to selected square
        this.validMoves     = []; // these are all possible moves, for current color

        this.opponents      = {
            'w': new Opponent('w', this.game.rivals[0]),
            'b': new Opponent('b', this.game.rivals[2]),
        };
        this.listener = {
            onmove:        this.onmove.bind(this),
            onclockover:   this.onclockover.bind(this),
            onfieldselect: this.onfieldselect.bind(this),
            ongameover:    this.ongameover.bind(this),
        };

        this.update();

        return this;

    }

    destroy () {
        if (this.opponents){
            this.opponents.w && this.opponents.w.destroy();
            this.opponents.b && this.opponents.b.destroy();
        }
    }

    updateChess () {

        if (this.turn === -2) {
            this.chess.load(Config.fens.empty);

        } else if (this.turn === -1) {
            this.chess.load(Config.fens.start);

        } else {
            if (this.game.over) {
                this.chess.load(this.game.moves[this.turn].fen);

            } else {
                this.chess.load_pgn(Tools.Games.pgnFromMoves(this.game, this.turn));

            }

        }

    }
    update () {

        this.turn  = ~~this.game.turn;

        this.updateChess();
        // this.updateProposer();

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

        // actions have no moves, so update here too
        // this.updateFlags();
        this.updateButtons();

        DEBUG && console.log('BoardController.update.out', {uuid: this.game.uuid, turn: this.turn, color: this.color});

    }

    updateProposer () {

        // const conditions  = { depth: 10, maxtime: 1 };

        const optBestmove = DB.Options.first['board-illustrations'].bestmove;

        // const propose = () => {
        //     ( async () => {

        //         await this.proposer.isready();
        //         await this.proposer.position(this.chess.fen());

        //         console.log('Proposer.go.in', conditions);
        //         const result   = await this.proposer.go(conditions);
        //         console.log('Proposer.result', result.bestmove, result.ponder, result.info.slice(-1)[0].pv);

        //         this.bestmove  = result.bestmove;
        //         this.ponder    = result.ponder;

        //         this.updateArrows();

        //     })();
        // };

        this.bestmove = '';
        this.ponder   = '';

        if (!this.isProposing && optBestmove) {

            Proposer.init();
            this.isProposing = true;

            //     .then( async () => {
            //         const [bestmove, ponder] = await Proposer.propose();
            //         this.bestmove = bestmove;
            //         this.ponder = ponder;
            //     })
            // ;

            // // switch proposer on
            // this.slot = Pool.request(1)[0];
            // this.slot.engine.init()
            //     .then( engine => {
            //         return engine.isready();
            //     })
            //     .then( engine => {
            //         return engine.ucinewgame();
            //     })
            //     .then( engine => {
            //         this.proposer    = engine;
            //         this.slot.owner  = 'proposer';
            //         this.isProposing = true;
            //         console.log('Proposer.go', this.slot);
            //         propose();
            //     })
            // ;
            // // console.log('Proposer.on', this.slot);

        } else if (this.isProposing && !optBestmove) {
            // switch proposer off
            this.isProposing = false;
            Proposer.stop();
            // Pool.release([this.slot]);
            // console.log('Proposer.off');

        } else {
            console.log('Proposer.nochange');

        }

        this.isProposing && Proposer.initialization
            .then( async () => {
                const result = await Proposer.propose(this.chess.fen());
                this.bestmove = result.bestmove;
                this.ponder   = result.ponder;
                this.updateArrows();
            })
        ;

    }

    updateButtons () {

        // button pairs are tri-state (play/pause, evaluate/spinner)
        // null  => .dn
        // false => .disabled
        // true  => .enabled

        const btns     = this.board.buttons;
        const lastTurn = this.game.moves.length -1;
        const rivals   = this.game.rivals;

        // always possible
        btns.rotate = true;

        // default
        btns.play  = false;
        btns.pause = null;

        // game with timecontrol and not empty board
        if ( rivals !== 'h-h' && rivals !== 'x-x' && this.turn > -2 ){

            btns.play       = true;
            btns.pause      = null;

            if ( this.clock.isTicking() ) {
                btns.play       = null;
                btns.pause      = true;
            }

        }

        // eval / spinner
        btns.spinner   = this.isEvaluating ? true : null;
        btns.evaluate  = this.isEvaluating ? false : lastTurn > 0 && !this.isRunning;

        // game moves navigation
        btns.backward  = this.turn > 0;
        btns.left      = this.turn > -2;
        btns.right     = this.turn < lastTurn;
        btns.forward   = this.turn < lastTurn;

        DB.Boards.update(this.board.uuid, { buttons: btns }, true);
        //TODO: When is a game terminated?
        DEBUG && console.log('BoardController.updateButtons', 'btn.play', btns.play);
    }

    ongameover (msg) {

        console.log('BoardController.ongameover', msg);

        this.game.over = true;

        if (msg.reason === 'timeout'){
            // Caissa.redraw();

        } else if (msg.reason === 'rules') {
            // Caissa.redraw();

        }
        // this.opponents[this.tomove].destroy();
        // this.opponents[this.towait].destroy();
        this.destroy();
        this.clock.stop();

    }

    onclockover (whitebudget, blackbudget) {
        this.ongameover({ reason: 'timeout', whitebudget, blackbudget});
    }

    // Button Actions
    play () {

        DEBUG && console.log('BoardController.play.clicked');

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
        DEBUG && console.log('BoardController.pause.clicked');
        this.opponents[this.tomove].pause();
        this.opponents[this.towait].pause();
        this.clock.pause();
        Caissa.redraw();
    }
    rotate () {
        const orientation = this.board.orientation === 'w' ? 'b' : 'w';
        DB.Boards.update(this.game.uuid, { orientation });
        Caissa.redraw();
    }
    evaluate () {

        this.isEvaluating = true;
        evaluate(this.game, () => {
            this.isEvaluating = false;
            Caissa.redraw();
        });

    }

    interpreteDiff (diff) {
        const turn = this.game.turn;
        return (
            diff === '0' ? 0 :
            diff === 'e' ? this.game.moves.length -1 :
            turn === -2 && diff < 0  ? -2 :
            turn === this.game.moves.length -1 && diff > 0  ? this.game.moves.length -1 :
            turn + diff
        );
    }
    step (diff) {
        const turn = this.interpreteDiff(diff);
        DB.Games.update(this.game.uuid, { turn });
        Caissa.route('/game/:turn/:uuid/', { turn, uuid: this.game.uuid }, { replace: true });
    }

    // called from board.onupdate
    stopListening (chessBoard) {
        chessBoard.disableMoveInput();
        $$('div.chessboard').removeEventListener('mousedown',  this.listener.onfieldselect);
        $$('div.chessboard').removeEventListener('touchstart', this.listener.onfieldselect);
    }
    startListening () {

        // No pieces, no moves either
        if (this.turn === -2){ return; }

        const $chessboard = $$('div.chessboard');
        const oppToMove   = this.opponents[this.tomove];
        const oppToWait   = this.opponents[this.towait];

        // if mobile div might not exist yet
        if ($chessboard){
            $$('div.chessboard').addEventListener('mousedown', this.listener.onfieldselect);
            $$('div.chessboard').addEventListener('touchdown', this.listener.onfieldselect);
        }

        // updates opps with position/fen
        oppToMove.update(this);
        oppToWait.update(this);

        if (this.clock.isTicking() || this.game.rivals === 'x-x'){
            ( async () => {
                this.opponents[this.towait].pause(this.chessBoard);
                const move = await this.opponents[this.tomove].domove(this.chessBoard);
                this.listener.onmove(move);
            })();
        }

        DEBUG && console.log('BoardController.startListening.out', { rivals: this.game.rivals, tomove: this.tomove });

    }

    onfieldselect (e) {

        const idx           = e.target.dataset.index;
        const square        = Tools.Board.squareIndexToField(idx);
        this.selectedSquare = square !== this.selectedSquare ? square : '';
        this.selectedPiece  = this.chessBoard.getPiece(this.selectedSquare) || '';
        this.updateIllustration();

        DEBUG && console.log('BoardController.onfieldselect.out', {
            square: this.selectedSquare, piece: this.selectedPiece,
        });

    }

    // Opponent sends move
    onmove ( candidate ) {

        const move = this.chess.move(candidate, { sloppy: true });

        if (!move) {
            console.warn('BoardController.onmove.illegal', { candidate, move });
            console.log(this.chess.ascii());
            // eslint-disable-next-line no-debugger
            debugger;

        } else {

            move.fen  = this.chess.fen();
            move.turn = this.turn +1;
            let pgn   = this.chess.pgn().trim();

            // if first move of default, create new game + board and reroute to
            if (this.game.uuid === 'default'){

                const timestamp = Date.now();
                const uuid = H.hash(String(timestamp));
                const game = H.clone(this.game, {
                    uuid,
                    rivals: 'x-x',
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

                if (move.turn < this.game.moves.length) {
                    // throw away all moves after this new one
                    this.game.moves.splice(this.turn +1);
                }

                this.game.turn = move.turn;
                this.newmove   = move;
                this.game.moves.push(move);

                DB.Games.update(this.game.uuid, this.game, true);
                Caissa.route('/game/:turn/:uuid/', {turn: this.game.turn, uuid: this.game.uuid}, {replace: true});

            }

        }

        DEBUG && console.log('BoardController.onmove.out', move, candidate);

    }

    // comes with with every redraw, after move was animated
    onafterupdates (chessBoard) {

        this.chessBoard = chessBoard;

        // if clock and move => 'press' clock
        if (this.newmove && this.clock.isTicking()){

            this.color === 'w' && this.clock.whiteclick();
            this.color === 'b' && this.clock.blackclick();
            this.game.timecontrol = this.clock.state();

        }

        // mark move as done
        this.newmove  = '';

        //
        this.bestmove = '';

        this.updateButtons();
        this.updateIllustration();
        this.updateProposer();

        if (!this.game.over && this.chess.game_over()) {
            this.ongameover({
                reason        : 'rules',
                over          : this.chess.game_over(),
                checkmate     : this.chess.in_checkmate(),
                draw          : this.chess.in_draw(),
                stalemate     : this.chess.in_stalemate(),
                insufficient  : this.chess.insufficient_material(),
                repetition    : this.chess.in_threefold_repetition(),
            });

        } else {
            this.startListening();

        }


        DEBUG && console.log('BoardController.onafterupdates.out', { color: this.color });

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

            // this.chessBoard.removeArrows( null );

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


        if (illus.bestmove && this.bestmove){

            const from = this.bestmove.slice(0, 2);
            const to   = this.bestmove.slice(2, 4);
            this.chessBoard.removeArrows('arrow bestmove');
            this.chessBoard.addArrow(from, to, {class: 'arrow bestmove'});

        } else {
            this.chessBoard.removeArrows('arrow bestmove');
        }

        if (illus.validmoves){
            this.chessBoard.removeArrows('arrow validmove');
            this.squareMoves.forEach( move => {
                this.chessBoard.addArrow(move.from, move.to, {class: 'arrow validmove'});
            });

        } else {
            this.chessBoard.removeArrows('arrow validmove');

        }

        if (illus.lastmove){
            this.chessBoard.removeArrows('arrow lastmove white');
            this.chessBoard.removeArrows('arrow lastmove black');
            const lm = this.game.moves[this.turn];
            if (lm) {
                this.chessBoard.addArrow(
                    lm.from, lm.to,
                    { class: lm.color === 'w' ? 'arrow lastmove white' : 'arrow lastmove black' },
                );
            }
        } else {
            this.chessBoard.removeArrows('arrow lastmove white');
            this.chessBoard.removeArrows('arrow lastmove black');

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

        } else {
            this.chessBoard.removeArrows('arrow test');

        }

    }
    updateMarker () {

        // marker need to be implemented/referenced in
        // Config.board, MARKER_TYPE and cm-chessboard/chessboard-sprite.svg

        const illus = this.illustrations;

        if (illus.heatmap) {
            //
        }

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

//TODO: Class no longer needed
// const Controller = new BoardController();

export default new BoardController();
