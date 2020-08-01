
import Factory    from '../../components/factory';
import ECOS       from '../../services/ecos';

function formatEntry( [move, entry] ){
    if (!entry) {
        return move + ' no name';
    }
    const entries =  entry.split('|');
    if (entries.length === 2) {
        return move + ' ' + entries[1];
    } else if (entries.length === 3) {
        return move + ' ' + entries[2];
    }
}

const GameEcos = Factory.create('GameEcos', {

    view ( vnode ) {

        const { game } = vnode.attrs;
        const turn  = game.turn;
        const moves = game.moves.slice(0, turn +1);
        const path  = ECOS.describeMoves(moves)
            .map ( entry => m('div.black.fior.ellipsis', formatEntry(entry) ) )
        ;
        const options = ECOS.describeOptions(moves)
            .map ( entry => m('div.white.fior.ellipsis', formatEntry(entry) ))
        ;

        return m('div.mh3.mb2', path, options);

    },

});

export default GameEcos;
