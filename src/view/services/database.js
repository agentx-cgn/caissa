
// https://github.com/bevacqua/local-storage

import * as ls from 'local-storage';
import System  from '../data/system';
import Options from '../data/options';
import Config  from '../data/config';
import { H }   from './helper';
import Table   from './table';

const SCHEME = '2020-06-17b';

const tables = 'Boards Games Plays Options Usage'.split(' ');
const dumps  = {
    Usage:   [{uuid: '0', laststart: Date.now(), lastend: Date.now(), usage:0}],
    Options: [Options],
    Boards : [],
    Games :  [],
    Plays :  [],
};

const DB =  {
    scheme:    SCHEME,
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

            } else {

                if (DB.scheme !== ls('scheme')){
                    console.warn('WARN   :', 'New Scheme detected, please reset DB');
                }

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
            console.error('DB.init.error', e);
            // throw 'DB.init() failed';
        }

    },

};

DB.init();
export default DB;
