
import Caissa       from '../caissa';
import DB           from '../services/database';
import { H }        from '../services/helper';
import Tools        from '../tools/tools';
import Config       from '../data/config';
import Factory      from './factory';
import { FlexList } from './misc';

const GamesList = Factory.create('GamesList', {
    view ( vnode ) {
        return m(FlexList, { class: 'games-list' },
            vnode.attrs.games.map( game => m(GameEntry, { game, onclick: (e) => {

                if (!DB.Games.exists(game.uuid)) {
                    game = H.clone(Config.templates.game, game);
                    // spend games a prototype
                    game.moves = Array.from(game.moves);
                    Tools.Games.updateMoves(game);
                    DB.Games.create(game, true);
                    DB.Games.update(game.uuid, { turn: game.moves.length -1 }, true);
                    DB.Boards.create(H.clone(Config.templates.board, { uuid: game.uuid }));
                }
                e.redraw = false;
                Caissa.route('/game/:turn/:uuid/', { uuid: game.uuid, turn: game.moves.length -1 });

            }})),
        );
    },
});

const GameEntry = Factory.create('GameEntry', {
    view ( vnode ) {

        const { game, onclick } = vnode.attrs;

        let line1 = `${game.header.White} - ${game.header.Black}`;
        let line2 = `${game.date} ${game.header.Site} ${game.header.Event}`;
        let line3 = '';

        game.header.Result      && (line3 += `<b>${game.header.Result}</b>` + ' ');
        game.header.Termination && (line3 += game.header.Termination + ' ');
        game.header.TimeControl && (line3 += game.header.TimeControl + ' ');
        game.timestamp          && (line3 += H.date2isoUtc(new Date(game.timestamp)) + ' ');
        game.plycount           && (line3 += game.plycount + ' plies ');

        //TODO: no magic numbers
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

});

export default GamesList;
