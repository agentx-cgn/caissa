import './game.scss';

import Tools    from '../../tools/tools';
import DB       from '../../services/database';
import Factory  from '../../components/factory';
import Board    from '../board/board';
import Moves    from './moves';

import { Spacer, GrowSpacer, PageTitle, TextCenter} from '../../components/misc';

const Game = Factory.create('Game', {

    view ( vnode ) {

        const { params: { uuid='default', turn=-1 }, className, style } = vnode.attrs;

        let game, players, resultline;

        // there must be a game, //TODO: except deeplink
        game       = DB.Games.find(uuid);
        players    = game.white  + ' -<br>' + game.black;
        resultline = Tools.games.genResultLine(game);
        DB.Games.update(uuid, { turn: ~~turn });
        Tools.games.scrollTurnIntoView(turn);

        return innerWidth >= 720

            // desktop, as page no board
            ? m('div.page.game', { className, style }, [
                m(PageTitle,     { className: 'gm-players tc'}, m.trust(players) ),
                m(Moves,         { game }),
                m(Spacer),
                m(TextCenter,    { class: 'gm-result', title: 'result termination timecontrol'}, resultline ),
                m(GrowSpacer),
            ])

            // mobile, as page with inline board
            : m('div.page.game', { className, style }, [
                m(PageTitle,     { className: 'gm-players tc' }, m.trust(players)),
                m(Board,         { params: { uuid, turn } }),
                m(Moves,         { game }),
                m(Spacer),
                m(Spacer),
                m(TextCenter,    { class: 'gm-result', title: 'result termination timecontrol'}, resultline ),
                m(GrowSpacer),
            ]);

    },
});

export default Game;
