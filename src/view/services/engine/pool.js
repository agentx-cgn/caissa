
import System from '../../data/system';
import Engine from './engine';

const maxSlots = System.threads -1;
const Slots    = new Array(maxSlots).fill(null).map( (_, idx) => ({idx, owner: '', idle: true, engine: null}) );

const sorter = (a, b) => {

    // idle + engine    > first
    // idle + no engine > second
    // rest
    // return -1 puts a before b

    return (
        (a.idle &&  a.engine) &&  (b.idle &&  b.engine) ? 0 :
        (a.idle && !a.engine) &&  (b.idle && !b.engine) ? 0 :
        (!a.idle)             &&  (!b.idle)             ? 0 :
        (a.idle && a.engine)  ? -1 :
        (b.idle && b.engine)  ?  1 :
        (b.idle && !a.engine) ? -1 :
        (b.idle && !b.engine) ?  1 :
        0
    );

    // return (
    //     (a && a.idle) && (b.engine === null)   ? -1 :
    //     (a && a.idle) && (b && !b.idle)        ? -1 :
    //     (b && b.idle) && (a.engine === null)   ?  1 :
    //     (b && b.idle) && (a && !a.idle)        ?  1 :
    //     0 // not idle last
    // );
};

const prepare = (candidate) => {

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

};

function debSlots (prefix) {
    return (slot) => {
        console.log(prefix, slot);
        return slot;
    };
}

const Pool = {

    request (amount) {

        const result = Slots
            .filter( item => item.idle )
            .map(debSlots('F'))
            // .sort( sorter )
            // .map(debSlots('S'))
            .slice( 0, amount )
            .map( prepare )
            // .map(debSlots('X'))
        ;

        // debug
        if (result.length !== amount) {
            console.warn('pool.request.failed', result.length, '/', amount, Slots, result);
        } else {
            result.forEach( slot => console.log('Pool.requested.res', slot));
        }

        return result;

    },

    release (slots) {
        console.log('Pool.release', slots);
        slots.forEach( slot => {
            slot.idle  = true;
            slot.owner = '';
        });
        console.log('Pool.release', Slots);
    },

};

export default Pool;
