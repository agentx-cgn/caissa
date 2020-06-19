
import './board.scss';

import Factory         from '../../components/factory';
import { Nothing }     from '../../components/misc';
import { GameFlags, GameButtons } from '../../pages/game/game-bars';
import DB              from '../../services/database';
import Tools           from '../../tools/tools';
import BoardBar        from './board-bar';
import ChessBoard      from './chessboard';

const DEBUG = false;

let width;

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

        const { params: { uuid, turn } } = vnode.attrs;
        let game, board;

        if (uuid && turn !== undefined){
            game  = DB.Games.find(uuid);
            board = DB.Boards.createget(uuid);
            const fen = Tools.board.game2fen(game);
            DB.Boards.update(uuid, { fen }, true);
        }

        const playerTop = board.orientation === 'w' ? 'w' : 'b';
        const playerBot = board.orientation === 'b' ? 'w' : 'b';

        return !uuid
            ? m(Nothing)
            : !game
                ? m(Error, 'Game not found: ' + uuid)
                : width >= 720
                    ? m('[', [
                        m(GameButtons, { game }),
                        m(BoardBar,    { game, pos: 'top', player: playerTop }),
                        m(ChessBoard,  { game, board }),
                        m(BoardBar,    { game, pos: 'bot', player: playerBot }),
                        m(GameFlags,   { game }),
                    ])
                    : m(ChessBoard, { game, board })
        ;

    },
});

export default Board;
