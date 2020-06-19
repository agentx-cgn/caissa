
import Chess    from  'chess.js';
import {MARKER_TYPE} from '../../extern/cm-chessboard/Chessboard';
import Dispatcher from '../services/dispatcher';
import State from '../data/state';
import Config from '../data/config';
import { $$ }  from '../services/helper';

const fire = Dispatcher.connect({name: 'board-tools'});

export default {

    game2fen (game) {
        const turn = ~~game.turn;
        return (
            turn === -2
                ? Config.fens.empty
                : turn === -1
                    ? Config.fens.start
                    : game.moves[turn].fen
        );
    },

    resize (innerWidth, innerHeight) {
        if ( innerWidth >= 720 ) {

            // below 720 MQs take care
            const availWidth  = innerWidth  - 360;
            const availHeight = innerHeight - 5 * 42;
            const $board      = $$('div.chessboard');
            const $content    = $$('section.content');
            const size  = Math.min(availWidth, availHeight) + 4;

            $board   && ($board.style.width      = size + 'px');
            $board   && ($board.style.height     = size + 'px');
            $content && ($content.style.maxWidth = size + 'px');
        }
    },

    isValid (chess, move) {
        const chess1 = new Chess();
        chess1.load(chess.fen());
        const result = chess1.move(move);
        return result ? chess1.fen() : '';
    },

    updateMarker (chess, chessBoard, state) {

        const validSquares = chess.moves({verbose: true});
        const markerType = chess.turn() === 'w' ? MARKER_TYPE.rectwhite : MARKER_TYPE.rectblack;

        chessBoard.removeMarkers( null, null);

        if (state.illustrations.marker.attack){
            validSquares.forEach( square => {
                chessBoard.addMarker(square.to, markerType);
            });
        }

    },

    updateArrows (chess, chessBoard, state) {

        // let validSquares;

        const lasts = chess.history({verbose: true}).slice(-2);
        const arrows = state.illustrations.arrows;

        chessBoard.removeArrows( null );

        if (arrows.bestmoves){
            const bm = state.bestmove.move;
            const po = state.bestmove.ponder;
            if (bm.from && po.from){
                chessBoard.addArrow(po.from, po.to, {class: 'arrow ponder'});
                chessBoard.addArrow(bm.from, bm.to, {class: 'arrow bestmove', onclick: function () {
                    fire('board', 'move', [[arrows.bestmove.move]]);
                }});
            }
        }

        if (arrows.validmoves && arrows.moveStart){
            chess.moves({verbose: true})
                .filter( move => move.from === arrows.moveStart )
                .forEach( move => {
                    chessBoard.addArrow(move.from, move.to, {class: 'arrow validmove'});
                })
            ;
        }

        if (arrows.pinned){
            chessBoard.addArrow('c1', 'c8', {class: 'arrow pinned'});
        }

        if (arrows.last){
            lasts.forEach( m => {
                chessBoard.addArrow(m.from, m.to, {class: m.color === 'w' ? 'arrow last-white' : 'arrow last-black'});
            });
        }

        if (arrows.test){
            chessBoard.addArrow('e2', 'e4', {class: 'arrow test'} );
            chessBoard.addArrow('f2', 'h4', {class: 'arrow test'} );
            chessBoard.addArrow('d2', 'c4', {class: 'arrow test'} );
            chessBoard.addArrow('c2', 'a3', {class: 'arrow test'} );
            chessBoard.addArrow('d7', 'd5', {class: 'arrow test'} );
            chessBoard.addArrow('c7', 'c5', {class: 'arrow test'} );

            chessBoard.addArrow('g7', 'g8', {class: 'arrow test'} );
            chessBoard.addArrow('g7', 'h8', {class: 'arrow test'} );
            chessBoard.addArrow('g7', 'h7', {class: 'arrow test'} );
            chessBoard.addArrow('g7', 'h6', {class: 'arrow test'} );
            chessBoard.addArrow('g7', 'g6', {class: 'arrow test'} );
            chessBoard.addArrow('g7', 'f6', {class: 'arrow test'} );
            chessBoard.addArrow('g7', 'f7', {class: 'arrow test'} );
            chessBoard.addArrow('g7', 'f8', {class: 'arrow test'} );

            // chessBoard.addArrow('f2', 'g4', ARROW_TYPE.test);
            // validSquares.forEach( square => {
            //     chessBoard.addArrow(square.from, square.to, arrowType);
            // });
        }

    },

    // return game state as colors and boolean
    updateFlags (chess) {
        const flags = State.game.flags;
        flags.turn = chess.turn();  // w/b
        flags.over = chess.game_over();
        flags.chck = chess.in_check();
        flags.mate = chess.in_checkmate();
        flags.draw = chess.in_draw();
        flags.stal = chess.in_stalemate();
        flags.insu = chess.insufficient_material();
        flags.repe = chess.in_threefold_repetition();
    },

    genCapturedPieces (fen) {

        if (fen === Config.fens.empty) {
            return{ blacks: 'lwtnjo', whites: 'lwtnjo' };
        }

        const sorter = (a, b) => {
            return (
                Config.pieces.fens.sorted.indexOf(a.toLowerCase()) -
                Config.pieces.fens.sorted.indexOf(b.toLowerCase())
            );
        };

        let blacks = Config.pieces.fens.black;
        let whites = Config.pieces.fens.white;

        fen.split(' ')[0].split('').forEach(letter => {
            blacks = blacks.replace(letter, '');
            whites = whites.replace(letter, '');
        }),

        blacks = blacks.split('').sort(sorter).map( letter => Config.fontPieces[letter] );
        whites = whites.split('').sort(sorter).map( letter => Config.fontPiecesWhite[letter] );

        return { blacks, whites };

    },

    squareIndexToField (index) {

        let row = Math.floor(index/8) + 1;
        let col = index % 8;
        let letter = String.fromCharCode(97 + col);

        return letter + row;



    },

};
