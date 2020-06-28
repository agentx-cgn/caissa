
import './board.scss';

import Factory           from '../../components/factory';
import DB                from '../../services/database';
import Tools             from '../../tools/tools';
import BoardFlags        from './board-flags';
import BoardButtons      from './board-buttons';
import BoardBar          from './board-bar';
import ChessBoard        from './chessboard';
import BoardController   from './board-controller';

const DEBUG = true;

let lastturn, lastuuid, game, board, controller;

const Board = Factory.create('Board', {
    view ( vnode ) {

        // at start, there is nothing, default is chosen
        let { params: { uuid='default', turn=-1 } } = vnode.attrs;

        // but don't replace current game with default
        uuid === 'default' && lastuuid ? (uuid = lastuuid, turn = lastturn) : (void(0));

        if (uuid !== lastuuid) {
            // new game, TODO: will fail if deeplink
            DEBUG && console.log('Board.view.newgame', { uuid, turn }, 'last:', lastuuid, lastturn);
            game  = DB.Games.find(uuid);
            board = DB.Boards.createget(uuid);
            DB.Boards.update(uuid, {
                fen :          Tools.Games.fen(game),
                captured :     Tools.Games.captured(game),
                illustrations: DB.Options.first['board-illustrations'],
            }, true);
            controller = new BoardController(game, board);

        } else if (turn !== lastturn) {
            // new turn
            DEBUG && console.log('Board.view.newturn', { uuid, turn }, 'last:', lastuuid, lastturn);
            DB.Games.update(uuid, { turn: ~~turn }, true);
            DB.Boards.update(uuid, {
                fen :          Tools.Games.fen(game),
                captured :     Tools.Games.captured(game),
                illustrations: DB.Options.first['board-illustrations'],
            }, true);
            controller.update();

        } else {
            // means no change...?
            DEBUG && console.log('Board.view.nochange', { uuid, turn }, lastuuid, lastturn);
            // click on same move
            // eslint-disable-next-line no-debugger
            // debugger;
        }

        lastuuid = uuid;
        lastturn = turn;

        const playerTop = board.orientation === 'w' ? 'w' : 'b';
        const playerBot = board.orientation === 'b' ? 'w' : 'b';

        return innerWidth >= 720
            // desktop
            ? m('[', [
                m(BoardButtons, { game, board, controller }),
                m(BoardBar,     { game, board, pos: 'top', player: playerTop }),
                m(ChessBoard,   { game, board, controller }),
                m(BoardBar,     { game, board, pos: 'bot', player: playerBot }),
                m(BoardFlags,   { game, board }),
            ])
            // mobile
            : m('[', [
                m(BoardFlags,   { game, board }),
                m(ChessBoard,   { game, board, controller }),
                m(BoardButtons, { game, board, controller }),
            ])
        ;

    },
});

export default Board;
