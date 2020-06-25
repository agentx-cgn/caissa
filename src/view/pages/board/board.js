
import './board.scss';

import Factory           from '../../components/factory';
import DB                from '../../services/database';
// import { H }             from '../../services/helper';
// import Config            from '../../data/config';
import Tools             from '../../tools/tools';
import BoardFlags        from './board-flags';
import BoardButtons      from './board-buttons';
import BoardBar          from './board-bar';
import ChessBoard        from './chessboard';
// import SFBoardController from './sf-board-controller';
import BoardController   from './board-controller';
// import { Nothing }       from '../../components/misc';

const DEBUG = true;

let lastturn, lastuuid, game, board, controller, fen, captured;

// function start (game) {
//     return game.mode === 'x-x';
// }

function Controller (game, board) {
    return (
        game.mode === 'x-x' ? new BoardController(game, board) :
        game.mode === 'h-h' ? new BoardController(game, board) :
        // game.mode === 'h-s' ? new SFBoardController(game, board) :
        // game.mode === 's-h' ? new SFBoardController(game, board) :
        // game.mode === 's-s' ? new SFBoardController(game, board) :
        console.log('wtf')
    );
}

const Board = Factory.create('Board', {
    view ( vnode ) {

        // at start, there is nothing, default is chosen
        let { params: { uuid='default', turn=-1 } } = vnode.attrs;
        const illustrations = DB.Options.first['board-illustrations'];

        // but don't replace current game with default
        uuid === 'default' && lastuuid ? (uuid = lastuuid, turn = lastturn) : (void(0));

        if (uuid !== lastuuid) {
            // new game, TODO: will fail if deeplink
            DEBUG && console.log('Board.view.newgame', { uuid, turn }, lastuuid, lastturn);
            game  = DB.Games.find(uuid);
            board = DB.Boards.createget(uuid, { illustrations });
            fen   = Tools.Games.fen(game);
            captured = Tools.Board.captured(fen);
            DB.Boards.update(uuid, { fen, captured }, true);
            controller = Controller(game, board);
            lastuuid = uuid;
            lastturn = turn;

        } else if (turn !== lastturn) {
            // new turn
            DEBUG && console.log('Board.view.newturn', { uuid, turn }, lastuuid, lastturn);
            DB.Games.update(uuid, { turn: ~~turn });
            fen = Tools.Games.fen(game);
            captured = Tools.Board.captured(fen);
            DB.Boards.update(uuid, { fen, captured }, true);
            board = DB.Boards.find(uuid);
            controller.update();
            lastturn = turn;

        } else {
            // means no change...?
            DEBUG && console.log('Board.view.nochange', { uuid, turn }, lastuuid, lastturn);
            // click on same move
            // eslint-disable-next-line no-debugger
            // debugger;
        }

        const playerTop = board.orientation === 'w' ? 'w' : 'b';
        const playerBot = board.orientation === 'b' ? 'w' : 'b';

        return innerWidth >= 720
            // desktop
            ? m('[', [
                m(BoardButtons, { game, board }),
                m(BoardBar,     { game, board, pos: 'top', player: playerTop }),
                m(ChessBoard,   { game, board, controller }),
                m(BoardBar,     { game, board, pos: 'bot', player: playerBot }),
                m(BoardFlags,   { board }),
            ])
            // mobile
            : m('[', [
                m(BoardFlags,   { board }),
                m(ChessBoard,   { game, board, controller }),
                m(BoardButtons, { game, board }),
            ])
        ;

    },
});

export default Board;
