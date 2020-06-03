
import Caissa from '../caissa';

import DB           from '../services/database';
import { FlexList } from './misc';

// turn becomes plycount later
const GamesList = {
    name: 'Gameslist',
    view ( vnode ) {
        return m(FlexList, {class: 'games-list'},
            vnode.attrs.games.map( game => m(GameEntry, { game, onclick: (e) => {
                e.redraw = false;
                const dbgame = DB.Games.get(game.uuid);
                if ( dbgame ) {
                    Caissa.route('/game/:turn/:uuid/', {uuid: game.uuid, turn: dbgame.turn});
                } else {
                    Caissa.route('/game/:turn/:uuid/', {uuid: DB.Games.create(game).uuid});
                }
            }})),
        );
    },
};

// STR (Seven Tag Roster)
// white:      'White',        // name of white player
// black:      'Black',        // name of black player
// event:      '',
// date:       '',
// site:       '',
// round:      '',
// result:     '',

const GameEntry = {
    name: 'GameEntry',
    view ( vnode ) {

        const { game, onclick } = vnode.attrs;

        let line1 = `${game.white} - ${game.black}`;
        let line2 = `${game.date} ${game.site} ${game.event}`;
        let line3 = '';

        game.result      && (line3 += `<b>${game.result}</b>` + ' ');
        game.termination && (line3 += game.termination + ' ');
        game.timecontrol && (line3 += game.timecontrol + ' ');

        if (line3.length < 18) {
            line2 = line3 + ' ' + line2;
            line3 = '';
        }

        return m('div.game-entry', { onclick }, [
            m('div.game-line1.f4', line1 ),
            m('div.game-line2.f5.ellipsis', m.trust(line2)),
            line3
                ? m('div.game-line3.f5.ellipsis', m.trust(line3))
                : '',
        ]);

    },

};

export default GamesList;
