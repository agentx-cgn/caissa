import Chess from 'chess.js';
import { H, $$ }  from '../services/helper';

const chess = new Chess();

export default {


    scrollTurnIntoView (turn, msecs=60) {

        // if (state.moves.length){
        setTimeout( () => {

            const selectorElem = 'td[data-turn="' + turn + '"]';
            const selectorView = 'div.gm-moves';
            const isVisible    = H.isVisibleInView($$(selectorElem), $$(selectorView));

            if (!selectorElem || !selectorView) {
                console.warn('scrollIntoView', selectorElem, selectorView);
            }

            if ( !isVisible && $$(selectorElem) ){
                $$(selectorElem).scrollIntoView(true);
            }

        }, msecs);
        // }

    },

    genResultLine(game) {
        let accu = '';
        game.result      && (accu += game.result + ' ');
        game.termination && (accu += game.termination + ' ');
        typeof game.timecontrol === 'object' && (accu += game.timecontrol.caption + ' ');
        typeof game.timecontrol === 'string' && (accu += game.timecontrol + ' ');
        return accu;
    },

    // full list of moves in current game
    pgn2moves (pgn) {

        if (pgn === '') { return [];}

        const chess  = new Chess();
        const chess1 = new Chess();
        !chess.load_pgn(pgn) && console.warn('boardtools.load.pgn.failed', pgn);

        return chess.history({verbose: true}).map( (move, idx) => {
            chess1.move(move);
            move.fen  = chess1.fen();
            move.turn = idx;
            return move;
        });

    },

    lastMovePointer (list) {

        return (
            list.length % 2 === 0 ?
                'b' + (~~(list.length/2) -1)    :
                'w' + (~~(list.length/2))
        );

    },

    gameLength (game) {
        if (game.pgn === '') {
            return 0;
        } else {
            !chess.load_pgn(game.pgn) && console.warn('gameLength.error', game);
            return chess.history().length;
        }
    },

    turn2pointer (turn) {
        const color = ~~turn % 2 === 0 ? 'w' : 'b';
        const move  = Math.floor(~~turn / 2) +1;
        return color + move;
    },

};
