/*
    https://fontawesome.com/cheatsheet/free/solid
    https://fontawesome.com/icons?d=gallery&m=free
    fa-chess-board
    fa-chess-queen +
    fa-crown
    fa-check
    fa-cross for mate
    fa-exclamation for check
    fa-download
    fa-filter
    fa-handshake
    fa-delicious
    fa-square/stop
    fa-expand/compress/expand-alt
    fa-compress-alt
    fa-less-than  // direction
    fa-list-ol  3 rep

*/

import { H }    from '../../services/helper';
import Factory  from '../../components/factory';

const flagger = function (f) {

    const cTrans   = 'c999 bg-999';
    const cActive  = 'dark-red';
    const cPlayer  = f.turn === 'w' ? 'ceee' : 'c333';

    return {
        turn: {tag: 'i.gm-flag.fa.fa-chess-queen',   class: f.over ? cTrans  : cPlayer, title: 'turn'},
        chck: {tag: 'i.gm-flag.fa.fa-plus',          class: f.chck ? cPlayer : cTrans,  title: 'check'},
        mate: {tag: 'i.gm-flag.fa.fa-hashtag',       class: f.mate ? cPlayer : cTrans,  title: 'checkmate'},
        draw: {tag: 'i.gm-flag.fa.fa-handshake',     class: f.draw ? cActive : cTrans,  title: 'draw'},
        stal: {tag: 'div.gm-flag.dib.mh1',           class: f.stal ? cActive : cTrans,  title: 'stalemate'},
        insu: {tag: 'i.gm-flag.fa.fa-hands',         class: f.insu ? cActive : cTrans,  title: 'isufficient material'},
        repe: {tag: 'i.gm-flag.fa.fa-list-ol',       class: f.repe ? cActive : cTrans,  title: 'threefold repetition'},
        over: {tag: 'i.gm-flag.fa.fa-chess-board',   class: f.over ? cActive : cTrans,  title: 'game over'},
    };
};

const BoardFlags = Factory.create('BoardFlags', {
    view( vnode ) {
        return (
            m('div.gm-bar',
                m('div.gm-flags',
                    H.map(flagger(vnode.attrs.board.flags), (_, props) => {
                        return m(props.tag, {title: props.title, class: props.class});
                    }),
                ),
            )
        );
    },
});

export default BoardFlags;
