
import Factory      from '../../components/factory';
import ChessClock   from '../../components/chessclock';
// import Tools        from '../../tools/tools';

const BoardBar = Factory.create('BoardBar', {
    view (vnode) {

        const { game, board, pos, player } = vnode.attrs;
        const style = 'letter-spacing: -8px; font-size: 1.5rem;';

        if (player === 'w') {

            return m('div.flex.flex-row.board-bar-' + pos, [
                m(ChessClock, { player }),
                m('div.flex-auto.mh2.saim.f4.c333.ellipsis',  game.white),
                m('div.captured.tr', m('div.chess.cfff', { style }, board.captured.white.join(''))),
            ]);

        } else {

            return m('div.flex.flex-row.board-bar-' + pos, [
                m(ChessClock, { player }),
                m('div.flex-auto.mh2.saim.f4.cfff.ellipsis', game.black),
                m('div.captured.tr', m('div.chess.c333', { style }, board.captured.black.join('') )),
            ]);

        }

    },
});

export default BoardBar;
