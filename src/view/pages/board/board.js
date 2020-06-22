
import './board.scss';

import Factory           from '../../components/factory';
import DB                from '../../services/database';
import Config            from '../../data/config';
import Tools             from '../../tools/tools';
import BoardFlags        from './board-flags';
import BoardButtons      from './board-buttons';
import BoardBar          from './board-bar';
import ChessBoard        from './chessboard';
import SFBoardController from './sf-board-controller';
import BoardController   from './board-controller';
// import { Nothing }       from '../../components/misc';

const DEBUG = true;

let width, lastturn, lastuuid='', game, board, controller;
let fen, boardTemplate;

function Controller (game, board) {
    return (
        game.mode === 'h-h' ? new BoardController(game, board) :
        game.mode === 'h-s' ? new SFBoardController(game, board) :
        game.mode === 's-h' ? new SFBoardController(game, board) :
        game.mode === 's-s' ? new SFBoardController(game, board) :
        console.log('wtf')
    );
}

const Board = Factory.create('Board', {
    oncreate () {
        DEBUG && console.log('board.oncreate');
    },
    onupdate ( vnode ) {
        DEBUG && console.log('board.onupdate', vnode);
    },
    view ( vnode ) {

        // keep the last board through page changes unless new uuid
        // if no last uuid show default board, ready to interact

        DEBUG && console.log('board.view', vnode.attrs.params);

        const { params: { uuid, turn } } = vnode.attrs;

        if (!uuid && !lastuuid) {
            // happens at start
            boardTemplate = { illustrations: DB.Options.first['board-illustrations'] };
            game  = DB.Games.createget('default');
            board = DB.Boards.createget('default', boardTemplate);
            fen   = Config.fens.start;
            DB.Boards.update('default', { fen }, true);
            controller = Controller(game, board);
            // lastuuid = 'default';

        } else if (!uuid && lastuuid) {
            // there was a game, but user strays away
            boardTemplate = { illustrations: DB.Options.first['board-illustrations'] };
            game  = DB.Games.find(lastuuid);
            board = DB.Boards.createget(lastuuid, boardTemplate);
            fen   = Tools.board.game2fen(game);
            DB.Boards.update(lastuuid, { fen }, true);
            controller = Controller(game, board);

        } else if (uuid !== lastuuid) {
            // new game
            boardTemplate = { illustrations: DB.Options.first['board-illustrations'] };
            game  = DB.Games.find(uuid);
            board = DB.Boards.createget(uuid, boardTemplate);
            fen   = Tools.board.game2fen(game);
            DB.Boards.update(uuid, { fen }, true);
            controller = Controller(game, board);
            lastuuid = uuid;
            lastturn = turn;

        } else if (turn !== lastturn) {
            // new turn
            DB.Games.update(uuid, { turn: ~~turn });
            fen = Tools.board.game2fen(game);
            DB.Boards.update(uuid, { fen }, true);
            controller.update();
            lastturn = turn;

        } else {
            // means no change...?
            // click on same move
            // eslint-disable-next-line no-debugger
            // debugger;
        }

        const playerTop = board.orientation === 'w' ? 'w' : 'b';
        const playerBot = board.orientation === 'b' ? 'w' : 'b';

        return width >= 720
            // desktop
            ? m('[', [
                m(BoardButtons, { board }),
                m(BoardBar,     { game, board, pos: 'top', player: playerTop }),
                m(ChessBoard,   { game, board, controller }),
                m(BoardBar,     { game, board, pos: 'bot', player: playerBot }),
                m(BoardFlags,   { board }),
            ])
            // mobile
            : m('[', [
                m(BoardFlags,   { board }),
                m(ChessBoard,   { game, board, controller }),
                m(BoardButtons, { board }),
            ])
        ;

    },
});

export default Board;
