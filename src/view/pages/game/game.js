import './game.scss';

import Tools      from '../../tools/tools';
import DB         from '../../services/database';
import Factory    from '../../components/factory';
import FormIllus  from '../../components/form-illus';
import Board      from '../board/board';
import Moves      from './moves';

import { Spacer, GrowSpacer, PageTitle, TextCenter } from '../../components/misc';

const Game = Factory.create('Game', {

    view ( vnode ) {

        const { params: { uuid='default', turn=-1 }, className, style } = vnode.attrs;

        // there must be a complete game + turn, //TODO: except deeplink
        const game       = DB.Games.find(uuid);
        const board      = DB.Boards.find(uuid);

        if(!game || !board) {
            // game of board are not properly prepared... :(
            // eslint-disable-next-line no-debugger
            debugger;
        }

        // bc board.buttons.actions
        DB.Games.update(game.uuid, { turn: ~~turn });

        const titlePlayers = Tools.Format.titlePlayers(game);
        const lineResult   = Tools.Format.lineResult(game);

        //TODO: only if large Moves
        Tools.Games.scrollTurnIntoView(~~turn);

        return innerWidth >= 720

            // desktop, as page no board
            ? m('div.page.game', { className, style }, [
                m(PageTitle,     { className: 'gm-players tc'}, titlePlayers ),
                m(FormIllus,     { board }),
                m(Moves,         { game }),
                m(Spacer),
                m(TextCenter,    { class: 'gm-result', title: 'result termination timecontrol'}, lineResult ),
                m(GrowSpacer),
            ])

            // mobile, as page with inline board
            : m('div.page.game', { className, style }, [
                m(PageTitle,     { className: 'gm-players tc' }, titlePlayers),
                m(Board,         { params: { uuid, turn: ~~turn } }),
                m(Moves,         { game }),
                m(Spacer),
                m(TextCenter,    { class: 'gm-result', title: 'result termination timecontrol'}, lineResult ),
                m(GrowSpacer),
            ])

        ;

    },
});

export default Game;
