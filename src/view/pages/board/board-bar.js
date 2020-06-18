
import Factory      from '../../components/factory';
import ChessClock   from '../../components/chessclock';
import Tools        from '../../tools/tools';

const BoardBar = Factory.create('BoardBar', {
    view (vnode) {

        const { game, pos, player } = vnode.attrs;
        const style = 'letter-spacing: -8px; font-size: 1.5rem;';
        const fen   = Tools.board.game2fen(game);

        const captured = Tools.board.genCapturedPieces(fen);

        if (player === 'w') {

            return m('div.flex.flex-row.board-bar-' + pos, [
                m(ChessClock, { player }),
                m('div.flex-auto.mh2.saim.f4.c333.ellipsis',  game.white),
                m('div.captured.tr', m('div.chess.cfff', { style }, captured.whites)),
            ]);

        } else {

            return m('div.flex.flex-row.board-bar-' + pos, [
                m(ChessClock, { player }),
                m('div.flex-auto.mh2.saim.f4.cfff.ellipsis', game.black),
                m('div.captured.tr', m('div.chess.c333', { style }, captured.blacks )),
            ]);

        }

    },
});

export default BoardBar;
