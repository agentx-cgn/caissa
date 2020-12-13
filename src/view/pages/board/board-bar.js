
import Factory           from '../../components/factory';
import BoardFlags        from './board-flags';
import BoardButtons      from './board-buttons';
import BoardInfo         from './board-info';

// const DEBUG = false;

const BoardBar = Factory.create('BoardBar', {
    view ( vnode ) {

        const { pos, game, board, controller } = vnode.attrs;
        const playerBot = board.orientation;
        const playerTop = board.orientation === 'w' ? 'b' : 'w';

        return pos === 'top'
            ? m('div.board-bar top', [
                m(BoardFlags,   { controller }),
                m(BoardInfo,    { game, board, pos, player: playerTop }),
            ])
            : m('div.board-bar bottom', [
                m(BoardInfo,    { game, board, pos, player: playerBot }),
                m(BoardButtons, { game, board, controller }),
            ])
        ;
    },
});

export default BoardBar;
