
import './board.scss';

import { H, $$ } from '../../services/helper';
import Factory from '../../components/factory';
import State   from '../../data/state';
import Config   from '../../data/config';
import GameController from '../../controller/game-controller';
import { Chessboard, COLOR } from '../../../extern/cm-chessboard/Chessboard';
import { GameFlags, GameButtons } from '../../pages/game/game-bars';
import BoardBar  from './board-bar';

const state = State.board;

let chessBoard, width, size;

const Board = Factory.create('Board', {
    onresize (innerWidth, innerHeight) {
        width = innerWidth;
        const availWidth  = innerWidth  - 360;
        const availHeight = innerHeight - 5 * 42;
        const $board = $$('div.chessboard');
        const $content = $$('section.content');

        size = Math.min(availWidth, availHeight);
        $board   && ($board.style.width      = size + 'px');
        $board   && ($board.style.height     = size + 'px');
        $content && ($content.style.maxWidth = size + 'px');

    },
    oncreate () {
        chessBoard = new Chessboard(
            $$('div.chessboard'),
            Config.board.config,
        );
    },
    onupdate ( vnode ) {
        if (chessBoard) {

            chessBoard.setOrientation(state.orientation);
            // chessBoard.enableMoveInput(inputHandler({move: (...args) => {
            //     console.log('board.onupdate.move', ...args);
            // }}, chess), COLOR.white);
            chessBoard.setPosition(state.fen, true);
            console.log('board.onupdate', H.strip(vnode.attrs));

        } else {
            console.log('board.onupdate', 'NO BOARD');

        }
    },
    view () {

        const playerTop = State.board.orientation === 'w' ? 'w' : 'b';
        const playerBot = State.board.orientation === 'b' ? 'w' : 'b';

        return (
            width >= 720
                ? m('[', [
                    m(GameFlags),
                    m(BoardBar, {pos: 'top', player: playerTop}),
                    m('div.chessboard'),
                    m(BoardBar, {pos: 'top', player: playerBot}),
                    m(GameButtons),
                ])
                : m('div.chessboard')
        );

    },
});

export default Board;
