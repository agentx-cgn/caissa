
import Factory    from '../../components/factory';
import ECOS       from '../../services/ecos';
import BoardController from '../board/board-controller';

function formatEntry( [ moves, entry='' ] ){

    if (!Array.isArray(moves)) {
        moves = [ moves ];
    }

    const first   = (' ' + moves[0]).slice(-3).replace(' ', '&nbsp;');
    const rest    = ' ' + moves.slice(1).join(' ');
    const entries = entry ? entry.split('|').map( e => e.trim() ) : null;

    return [
        m('span.fiom', m.trust(first)),
        entry
            ? m('span.sair.pl1', rest + ' ' + (entries.length === 2 ? entries[1] : entries[2]))
            : m('span.sair.pl1', 'not named'),
    ];
}

function formatContinuation (cont) {
    const move  = (' ' + cont[0]).slice(-3).replace(' ', '&nbsp;');
    const rest  =  ' ' + cont[1].join(' ');
    const label = rest + ' ' + (cont[2].length === 2 ? cont[2][1] : cont[2][2]);
    return [
        m('span.fiom', m.trust(move)),
        m('span.sair.pl1', label),
    ];

}

const GameEcos = Factory.create('GameEcos', {

    view ( vnode ) {

        const { game } = vnode.attrs;
        const turn  = game.turn;

        if (turn === -2) return;

        const moves = game.moves.slice(0, turn +1);
        const path = ECOS.describeMoves(moves)
            .map( (entry, idx) => {
                const className = idx % 2 ? 'black' : 'white';
                return m('div.ellipsis', { className }, formatEntry(entry) );
            })
        ;

        let continuations = ECOS.findContinuations(moves)
            .map ( (entry) => {
                // entry: [ 'a3', ['a6', ''], ['A00', 'King Pawn', 'Duck Variation']
                const continuation = formatContinuation(entry);
                const className = turn % 2 ? 'white' : 'black';
                const onclick = e => {
                    e.redraw = false;
                    // console.log(entry[0], entry[2].join(', '));
                    BoardController.onmove(entry[0]);
                };
                return m('div.ellipsis.pl2', { className, onclick }, continuation );
            })
        ;

        return m('div.mh3.mb2', [
            m('div.eco-path', path),
            m('div.pl2.eco-continuations', continuations),
        ]);

    },

});

export default GameEcos;
