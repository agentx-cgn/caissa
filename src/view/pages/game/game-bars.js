
import Caissa       from '../../caissa';
// import { COLOR }    from '../../../extern/cm-chessboard/Chessboard';
import { H, $$ }    from '../../services/helper';
// import State        from '../../data/state';
import evaluate     from './game-evaluate';
import Factory      from '../../components/factory';
import DB           from '../../services/database';

let curgame;

let progressdom;

const GameProgressBar = Factory.create('GameProgressBar', {
    render ( width ) {
        progressdom && (progressdom.innerHTML = `<div class="gm-progress" style="width:${width}%">`);
    },
    oncreate ({ dom }) {
        progressdom = dom;
    },
    view () {
        return m('div.gm-bar-progress');
    },
})
;

function setTurn (diff) {
    const turn = curgame.turn;
    return (
        diff === '0' ? 0 :
        diff === 'e' ? curgame.moves.length -1 :
        turn === -2 && diff < 0  ? -2 :
        turn === curgame.moves.length -1 && diff > 0  ? curgame.moves.length -1 :
        turn + diff
    );
}

const actions = {
    back  (e) { e.redraw = false; Caissa.route('/game/:turn/:uuid/', {turn: setTurn('0'), uuid: curgame.uuid}, { replace: true }); return H.eat(e);},
    left  (e) { e.redraw = false; Caissa.route('/game/:turn/:uuid/', {turn: setTurn(-1),  uuid: curgame.uuid}, { replace: true }); return H.eat(e);},
    right (e) { e.redraw = false; Caissa.route('/game/:turn/:uuid/', {turn: setTurn(+1),  uuid: curgame.uuid}, { replace: true }); return H.eat(e);},
    fore  (e) { e.redraw = false; Caissa.route('/game/:turn/:uuid/', {turn: setTurn('e'), uuid: curgame.uuid}, { replace: true }); return H.eat(e);},
    pause (e) { e.redraw = false; return H.eat(e);},
    play  (e) { e.redraw = false; return H.eat(e);},
    eval  (e) { e.redraw = false; evaluate(curgame); return H.eat(e);},
    rotate (e) {
        e.redraw = false;
        const board = DB.Boards.find(curgame.uuid);
        if (board){
            const orientation = board.orientation === 'w' ? 'b' : 'w';
            DB.Boards.update(curgame.uuid, {orientation});
            Caissa.redraw();
        }
    },
    toggle (e) {
        // TODO: use state.ui
        $$('section.section-left').classList.toggle('collapsed');
        e.redraw = false;
        return H.eat(e);
    },
};

// function wheeler (e) {
//     (e.deltaY > 0) ? actions.left() : actions.right();
// }

const buttons = {
    // minimize: {onclick: actions.toggle, title: '', tag: 'i.gm-button.fa.fa-compress-alt'},
    // maximize: {onclick: actions.toggle, title: '', tag: 'i.gm-button.fa.fa-compress-alt'},
    backward: {onclick: actions.back,   title: '', tag: 'i.gm-button.fa.fa-step-backward'},
    left:     {onclick: actions.left,   title: '', tag: 'i.gm-button.fa.fa-chevron-left'},
    play:     {onclick: actions.play,   title: '', tag: 'i.gm-button.fa.fa-play'},
    pause:    {onclick: actions.pause,  title: '', tag: 'i.gm-button.fa.fa-pause'},
    right:    {onclick: actions.right,  title: '', tag: 'i.gm-button.fa.fa-chevron-right'},
    forward:  {onclick: actions.fore,   title: '', tag: 'i.gm-button.fa.fa-step-forward'},
    evaluate: {onclick: actions.eval,   title: '', tag: 'i.gm-button.fa.fa-poll-h'},
    spinner:  {onclick: () => {},       title: '', tag: 'i.gm-spinner.fa.fa-spinner.fa-spin'},
    rotate:   {onclick: actions.rotate, title: '', tag: 'i.gm-button.fa.fa-sync-alt'},
};

const GameButtons = Factory.create('GameButtons', {
    view( vnode ) {
        const { game } = vnode.attrs;
        curgame = game;
        return m('div.gm-bar', [
            m('div.gm-buttons.f3',
                H.map(buttons, (name, props) => {

                    const className = (
                        name === 'spinner'  &&  game.buttons['evaluate'] ? 'dn'  :
                        name === 'spinner'  && !game.buttons['evaluate'] ? 'dib' :
                        name === 'evaluate' &&  game.buttons['evaluate'] ? 'dib' :
                        name === 'evaluate' && !game.buttons['evaluate'] ? 'dn'  :
                        game.buttons[name] ? 'dib' : 'vih'
                    );

                    return m(
                        props.tag,
                        {title: props.title, onclick: props.onclick, className },
                    );
                }),
            ),
            m(GameProgressBar, { game }),
        ]);
    },
});

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

const flagger = function (flags) {

    const f        = flags;
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

const GameFlags = Factory.create('GameFlags', {
    view( vnode ) {
        const { game } = vnode.attrs;
        return (
            m('div.gm-bar',
                m('div.gm-flags',
                    H.map(flagger(game.flags), (_, props) => {
                        return m(props.tag, {title: props.title, class: props.class});
                    }),
                ),
            )
        );
    },
});

export {
    GameButtons,
    GameProgressBar,
    GameFlags,
};

