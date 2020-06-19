
import './board.scss';

import Factory         from '../../components/factory';
import DB              from '../../services/database';
import Config          from '../../data/config';
import Tools           from '../../tools/tools';
import GameFlags       from '../game/game-flags';
import GameButtons     from '../game/game-buttons';
import BoardBar        from './board-bar';
import ChessBoard      from './chessboard';

const DEBUG = true;

let width, lastturn, lastuuid='', game, board;

// called by layout id 720 as Section

const Board = Factory.create('Board', {
    onresize (innerWidth) {
        width = innerWidth;
    },
    oncreate () {
        DEBUG && console.log('board.oncreate');
    },
    onupdate () {
        DEBUG && console.log('board.onupdate');
    },
    view ( vnode ) {

        // keep the last board through page changes unless new uuid
        // if no last uuid show empty board, ready to interact

        DEBUG && console.log('board.view', vnode.attrs.params);

        const { params: { uuid, turn } } = vnode.attrs;

        if (!uuid && !lastuuid) {
            // happens at start
            game  = DB.Games.createget('empty');
            board = DB.Boards.createget('empty');
            const fen = Config.fens.start;
            DB.Boards.update('empty', { fen }, true);
            // lastuuid = 'empty';

        } else if (!uuid && lastuuid) {
            // there was a game, but user clicks menu
            game  = DB.Games.find(lastuuid);
            board = DB.Boards.createget(lastuuid);
            const fen = Tools.board.game2fen(game);
            DB.Boards.update(lastuuid, { fen }, true);

        } else if (uuid !== lastuuid || turn !== lastturn) {
            // new game or new turn
            game  = DB.Games.find(uuid);
            board = DB.Boards.createget(uuid);
            const fen = Tools.board.game2fen(game);
            DB.Boards.update(uuid, { fen }, true);
            lastuuid = uuid;
            lastturn = turn;

        } else {
            // eslint-disable-next-line no-debugger
            // means no change...?
            // debugger;
        }

        const playerTop = board.orientation === 'w' ? 'w' : 'b';
        const playerBot = board.orientation === 'b' ? 'w' : 'b';

        return width >= 720
            ? m('[', [
                m(GameButtons, { game, board }),
                m(BoardBar,    { game, board, pos: 'top', player: playerTop }),
                m(ChessBoard,  { game, board }),
                m(BoardBar,    { game, board, pos: 'bot', player: playerBot }),
                m(GameFlags,   { game, board }),
            ])
            : m(ChessBoard, { game, board })
        ;

    },
});

export default Board;
