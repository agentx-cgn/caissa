
import * as ls from 'local-storage';
import { H }   from './helper';
import Config  from '../data/config';
// import DB from './database';

const DEBUG = true;

const Table = function (tablename, dump=[], template={}) {

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

    function runUpdates (){
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
            return cache[0] || null;
        },
        find (uuid='0') {
            return cache.find( row => row.uuid === uuid ) || null;
        },
        filter (fn) {
            return cache.filter(fn);
        },
        clear () {
            const length = cache.length;
            cache = dump;
            self.persist();
            isDirty = false;
            DEBUG && console.log('TAB.' + tablename, 'cleared', length, 'rows');
        },
        create (row, force=false) {
            cache.push(row);
            if (force){
                self.persist();
            } else {
                isDirty = true;
            }
            DEBUG && console.log('TAB.' + tablename, 'created', row.uuid);
            return row;
        },
        createget (uuid) {
            let row = self.find(uuid);
            if (row === null) {
                row = H.create(H.deepcopy(template));
                row.uuid = uuid;
                cache.push(row);
                isDirty = true;
            }
            DEBUG && console.log('TAB.' + tablename, 'createget', uuid);
            return row;
        },
        delete (what, force=true) {

            if (typeof what === 'function'){
                self.filter(what).forEach( row => {
                    self.delete(row.uuid, false);
                });
                self.persist();

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
                DEBUG && console.log('TAB.' + tablename, 'deleted', what);
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