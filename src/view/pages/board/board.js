
import './board.scss';

// import { $$ } from '../../services/helper';
// import Config   from '../../data/config';
// import GameController from '../../controller/game-controller';
// import { Chessboard, COLOR } from '../../../extern/cm-chessboard/Chessboard';

import Factory         from '../../components/factory';
import { Nothing }     from '../../components/misc';
import { GameFlags, GameButtons } from '../../pages/game/game-bars';
import DB              from '../../services/database';
import Tools           from '../../tools/tools';
import BoardBar        from './board-bar';
import ChessBoard      from './chessboard';

let width;

const Board = Factory.create('Board', {
    onresize (innerWidth) {
        width = innerWidth;
    },
    oncreate () {
        console.log('board.oncreate');
    },
    onupdate () {
        console.log('board.onupdate');
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
                        m(BoardBar,    { game, pos: 'top', player: playerTop }),
                        m(ChessBoard,  { game }),
                        m(BoardBar,    { game, pos: 'bot', player: playerBot }),
                        m(GameFlags,   { game }),
                        m(GameButtons, { game }),
                    ])
                    : m(ChessBoard, { game })
        ;

    },
});

export default Board;
