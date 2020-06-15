import Move      from './move';
import State     from '../../data/state';
import Factory   from '../../components/factory';

const state = State.game;

// creates moves as an array of two plys [white, black]
function combinePlys (acc, val) {
    if (val.color === 'w'){
        acc.push( [ val ] );
    } else {
        acc[acc.length -1].push(val);
    }
    return acc;
}

function renderMove (moves, idx) {
    return m(Move, {
        num:      idx +1,
        white:    { move: moves[0] },
        black:    { move: moves[1] || {piece: '', fen: '', flags: {}, san: '', cp: 0} },
    });
}

const Moves = Factory.create('Moves', {

    view ( ) {
        return m('div.gm-moves.flex-shrink', [
            m('table.w-100.collapse',
                state.moves.reduce( combinePlys, [] ).map( renderMove ),
            ),
        ]);
    },

});

export default Moves;
