
import { H }        from '../../services/helper';
import Factory      from '../../components/factory';
import GameProgress from '../game/game-progress';

const DEBUG = false;

let game, board, controller;

const actions = {
    back  (e)  { e.redraw = false; controller.step( '0') ;},
    left  (e)  { e.redraw = false; controller.step( -1 ) ;},
    right (e)  { e.redraw = false; controller.step( +1 ) ;},
    fore  (e)  { e.redraw = false; controller.step( 'e') ;},
    pause (e)  { e.redraw = false; controller.pause();},
    play  (e)  { e.redraw = false; controller.play();},
    eval  (e)  { e.redraw = false; controller.evaluate();},
    rotate (e) { e.redraw = false; controller.rotate();},
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

        ({ game, board, controller } = vnode.attrs );

        DEBUG && console.log('BoardButtons.view', game.uuid, game.mode, game.turn);

        return m('div.gm-bar', [
            m('div.gm-buttons',
                H.map(buttons, (name, props) => {
                    const className = (
                        board.buttons[name] === null  ? 'disabled dn'    :
                        board.buttons[name] === true  ? 'enabled  ctw80' :
                        board.buttons[name] === false ? 'disabled ctb10' :
                        'darkred'
                    );
                    return m(props.tag, { title: props.title, onclick: props.onclick, className });
                }),
            ),
            m(GameProgress, { game }),
        ]);
    },
});

export default BoardButtons;
