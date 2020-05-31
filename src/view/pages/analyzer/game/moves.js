import Move   from './move';
import State  from '../../../data/state';

const state = State.game;

const Moves = {

    renderMove (moves, idx) {
        return m(Move, {
            num:      idx +1,
            white:    { move: moves[0] },
            black:    { move: moves[1] || {piece: '', fen: '', flags: {}, san: '', cp: 0} },
        });
    },

    // creates moves as an array of two plys [white, black]
    combinePlys (acc, val) {
        if (val.color === 'w'){
            acc.push( [ val ] );
        } else {
            acc[acc.length -1].push(val);
        }
        return acc;
    },

    view ( ) {
        return m('div.gm-moves.viewport-y.flex-shrink', [
            m('table.w-100.collapse',
                state.moves.reduce( Moves.combinePlys, [] ).map( Moves.renderMove ),
            ),
        ]);
    },

};

export default Moves;
