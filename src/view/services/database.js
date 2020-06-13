
// https://github.com/bevacqua/local-storage

import * as ls from 'local-storage';
import { H }   from './helper';
import System  from '../data/system';
import Options from '../data/options';


const db =  {
    dump  () { console.log(JSON.stringify(localStorage, null, 2).replace(/\\"/g, '\''));},
    all   () {
        return {
            usage:   ls('usage'),
            options: ls('options'),
            plays:   ls('plays'),
            games:   ls('games'),
        };
    },
    reset () {

        console.log('Info   :', 'Caissa first use, resetting DB...');

        ls.clear();
        ls.set('plays',     []);
        ls.set('games',     []);  // games are imported/hardcoded
        ls.set('options',   Options);
        ls.set('usage', {
            laststart: Date.now(),
            lastend:   Date.now(),
            usage:     0,
        });

    },

    init () {
        try {
            if (!System.localStorage) {
                console.error('Info   :', 'BE', 'localStorage not available');
            }

            const test = ls('usage');

            // eslint-disable-next-line no-constant-condition
            if ( !test || false ) {
                db.reset();

            } else {
                const usage  = ls('usage');
                const options = ls('options');
                const ago    = H.msecs2human(Date.now() - usage.lastend);

                usage.usage    += 1;
                usage.laststart = Date.now();
                usage.lastend   = Date.now();
                ls('usage', usage);

                console.log('Info   :', 'DB', db.Games.length, 'games', 'user:', options['user-data'].name, 'usage:', usage.usage, 'last:', ago, 'ago');
            }

        } catch (e) {
            console.warn('db.init.error', e);
            // throw 'DB.init() failed';
        }

    },

    Usage (key, value) {
        const usage = ls('usage');
        usage[key] = value;
        ls('usage', usage);
    },

    XOptions : {

    },

    get Options () {
        return ls('options');
    },
    updateOption (diff) {
        const options = ls('options');
        Object.assign(options, diff);
        ls('options', options);
        console.log('updateOption', H.shrink(diff));
    },

    Forms : {
        save (group, formdata) {
            const t0 = Date.now();
            const options  = ls('options');
            options[group] = formdata;
            ls('options', options);
            console.log('DB.Forms.save', group, formdata, Date.now() - t0, 'msecs');
        },
    },


    Plays : {
        get list () {
            return ls('plays');
        },
        get length () {
            return ls('plays').length;
        },
        clear () {
            ls('plays', []);
        },
        save (plays) {
            !ls('plays', plays) && console.warn('db.plays.save.failed', plays);
        },
        create (play) {
            const plays = ls('plays');
            // const play  = { ...params };

            const length = plays.push(play);
            db.Plays.save(plays);

            console.log('db.plays.created', {uuid: play.uuid}, 'having', length);

            return play;
        },
        update (uuid, diff) {
            const plays = ls('plays');
            const play  = plays.find( play => play.uuid === uuid);
            Object.assign(play, diff);
            db.Plays.save(plays);
            return play;

        },
    },

    Games: {
        clear () {
            ls.set('games', []);
        },
        save (games) {
            !ls('games', games) && console.warn('db.games.save.failed', games);

        },
        create (game) {

            const games = ls('games');
            const duplicate = games.find( g => g.uuid === game.uuid);

            if (duplicate) {
                db.Games.update(duplicate.uuid, game);
                console.log('db.games.overwrote', {uuid: game.uuid});
                return game;
            }

            games.push(game);
            db.Games.save(games);

            false && console.log('db.games.create', {uuid: game.uuid});
            false && console.log('db.games.create.header', game.header);

            return game;

        },
        // delete (uuid) {

        // },
        update (uuid, diff) {
            const games = ls('games');
            const game = games.find( game => game.uuid === uuid);
            Object.assign(game, diff);
            db.Games.save(games);
            return game;

        },
        get (uuid) {
            const games = ls('games');
            const game = games.find( game => game.uuid === uuid );
            if (!game) {
                // console.warn('DB.game.get', 'uuid', uuid, 'not found');
                return null;
            }
            return game;

        },
        list () {
            // console.log(ls('games'));
            return ls('games');
        },
        get length () {
            return ls('games').length;
        },

    },

};

db.init();
export { db as default } ;
