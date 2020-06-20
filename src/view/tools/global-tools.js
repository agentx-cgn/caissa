
import Config  from '../data/config';
import { H }   from '../services/helper';
import DB      from '../services/database';

const Tools = {

    // m.buildPathname
    interpolate (route, params) {
        let target = route;
        H.each(params, (key, val) => {
            target = target.replace(':' + key, val);
        });
        return target;
    },

    genGameHash (game) {
        const unique = JSON.stringify({
            1: game.header.White,
            2: game.header.Black,
            3: game.header.Event,
            4: game.header.Site,
            5: game.header.Date,
            6: game.header.Result,
            7: game.pgn.slice(0, 20),
        });
        return H.hash(unique);
    },

    // matches depth to string with ranges
    resolveDifficulty (value) {

        const diffs = Config.plays.difficulties;

        let hit = diffs['0'];
        let result = hit;

        H.range(0, 31).forEach( num => {
            hit    = diffs[num] ? diffs[num] : hit;
            result = ~~num <= value ? hit : result;
        });

        return result;

    },

    resolvePlayers (game) {

        const opponents = Config.opponents;
        const username = DB.Options.first['user-data'].name;

        const w = game.mode[0];
        const b = game.mode[2];

        return {
            white: opponents[w] === 'Human' ? username : opponents[w],
            black: opponents[b] === 'Human' ? username : opponents[b],
        };

    },

    createPlayTemplate (playtemplate, formdata) {

        const play = {
            ...Config.templates.game,
            ...playtemplate,
            ...formdata,
            ...Tools.resolvePlayers(playtemplate),
            difficulty: Tools.resolveDifficulty(formdata.depth),
        };

        delete play.autosubmit;
        delete play.group;
        delete play.subline;
        delete play.submit;

        play.turn = -1;
        play.uuid = H.hash(JSON.stringify(play));

        console.log('createPlayTemplate', play);

        return play;

    },

};

export {Tools as default};
