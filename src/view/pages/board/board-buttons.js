
import Caissa       from '../../caissa';
import { H, $$ }    from '../../services/helper';
import Factory      from '../../components/factory';
import DB           from '../../services/database';
import evaluate     from '../game/game-evaluate';
import GameProgress from '../game/game-progress';

const DEBUG = true;

let curGame, curController;

function setTurn (diff) {
    const turn = curGame.turn;
    return (
        diff === '0' ? 0 :
        diff === 'e' ? curGame.moves.length -1 :
        turn === -2 && diff < 0  ? -2 :
        turn === curGame.moves.length -1 && diff > 0  ? curGame.moves.length -1 :
        turn + diff
    );
}

const actions = {
    back  (e) { e.redraw = false; Caissa.route('/game/:turn/:uuid/', {turn: setTurn('0'), uuid: curGame.uuid}, { replace: true }); return H.eat(e);},
    left  (e) { e.redraw = false; Caissa.route('/game/:turn/:uuid/', {turn: setTurn(-1),  uuid: curGame.uuid}, { replace: true }); return H.eat(e);},
    right (e) { e.redraw = false; Caissa.route('/game/:turn/:uuid/', {turn: setTurn(+1),  uuid: curGame.uuid}, { replace: true }); return H.eat(e);},
    fore  (e) { e.redraw = false; Caissa.route('/game/:turn/:uuid/', {turn: setTurn('e'), uuid: curGame.uuid}, { replace: true }); return H.eat(e);},
    pause (e) { e.redraw = false; curController.pause();},
    play  (e) { e.redraw = false; curController.play();},
    eval  (e) { e.redraw = false; evaluate(curGame); return H.eat(e);},
    rotate (e) {
        e.redraw = false;
        const board = DB.Boards.find(curGame.uuid);
        if (board){
            const orientation = board.orientation === 'w' ? 'b' : 'w';
            DB.Boards.update(curGame.uuid, {orientation});
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

const buttons = {
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

const BoardButtons = Factory.create('BoardButtons', {
    view( vnode ) {

        const { game, board, controller } = vnode.attrs;

        DEBUG && console.log('BoardButtons.view', game.uuid, game.mode, game.turn);

        curGame = game;
        curController = controller;

        return m('div.gm-bar', [
            m('div.gm-buttons.f3',
                H.map(buttons, (name, props) => {

                    const className = (
                        name === 'spinner'  &&  board.buttons['evaluate'] ? 'dn'  :
                        name === 'spinner'  && !board.buttons['evaluate'] ? 'dib' :
                        name === 'evaluate' &&  board.buttons['evaluate'] ? 'dib' :
                        name === 'evaluate' && !board.buttons['evaluate'] ? 'dn'  :
                        board.buttons[name] ? 'dib' : 'vih'
                    );

                    return m(props.tag, {title: props.title, onclick: props.onclick, className });
                }),
            ),
            m(GameProgress, { game }),
        ]);
    },
});

export default BoardButtons;


