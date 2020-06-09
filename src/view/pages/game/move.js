import Config  from '../../../data/config';
import State   from '../../../data/state';
import { H }   from '../../../services/helper';
import Caissa  from '../../../caissa';

const state = State.game;

const clampScale = function (cp) {
    return H.scale(H.clamp(Math.abs(cp), 0.001, state.score.maxcp), 0, state.score.maxcp, 1, 20);
};

const calcWidth = function (move) {
    var result = (
        !move.cp                           ? 0 :
        move.turn % 2 === 0 && move.cp > 0 ? ~~clampScale(move.cp) :
        move.turn % 2 === 1 && move.cp > 0 ? ~~clampScale(move.cp) :
        0
    );
    // console.log('calcwidth', move.turn, result, move.cp, state.score.maxcp);
    return result;
};

const ply = {
    name: 'Ply',
    view ( vnode ) {

        const { player, move, colbar, colpiece } = vnode.attrs;

        const bg        = move.turn !== state.game.turn ? '.bg-transparent' : '.bg-89b';
        const style     = 'color:' + Config.flagColors[player][move.flags];
        const width     = calcWidth(move);

        const piece     = Config.fontPieces[move.piece];

        const onclick   = (e) => {
            e.redraw = false;
            Caissa.route('/game/:turn/:uuid/', {turn: move.turn, uuid: state.game.uuid}, { replace: true });
        };

        const matetext  = move.mate ? '# in ' + Math.abs(move.mate) : '';
        const matecolor = move.mate && move.mate > 0 ? '.ceee' : '.c333';

        const title     = Config.flagTitles[move.flags] + `  ${move.turn}`;
        const titlepv   = move.pv ? move.pv.split(' ').slice(0, 3).join(' ') : '';
        const titleline = move.pv ? move.cp || '' + ':' +  titlepv : '';
        const titlemate = move.mate && move.pv ? titlepv : '';
        const titleeval = matetext ? titlemate : titleline;

        return m('[', [
            m('td.tc.f4.pa0.chess'  + bg, {onclick, title, style: colpiece, 'data-turn': move.turn}, piece ),
            m('td.tl.fiom.f5' + bg, {onclick, title, style}, move.san),
            m('td.f6'         + bg, {style: 'min-width: 20px', title: titleeval}, [
                matetext
                    ? m('div' + matecolor, matetext)
                    : m('div.h05' + colbar, {style: 'width:' + width + 'px'} ),
            ]),
        ]);

    },
};

export default {
    name: 'Move',
    view (vnode) {
        const { num, white, black } = vnode.attrs;
        return m('tr.gm-move.trhover', [
            m('td', {style:'width: 1rem'}),
            m('td.tr.fiom.f5.fw8.c555', num + '.'),
            m(ply, { move: white.move, player: 'w', colpiece: {color: '#eee'}, colbar: '.bg-ddd'}),
            m(ply, { move: black.move, player: 'b', colpiece: {color: '#333'}, colbar: '.bg-555'}),
            m('td', {style:'width: 1rem'}),
        ]);
    },

};
