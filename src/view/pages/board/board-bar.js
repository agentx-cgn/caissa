
import Factory      from '../../components/factory';
import State        from '../../data/state';
import ChessClock   from '../../components/chessclock';
import Tools        from '../../tools/tools';

const state = State.board;

const BoardBar = Factory.create('BoardBar', {
    view (vnode) {

        const { pos, player } = vnode.attrs;
        const style = 'letter-spacing: -8px; font-size: 1.5rem;';

        const captured = state.fen
            ? Tools.genCapturedPieces(state.fen)
            : { whites: 'll', blacks: 'll'}  // l = king
        ;

        if (player === 'w') {

            return m('div.flex.flex-row.board-bar-' + pos, [
                m(ChessClock, { player }),
                m('div.flex-auto.mh2.saim.f4.c333.ellipsis',  state.white),
                m('div.captured.tr', m('div.chess.cfff', { style }, captured.whites)),
            ]);

        } else {

            return m('div.flex.flex-row.board-bar-' + pos, [
                m(ChessClock, { player }),
                m('div.flex-auto.mh2.saim.f4.cfff.ellipsis', state.black),
                m('div.captured.tr', m('div.chess.c333', { style }, captured.blacks )),
            ]);

        }

    },
});

export default BoardBar;
