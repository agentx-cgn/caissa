
import './board.scss';

import Factory           from '../../components/factory';
import DB                from '../../services/database';
import Tools             from '../../tools/tools';
import BoardBar          from './board-bar';
import ChessBoard        from './chessboard';
import BoardController   from './board-controller';

const DEBUG = false;

let lastturn, lastuuid, game, board, controller;

const Board = Factory.create('Board', {
    view ( vnode ) {

        // at start, there is nothing, default is chosen
        let { params: { uuid='default', turn=-1 } } = vnode.attrs;
        turn = ~~turn;

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
            }, true);
            // controller && controller.destroy();
            // controller = new BoardController(game, board);
            // controller && controller.destroy();
            controller = BoardController.init(game, board);

        } else if (turn !== lastturn) {
            // new turn
            DEBUG && console.log('Board.view.newturn', { uuid, turn }, 'last:', lastuuid, lastturn);
            DB.Games.update(uuid, { turn }, true);
            DB.Boards.update(uuid, {
                fen :          Tools.Games.fen(game),
                captured :     Tools.Games.captured(game),
            }, true);
            controller.update();

        } else {
            // means no change...?
            // activated clock
            // click on same move
            game  = DB.Games.find(uuid);
            board = DB.Boards.find(uuid);
            DEBUG && console.log('Board.view.nochange', { uuid, turn }, lastuuid, lastturn);
            controller.updateButtons();
            // eslint-disable-next-line no-debugger
            // debugger;
        }

        lastuuid = uuid;
        lastturn = turn;

        return m('[', [
            m(BoardBar,     { game, board, controller, pos: 'top' }),
            m(ChessBoard,   { game, board, controller }),
            m(BoardBar,     { game, board, controller, pos: 'bot' }),
        ]);

    },
});

export default Board;
