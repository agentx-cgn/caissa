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

const flagger = function (controller) {

    let cTransp, cActive, cPlayer, f = {}, chess = controller.chess;

    // f.turn  = controller.turn === -2 ? null : chess.turn();
    f.over  = chess.game_over();
    f.chck  = chess.in_check();
    f.mate  = chess.in_checkmate();
    f.draw  = chess.in_draw();
    f.stal  = chess.in_stalemate();
    f.insu  = chess.insufficient_material();
    f.repe  = chess.in_threefold_repetition();

    if (controller.turn === -2){
        // empty board
        cTransp  = cActive = cPlayer = 'ctb10';

    } else {
        cTransp  = 'ctb10 bg-trans';
        cActive  = 'ctr20';
        cPlayer  = controller.turn % 2 ? 'ceee' : 'c333';
    }

    return {
        turn: {tag: 'i.gm-flag.fa.fa-chess-queen',   class: f.over ? cTransp : cPlayer,  title: 'turn'},
        chck: {tag: 'i.gm-flag.fa.fa-plus',          class: f.chck ? cPlayer : cTransp,  title: 'check'},
        mate: {tag: 'i.gm-flag.fa.fa-hashtag',       class: f.mate ? cPlayer : cTransp,  title: 'checkmate'},

        draw: {tag: 'i.gm-flag.fa.fa-handshake',     class: f.draw ? cActive : cTransp,  title: 'draw'},
        stal: {tag: 'div.gm-flag.dib.mh1',           class: f.stal ? cActive : cTransp,  title: 'stalemate'},
        insu: {tag: 'i.gm-flag.fa.fa-hands',         class: f.insu ? cActive : cTransp,  title: 'isufficient material'},
        repe: {tag: 'i.gm-flag.fa.fa-list-ol',       class: f.repe ? cActive : cTransp,  title: 'threefold repetition'},
        over: {tag: 'i.gm-flag.fa.fa-chess-board',   class: f.over ? cActive : cTransp,  title: 'game over'},
    };
};

const BoardFlags = Factory.create('BoardFlags', {

    view( { attrs: { controller } }) {

        return (
            m('div.gm-bar',
                m('div.gm-flags',
                    H.map(flagger(controller), (_, props) => {
                        return m(props.tag, {
                            title: props.title,
                            class: props.class,
                        });
                    }),
                ),
            )
        );

    },

});

export default BoardFlags;
