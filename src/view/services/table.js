
import * as ls from 'local-storage';
import { H }   from './helper';
import Config  from '../data/config';

const DEBUG = true;

const Table = function (tablename, dump=[], tableTemplate={}) {

    let self, cache, interval, isDirty = true;
    let data = ls(tablename);

    if (!data){
        ls(tablename, dump);
        cache = dump;
        DEBUG && console.log('TAB.' + tablename, 'initialized', dump);

    } else {
        cache = ls(tablename);
        DEBUG && console.log('TAB.' + tablename, 'loaded', cache);

    }

    function runUpdates () {
        interval = setInterval( () => {
            if (isDirty){
                self.persist();
            }
        }, Config.database.updateInterval || 60 * 1000);
    }
    runUpdates();

    return self = H.create({
        dump () {
            console.log(JSON.stringify(ls(tablename), null, 2));
        },
        toggleUpdates () {
            interval ? clearInterval(interval) : runUpdates();
        },
        get length () {
            return cache.length;
        },
        get list () {
            return cache;
        },
        get first () {
            return cache[0] || undefined;
        },
        find (uuid) {
            return cache.find( row => row.uuid === uuid ) || undefined;
        },
        filter (fn) {
            return cache.filter(fn);
        },
        clear () {
            const length = cache.length;
            cache = dump;
            self.persist();
            isDirty = false;
            DEBUG && console.log('TAB.' + tablename, 'cleared, with', length, 'rows');
        },
        create (row, force=false) {
            cache.push(row);
            if (force){
                self.persist();
            } else {
                isDirty = true;
            }
            DEBUG && console.log('TAB.' + tablename, 'created', row.uuid, force);
            return row;
        },
        createget (uuid, template={}) {
            let row = self.find(uuid);
            if (row === undefined) {
                row = H.create(tableTemplate, template);
                row.uuid = uuid;
                cache.push(row);
                isDirty = true;
            }
            DEBUG && console.log('TAB.' + tablename, 'createget', uuid, H.shrink(row));
            return row;
        },
        delete (what, force=true) {

            if (typeof what === 'function'){
                self.filter(what).forEach( row => {
                    self.delete(row.uuid, false);
                });
                force && self.persist();

            } else if (typeof what === 'string'){
                const idx = cache.findIndex( row => row.uuid === what);
                if (idx > -1) {
                    cache.splice(idx, 1);
                    if (force){
                        self.persist();
                    } else {
                        isDirty = true;
                    }
                } else {
                    throw `ERROR ! DB.${tablename}.delete failed. ${what} not found`;
                }
                DEBUG && console.log('TAB.' + tablename, 'deleted', what.toString());
            }
        },
        update (uuid, diff, force=false) {
            const row  = self.find(uuid);
            if (row !== null) {
                H.deepassign(row, diff);
                if (force){
                    self.persist();
                } else {
                    isDirty = true;
                }
            } else {
                throw `ERROR ! DB.${tablename}.update failed. ${uuid} not found`;
            }
            DEBUG && console.log('TAB.' + tablename, 'updated', force ? 'force': '', uuid, H.shrink(diff));
            return row;
        },
        persist () {
            if (ls(tablename, cache)){
                isDirty = false;
                // DEBUG && console.log('TAB.' + tablename, 'saved', cache.length, 'rows');
            } else {
                throw `ERROR ! DB.${tablename}.persist failed`;
            }
        },

    });

};

export default Table;
