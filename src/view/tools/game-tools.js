import Chess from 'chess.js';
import { H, $$ }  from '../services/helper';

export default {

    scrollTurnIntoView (turn, msecs=60) {
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
    },

    genResultLine(game) {
        let accu = '';
        game.header.Result      && (accu += game.header.Result + ' ');
        game.header.Termination && (accu += game.header.Termination + ' ');
        typeof game.timecontrol === 'object' && (accu += game.timecontrol.caption + ' ');
        typeof game.header.TimeControl === 'string' && (accu += game.header.TimeControl + ' ');
        return accu;
    },
    genTimeLine(game) {
        let accu = '';
        game.date
            ? (accu += game.date)
            : game.timestamp
                //TODO: make this locale
                ? (accu += H.date2isoUtc(new Date(game.timestamp)))
                : void(0)
        ;
        return accu;
    },

    // generates full list of moves in game
    updateMoves (game) {

        if (game.pgn === '') {
            game.moves    = [];
            game.plycount = 0;
            return;
        }

        const chess  = new Chess();
        const chess1 = new Chess();
        !chess.load_pgn(game.pgn) && console.warn('gametools.updateMoves.failed', game.pgn);

        chess.history({verbose: true})
            .map( (move, idx) => {
                chess1.move(move);
                move.fen  = chess1.fen();
                move.turn = idx;
                game.moves.push(move);
            })
        ;
        game.plycount = game.moves.length;

    },

    // lastMovePointer (list) {

    //     return (
    //         list.length % 2 === 0 ?
    //             'b' + (~~(list.length/2) -1)    :
    //             'w' + (~~(list.length/2))
    //     );

    // },

    // gameLength (game) {
    //     if (game.pgn === '') {
    //         return 0;
    //     } else {
    //         const chess  = new Chess();
    //         !chess.load_pgn(game.pgn) && console.warn('gameLength.error', game);
    //         return chess.history().length;
    //     }
    // },

    // turn2pointer (turn) {
    //     const color = ~~turn % 2 === 0 ? 'w' : 'b';
    //     const move  = Math.floor(~~turn / 2) +1;
    //     return color + move;
    // },

};
