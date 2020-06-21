import Move      from './move';
import Factory   from '../../components/factory';

// creates moves as an array of two plys [white, black]
function combinePlys (acc, val) {
    if (val.color === 'w'){
        acc.push( [ val ] );
    } else {
        acc[acc.length -1].push(val);
    }
    return acc;
}

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
        return m('div.gm-moves.flex-shrink',
            m('table.w-100.collapse', genMoves(vnode.attrs.game)),
        );
    },

});

export default Moves;
