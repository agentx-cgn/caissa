
import './board.scss';

// import { $$ } from '../../services/helper';
import Factory from '../../components/factory';
import State   from '../../data/state';
// import Config   from '../../data/config';
// import GameController from '../../controller/game-controller';
// import { Chessboard, COLOR } from '../../../extern/cm-chessboard/Chessboard';
import { GameFlags, GameButtons } from '../../pages/game/game-bars';
import BoardBar  from './board-bar';
import ChessBoard from './chessboard';

// const state = State.board;

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

        const { route, params } = vnode.attrs;

        const playerTop = State.board.orientation === 'w' ? 'w' : 'b';
        const playerBot = State.board.orientation === 'b' ? 'w' : 'b';

        return (
            width >= 720
                ? m('[', [
                    m(GameFlags,   { route, params }),
                    m(BoardBar,    { pos: 'top', player: playerTop }),
                    m(ChessBoard,  { route, params }),
                    m(BoardBar,    { pos: 'bot', player: playerBot }),
                    m(GameButtons, { route, params }),
                ])
                : m(ChessBoard, { route, params })
        );

    },
});

export default Board;
