import './game.scss';

import Tools      from '../../tools/tools';
import DB         from '../../services/database';
import Factory    from '../../components/factory';
import FormIllus  from '../../components/forms/form-illus';
import Board      from '../board/board';
import Moves      from './moves';

import { PanelIllus, PanelEcos } from './game-panels';
import { Spacer, GrowSpacer, PageTitle, TextCenter, FlexList } from '../../components/misc';

const Game = Factory.create('Game', {

    view ( vnode ) {

        const { params: { uuid='default', turn=-1 }, className, style } = vnode.attrs;

        // there must be a complete game + turn, //TODO: except deeplink
        const game  = DB.Games.find(uuid);
        const board = DB.Boards.find(uuid);

        if(!game || !board) {
            // game or board are not properly prepared... :(
            // eslint-disable-next-line no-debugger
            debugger;
        }

        const titlePlayers = Tools.Format.titlePlayers(game);
        const lineResult   = Tools.Format.lineResult(game);

        // make selected move visible
        Tools.Games.scrollTurnIntoView(~~turn);

        return innerWidth >= 720

            // desktop, as page no board
            ? m('div.page.game', { className, style }, [
                m(PageTitle,     { className: 'gm-players tc'}, titlePlayers ),
                m(FlexList, [
                    m(FormIllus),
                    m(Moves,         { game }),
                    m(Spacer),
                    m(TextCenter,    { class: 'gm-result', title: 'result termination timecontrol'}, lineResult ),
                    m(GrowSpacer),
                ]),
            ])

            // mobile, as page with inline board
            : m('div.page.game', { className, style }, [
                // m(PageTitle,     { className: 'gm-players tc' }, titlePlayers),
                m(Board,         { params: { uuid, turn: ~~turn } }),
                m(FlexList, [
                    m(Moves,         { game }),
                    m(PanelEcos,     { game }),
                    m(PanelIllus),
                    m(Spacer),
                    m(TextCenter,    { class: 'gm-result', title: 'result termination timecontrol'}, lineResult ),
                    m(GrowSpacer),
                ]),
            ])

        ;

    },
});

export default Game;
