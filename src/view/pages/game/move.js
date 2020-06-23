import Config  from '../../data/config';
import { H }   from '../../services/helper';
import Caissa  from '../../caissa';

const clampScale = function (game, cp) {
    return H.scale(H.clamp(Math.abs(cp), 0.001, game.score.maxcp), 0, game.score.maxcp, 1, 20);
};

const calcWidth = function (game, move) {
    var result = (
        !move.cp                             ? 0 :
        (move.turn % 2 === 0 && move.cp) > 0 ? ~~clampScale(game, move.cp) :
        (move.turn % 2 === 1 && move.cp) > 0 ? ~~clampScale(game, move.cp) :
        0
    );
    // console.log('calcwidth', move.turn, result, move.cp, state.score.maxcp);
    return result;
};

const ply = {
    name: 'Ply',
    view ( vnode ) {

        const { game, player, move, back } = vnode.attrs;

        const width     = calcWidth(game, move);
        const piece     = Config.pieces.font[move.piece];
        const onclick   = (e) => {
            e.redraw = false;
            Caissa.route('/game/:turn/:uuid/', {turn: move.turn, uuid: game.uuid}, { replace: true });
        };

        const matetext  = move.mate ? '# in ' + Math.abs(move.mate) : '';

        const title     = Config.flagTitles[move.flags]; // + `  ${move.turn}`;
        const titlepv   = move.pv ? move.pv.split(' ').slice(0, 3).join(' ') : '';
        const titleline = move.pv ? move.cp || '' + ':' +  titlepv : '';
        const titlemate = move.mate && move.pv ? titlepv : '';
        const titleeval = matetext ? titlemate : titleline;

        return m('[', [
            m('td.gm-ply-pic-' + player + back, { onclick, title, 'data-turn': move.turn }, piece ),
            m('td.gm-ply-san-' + player + back, { onclick, title }, move.san ),
            m('td.gm-ply-val-' + player + back, { onclick, title: titleeval }, [
                matetext
                    ? m('div.gm-ply-mate-' + player, matetext)
                    : m('div.gm-ply-bar-'  + player, { style: 'width:' + width + 'px'} ),
            ]),
        ]);

    },
};

export default {
    name: 'Move',
    view (vnode) {
        const { game, num, white, black } = vnode.attrs;
        const bgw = white.move.turn !== game.turn ? '.bg-transparent' : '.bg-89b';
        const bgb = black.move.turn !== game.turn ? '.bg-transparent' : '.bg-89b';
        return m('tr.gm-move.trhover', [
            m('td.gm-move-space'),
            m('td.gm-move-num', num),
            m(ply, { game, back: bgw, move: white.move, player: 'w' }),
            m(ply, { game, back: bgb, move: black.move, player: 'b' }),
            m('td.gm-move-space'),
        ]);
    },

};
