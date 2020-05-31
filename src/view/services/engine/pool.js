
import System from '../../data/system';
import Engine from './engine';

const maxSlots = System.threads -1;
const slots    = new Array(maxSlots).fill(null).map( (_, idx) => ({idx, idle: null, engine: null}) );
const pool     = {

    sorter (a, b) {
        return (
            (a && a.idle) && (b.engine === null)   ? -1 : 
            (a && a.idle) && (b && !b.idle)        ? -1 : 
            (b && b.idle) && (a.engine === null)   ?  1 : 
            (b && b.idle) && (a && !a.idle)        ?  1 : 
            a === null  || b === null              ?  0 :
            0 // not idle last
        );
    },

    prepare (candidate) {

        if (candidate.engine === null){
            candidate.engine = new Engine(candidate);
            candidate.idle   = false;
            return candidate;

        } else if (candidate.idle) {
            candidate.idle = false;
            return candidate;

        } else {
            console.log('WTF');
        }

    },
    
    request (amount) {

        const temp = slots
            .filter( item => item.engine === null || item.idle)
            .sort( pool.sorter )
            .slice( 0, amount )
            .map( pool.prepare )
        ;

        if (temp.length !== amount) {
            console.warn('pool.request.failed', temp.length, '/', amount, slots, temp);
        }

        return temp;

    },

};

export { pool as default };
