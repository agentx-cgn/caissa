
// https://github.com/bevacqua/local-storage

import * as ls from 'local-storage';
import System  from '../data/system';
import Options from '../data/options';
import Config  from '../data/config';
import { H }   from './helper';
import Table   from './table';

const tables = 'Boards Games Plays Options Usage'.split(' ');
const dumps  = {
    Usage:   [{uuid: '0', laststart: Date.now(), lastend: Date.now(), usage:0}],
    Options: [Options],
    Boards : [],
    Games :  [],
    Plays :  [],
};

const DB =  {
    scheme: '2020-06-17a',
    dump  () { console.log(JSON.stringify(localStorage, null, 2).replace(/\\"/g, '\''));},
    all   () {
        return {
            scheme:  ls('scheme'),
            usage:   ls('usage'),
            options: ls('options'),
            boards:  ls('boards'),
            plays:   ls('plays'),
            games:   ls('games'),
        };
    },
    reset () {

        console.log('Info   :', 'Caissa first use, resetting DB...', 'scheme', DB.scheme);

        ls.clear();
        ls('scheme', DB.scheme);
        tables.forEach(tablename => {
            DB[tablename] = Table(
                tablename,
                dumps[tablename],
                Config.tableTemplates[tablename],
            );
        });

    },

    init () {
        try {
            if (!System.localStorage) {
                console.error('Info   :', 'BE', 'localStorage not available');
            }

            const test = ls('Usage');

            // eslint-disable-next-line no-constant-condition
            if ( !test || false ) {
                DB.reset();

            } else if (DB.scheme !== ls('scheme')){
                console.warn('WARN   :', 'New Scheme detected, please reset DB');

            } else {

                tables.forEach(tablename => {
                    DB[tablename] = Table(
                        tablename,
                        dumps[tablename],
                        Config.tableTemplates[tablename],
                    );
                });

                const usage   = DB.Usage.first;
                const options = DB.Options.first;
                const ago     = H.msecs2human(Date.now() - usage.lastend);

                usage.usage    += 1;
                usage.laststart = Date.now();
                DB.Usage.update('0', {usage: usage.usage, laststart: Date.now()});

                console.log('Info   :', 'DB', DB.scheme, DB.Games.length, 'games', 'user:', options['user-data'].name, 'usage:', usage.usage, 'last:', ago, 'ago');
            }

        } catch (e) {
            console.warn('db.init.error', e);
            // throw 'DB.init() failed';
        }

    },

    // Usage (key, value) {
    //     const usage = ls('usage');
    //     usage[key] = value;
    //     ls('usage', usage);
    // },

    // get Options () {
    //     return ls('options');
    // },
    // updateOption (diff) {
    //     const options = ls('options');
    //     Object.assign(options, diff);
    //     ls('options', options);
    //     console.log('updateOption', H.shrink(diff));
    // },

    // Forms : {
    //     save (group, formdata) {
    //         const t0 = Date.now();
    //         const options  = ls('options');
    //         options[group] = formdata;
    //         ls('options', options);
    //         console.log('DB.Forms.save', group, formdata, Date.now() - t0, 'msecs');
    //     },
    // },

    // Boards : {
    //     createget (uuid) {
    //         let board = db.Boards.find(uuid);
    //         if (!board) {
    //             board = H.deepcopy(Config.boardstatetemplate);
    //             board.uuid = uuid;
    //         }
    //         return board;
    //     },

    //     find (uuid) {
    //         return ls('boards').find( board => board.uuid === uuid);
    //     },
    //     update (uuid, diff) {
    //         const boards = ls('boards');
    //         const board  = boards.find( board => board.uuid === uuid);
    //         Object.assign(board, diff);
    //         db.Boards.save(boards);
    //         return board;
    //     },
    // },

    // Plays : {
    //     get list () {
    //         return ls('plays');
    //     },
    //     get length () {
    //         return ls('plays').length;
    //     },
    //     clear () {
    //         ls('plays', []);
    //     },
    //     save (plays) {
    //         !ls('plays', plays) && console.warn('db.plays.save.failed', plays);
    //     },
    //     create (play) {
    //         const plays = ls('plays');
    //         // const play  = { ...params };

    //         const length = plays.push(play);
    //         db.Plays.save(plays);

    //         console.log('db.plays.created', {uuid: play.uuid}, 'having', length);

    //         return play;
    //     },
    //     update (uuid, diff) {
    //         const plays = ls('plays');
    //         const play  = plays.find( play => play.uuid === uuid);
    //         Object.assign(play, diff);
    //         db.Plays.save(plays);
    //         return play;

    //     },
    // },

    // Games: {
    //     clear () {
    //         ls.set('games', []);
    //     },
    //     save (games) {
    //         !ls('games', games) && console.warn('db.games.save.failed', games);

    //     },
    //     createget (g) {

    //         let game = ls('games').find( game => game.uuid === g.uuid );
    //         if (!game) {
    //             // console.warn('DB.game.get', 'uuid', uuid, 'not found');
    //             return db.Games.create(g);
    //         }
    //         return game;


    //     },
    //     create (game) {

    //         const games = ls('games');
    //         const duplicate = games.find( g => g.uuid === game.uuid);

    //         if (duplicate) {
    //             db.Games.update(duplicate.uuid, game);
    //             console.log('db.games.overwrote', {uuid: game.uuid});
    //             return game;
    //         }

    //         games.push(game);
    //         db.Games.save(games);

    //         true && console.log('db.games.create', {uuid: game.uuid, turn: game.turn });
    //         true && console.log('db.games.create.header', game.header);

    //         return game;

    //     },
    //     // delete (uuid) {

    //     // },
    //     update (uuid, diff) {
    //         const games = ls('games');
    //         const game = games.find( game => game.uuid === uuid);
    //         Object.assign(game, diff);
    //         db.Games.save(games);
    //         return game;

    //     },
    //     get (uuid) {
    //         const games = ls('games');
    //         const game = games.find( game => game.uuid === uuid );
    //         if (!game) {
    //             // console.warn('DB.game.get', 'uuid', uuid, 'not found');
    //             return null;
    //         }
    //         return game;

    //     },
    //     list () {
    //         // console.log(ls('games'));
    //         return ls('games');
    //     },
    //     get length () {
    //         return ls('games').length;
    //     },

    // },

};

DB.init();
export default DB;
