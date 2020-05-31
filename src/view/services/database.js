
// https://github.com/bevacqua/local-storage

import * as ls from 'local-storage';
import { H }     from './helper';
import System  from '../data/system';

const options = {
    user: {
        name: 'noiv',
    },
    evaluator: {
        engine:      'stockfish', // not yet an options
        maxthreads:  2,           //
        maxdepth:    5,          //
        maxsecs:     1.0,         // 0.01 60 secs
        divisor:     2,           // not yet an options
    },
    analysis : {
        depth:     5,
        maxpv:     1,
        maxmate:   2,
        multipv:   1,
    },
    board : {
        illustrations : {
            pinning   : true,
            bestmove  : true,
            ponder    : true,
            lastmove  : true,
            availmoves: true,
            attack    : true,
            valid     : true,
        },
    },
    ui : {
        collapsed: {
            'section-left':  false,
        },
        board: {
            decoration: false,          // a1 - h8
            'light-color': '#789',      // fields light
            'dark-color':  '#987',      //
        },
        'vertical-scrolling' : true,    // mousewheel for horizontal scrolling (breaks touchpads)
    },
};

const db =  {
    dump  () { console.log(JSON.stringify(localStorage, null, 2).replace(/\\"/g, '\''));},
    all   () {
        return {
            caissa:  ls('caisssa'),
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
        ls.set('options',   options);
        ls.set('caissa', {
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

            const test = ls('caissa');

            // eslint-disable-next-line no-constant-condition
            if ( !test || false ) {
                db.reset();

            } else {
                const caissa  = ls('caissa');
                const options = ls('options');
                const ago    = H.msecs2human(Date.now() - caissa.lastend);

                caissa.usage    += 1;
                caissa.laststart = Date.now();
                caissa.lastend   = Date.now();
                ls('caissa', caissa);

                console.log('Info   :', 'DB', db.Games.length, 'games', 'user:', options.user.name, 'usage:', caissa.usage, 'last:', ago, 'ago');
            }

        } catch (e) {
            console.warn('db.init.error', e);
            // throw 'DB.init() failed';
        }

    },

    saveOptions (value) {
        ls('options', value);
        console.log('database.options.saved', value);
    },
    get Options () {
        return ls('options');
    },

    caissa (key, value) {
        const caissa = ls('caissa');
        caissa[key] = value;
        ls('caissa', caissa);
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

            console.log('db.games.create', {uuid: game.uuid});
            console.log('db.games.create.header', game.header);

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
                console.warn('DB.game.get', 'uuid', uuid, 'no found');
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
