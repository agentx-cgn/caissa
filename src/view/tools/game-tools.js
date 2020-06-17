import Chess from 'chess.js';

const chess = new Chess();

export default {


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
