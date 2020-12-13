
// https://github.com/bevacqua/local-storage

import * as ls from 'local-storage';
import Caissa  from '../caissa';
import System  from '../data/system';
import Options from '../data/options';
import Config  from '../data/config';
import { H }   from './helper';
import Table   from './table';

const SCHEME = '2020-07-09a';

const tables = 'Boards Games Options Usage'.split(' ');
const dumps  = {
    Usage:   [{uuid: '0', laststart: Date.now(), lastend: Date.now(), usage: 0}],
    Options: [H.clone(Options)],
    Boards : [H.clone(Config.templates.board, { uuid: 'default' })],
    Games :  [H.clone(Config.templates.default)],
};

const DB =  {
    scheme:    SCHEME,
    dump  () {
        const dump = JSON.stringify(DB.all(), null, 2);
        return dump.replace(/\\"/g, '\'');
    },
    all   () {
        return {
            scheme:  ls('scheme'),
            usage:   ls('Usage'),
            options: ls('Options'),
            boards:  ls('Boards'),
            games:   ls('Games'),
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
        Caissa.route('/menu/');
        location.reload();

    },
    persist () {
        tables.forEach(tablename => {
            DB[tablename].persist(true);
        });
        console.log('DB.persisted', (DB.size() / 1024).toFixed(2) + ' KB');
    },

    size () {

        let total = 0, len, key;

        for(key in localStorage){
            // eslint-disable-next-line no-prototype-builtins
            if(!localStorage.hasOwnProperty(key)){continue;}
            len = ((localStorage[key].length + key.length) * 2);
            total += len;
            // console.log(key.substr(0,50) + ' = '+ (_xLen/1024).toFixed(2)+' KB');
        }

        return total;

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

                Promise.all([navigator.storage.estimate(), navigator.storage.persisted()])
                    .then( ([estimate, persisted]) => {
                        console.log('Info   :', 'DB', {quota: estimate.quota, usage: estimate.usage, persisted});
                    })
                ;

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
