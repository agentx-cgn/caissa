
import Factory      from '../../components/factory';
import ChessClock   from '../../components/chessclock';

const DEBUG = false;

const BoardInfo = Factory.create('BoardInfo', {
    view (vnode) {

        const { game, board, pos, player } = vnode.attrs;
        const style = 'letter-spacing: -8px; font-size: 1.5rem;';

        DEBUG && console.log('BoardInfo', { player, orientation: board.orientation});

        if (player === 'w') {

            return m('div.flex.flex-row.board-bar-' + pos, [
                m(ChessClock, { player }),
                m('div.flex-auto.mh2.saim.f4.cfff.ellipsis',  game.header.White),
                m('div.captured.tr.cfff', m('div.chess', { style }, board.captured.white.join(''))),
            ]);

        } else {

            return m('div.flex.flex-row.board-bar-' + pos, [
                m(ChessClock, { player }),
                m('div.flex-auto.mh2.saim.f4.c000.ellipsis', game.header.Black),
                m('div.captured.tr.c333', m('div.chess', { style }, board.captured.black.join('') )),
            ]);

        }

    },
});

export default BoardInfo;
