import Move    from './move';
import Factory from '../../components/factory';

function renderMoves (game) {

    return game.moves
        // turns list of moves [white, black, white,...] into
        // list of pairs of plies [[white, black], [white, black],...]
        .reduce( (acc, val) => {
            val.color === 'w' ? (acc.push( [ val ] )) : (acc[acc.length -1].push( val ));
            return acc;
        }, [] )
        // and then map to table rows <tr><td>white</td><td<black...
        .map( (move, idx) => {
            return m(Move, {
                game,
                num:   idx +1,
                white: { move: move[0] },
                black: { move: move[1] || {piece: '', fen: '', flags: {}, san: '', cp: 0} },
            });
        })
    ;

}

const Moves = Factory.create('Moves', {

    view ( vnode ) {
        //TODO: something for small screens
        return m('div.gm-moves.flex-shrink',
            m('table.w-100.collapse', renderMoves(vnode.attrs.game)),
        );
    },

});

export default Moves;
