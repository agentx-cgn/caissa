
import Factory from '../../components/factory';
import { MoveRow, MoveSpan } from './move';

function renderMoves (game) {

    // // eslint-disable-next-line no-debugger
    // debugger;

    return !game.moves.length
        ? m('div', 'no moves yet') //TODO: needs some css love
        : game.moves
            // turns list of moves [white, black, white,...] into
            // list of pairs of plies [[white, black], [white, black],...]
            .reduce( (acc, val) => {
                val.color === 'w' ? (acc.push( [ val ] )) : (acc[acc.length -1].push( val ));
                return acc;
            }, [] )
            .map( (move, idx) => {
                return innerWidth >= 720
                    // and then map to table rows <tr><td>white</td><td<black...
                    ? m(MoveRow, {
                        game,
                        num:   idx +1,
                        white: { move: move[0] },
                        black: { move: move[1] || {piece: '', fen: '', flags: {}, san: '', cp: 0} },
                    })
                    // or inlined as <span>
                    : m(MoveSpan, {
                        game,
                        num:   idx +1,
                        white: { move: move[0] },
                        black: { move: move[1] || {piece: '', fen: '', flags: {}, san: '', cp: 0} },
                    })
                ;
            })
    ;

}

const Moves = Factory.create('Moves', {

    view ( vnode ) {

        return innerWidth >= 720

            // Desktop, two columns
            ? m('div.gm-moves.flex-shrink',
                m('div.mv2',
                    m('table.w-100.collapse', renderMoves(vnode.attrs.game)),
                ),
            )
            // mobile, floating
            : m('div.gm-moves',
                m('div.ma2', renderMoves(vnode.attrs.game)),
            )
        ;
    },

});

export default Moves;
