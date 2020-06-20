import './game.scss';

import Tools             from '../../tools/tools';
// import { H }             from '../../services/helper';
import DB                from '../../services/database';
import Factory           from '../../components/factory';
import Moves             from './moves';
import GameFlags         from './game-flags';
import GameButtons       from './game-buttons';
import { Spacer, GrowSpacer, PageTitle, TextCenter, Error, Nothing} from '../../components/misc';

let width;

const Game = Factory.create('Game', {

    onresize (innerWidth) {
        width = innerWidth;
    },
    view ( vnode ) {

        const { params: { uuid, turn }, className, style } = vnode.attrs;

        let game, players, resultline;

        if (uuid && turn !== undefined){

            game = DB.Games.find(uuid);

            if (game) {
                DB.Games.update(uuid, { turn: ~~turn });
                players    = game.white  + ' -<br>' + game.black;
                resultline = Tools.games.genResultLine(game);
                Tools.games.scrollTurnIntoView(turn);
            }
        }

        return !uuid
            ? m(Nothing)
            : !game
                ? m('div.page.game', { className, style }, m(Error, 'Game not found: ' + uuid))
                : width >= 720
                    ? m('div.page.game', { className, style }, [
                        m(PageTitle,     { className: 'gm-players tc'}, m.trust(players) ),
                        m(Moves,         { game }),
                        m(Spacer),
                        m(Spacer),
                        m(TextCenter,    { class: 'gm-result', title: 'result termination timecontrol'}, resultline ),
                        m(GrowSpacer),
                    ])
                    : m('div.page.game', { className, style }, [
                        m(PageTitle,     { className: 'gm-players tc' }, m.trust(players)),
                        m(Moves,         { game }),
                        m(Spacer),
                        m(GameFlags,     { game }),
                        m(Spacer),
                        m(GameButtons,   { game }),
                        m(Spacer),
                        m(TextCenter,    { class: 'gm-result', title: 'result termination timecontrol'}, resultline ),
                        m(GrowSpacer),
                    ]);

    },
});

export default Game;
