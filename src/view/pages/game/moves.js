import Move      from './move';
// import State     from '../../data/state';
import Factory   from '../../components/factory';
// import DB        from '../../services/database';

// const state = State.game;

// let turn;

// creates moves as an array of two plys [white, black]
function combinePlys (acc, val) {
    if (val.color === 'w'){
        acc.push( [ val ] );
    } else {
        acc[acc.length -1].push(val);
    }
    return acc;
}

// function renderMove (moves, idx) {
//     return m(Move, {
//         num:      idx +1,
//         white:    { move: moves[0] },
//         black:    { move: moves[1] || {piece: '', fen: '', flags: {}, san: '', cp: 0} },
//     });
// }

function genMoves (game) {

    return game.moves.reduce( combinePlys, [] ).map( (move, idx) => {
        return m(Move, {
            game,
            num:   idx +1,
            white: { move: move[0] },
            black: { move: move[1] || {piece: '', fen: '', flags: {}, san: '', cp: 0} },
        });
    });

}

const Moves = Factory.create('Moves', {

    view ( vnode ) {
        const { game } = vnode.attrs;
        // const game = DB.Games.find(uuid);
        return m('div.gm-moves.flex-shrink',
            m('table.w-100.collapse', genMoves(game)),
                // game.moves.reduce( combinePlys, [] ).map( renderMove ),
            // ),
        );
    },

});

export default Moves;
