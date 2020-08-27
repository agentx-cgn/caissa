
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

        // new game, TODO: will fail if deeplink
        if (uuid !== lastuuid) {
            DEBUG && console.log('Board.view.newgame', { uuid, turn }, 'last:', lastuuid, lastturn);
            game  = DB.Games.find(uuid);
            board = DB.Boards.createget(uuid);
            DB.Boards.update(uuid, {
                fen :          Tools.Games.fen(game),
                captured :     Tools.Games.captured(game),
            }, true);

            controller = BoardController.init(game, board);

        // new turn
        } else if (turn !== lastturn) {
            DEBUG && console.log('Board.view.newturn', { uuid, turn }, 'last:', lastuuid, lastturn);
            DB.Games.update(uuid, { turn }, true);
            DB.Boards.update(uuid, {
                fen :          Tools.Games.fen(game),
                captured :     Tools.Games.captured(game),
            }, true);

            controller.update();

        // same turn, new state
        } else {
            game  = DB.Games.find(uuid);
            board = DB.Boards.find(uuid);
            DEBUG && console.log('Board.view.nochange', { uuid, turn }, lastuuid, lastturn);

            controller.updateButtons();
            controller.updateProposer();
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
