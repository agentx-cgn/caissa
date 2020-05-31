
import './analyzer.scss';

import System    from '../../data/system';
import { H, $$ } from '../../services/helper';
import State        from '../../data/state';
import BoardBar  from './board/board-bar';

function wheeler (e) {
    let item = document.querySelector('div.analyzer');
    if (e.deltaY > 0) item.scrollLeft += 64;
    else item.scrollLeft -= 64;
}

export default {

    onremove ( /* vnode */ ) {
        $$('section.section-center').removeEventListener('wheel', wheeler);
        document.removeEventListener('dblclick', H.eat);
    },

    oncreate ( /* vnode */ ) {

        if (System.touch) {
            $$('div.analyzer').style.scrollSnapType            = 'x mandatory';
            $$('section.section-left').style.scrollSnapAlign   = 'start';
            $$('section.section-center').style.scrollSnapAlign = 'center';

        } else {
            $$('section.section-center').addEventListener('wheel', wheeler);

        }

        document.addEventListener('dblclick', H.eat);

    },

    view ( vnode ) {

        const [ leftComponent, centerComponent ] = vnode.children;
        const { uuid, turn, mode, idx, fen } = vnode.attrs;

        const playerTop = State.board.orientation === 'w' ? 'w' : 'b';
        const playerBot = State.board.orientation === 'b' ? 'w' : 'b';

        return m('div.analyzer.flex.flex-row.h-100.overflow-y-hidden.overflow-x-auto.noselect', [

            m('section.section-left.relative.flex.flex-column.overflow-y-hidden.bg-aaa',
                [
                    m(leftComponent, {uuid, turn, mode, idx, fen}),
                ]),

            m('section.section-center.relative.flex.flex-column.bg-ccc', [
                m(BoardBar, {pos: 'top', player: playerTop}),
                m(centerComponent),
                m(BoardBar, {pos: 'bot', player: playerBot}),
            ]),

        ]);

    },

};
