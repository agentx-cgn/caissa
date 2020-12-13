
import System from '../../data/system';
import Engine from './engine';

const maxSlots = System.threads -1;
const slotPool = new Array(maxSlots).fill(null).map( (_, idx) => ({idx, owner: '', idle: true, engine: null}) );

const DEBUG = true;

const Pool = {

    request (owner, amount) {

        const candidates = slotPool
            .filter( item => item.idle )
            .slice( 0, amount )
            .map( slot => {

                if (slot.engine === null){
                    slot.engine = new Engine(slot);
                }

                slot.idle  = false;
                slot.owner = owner;

                return slot;
            })
        ;

        // debug
        if (candidates.length !== amount) {
            console.warn('pool.request.failed', candidates.length, '/', amount, slotPool, candidates);
        } else {
            DEBUG && candidates.forEach( slot => console.log('Pool.requested.res', slot));
        }

        return Promise.all(candidates.map( slot => {

            return slot.engine.init()
                .then( engine => {
                    return engine.isready();
                })
                .then( engine => {
                    return engine.ucinewgame();
                })
                .then( () => slot )
            ;

        }));

    },

    release (slots) {
        DEBUG && console.table(slots);
        slots.forEach( slot => {
            slot.idle  = true;
            slot.owner = '';
        });

    },

};

export default Pool;
