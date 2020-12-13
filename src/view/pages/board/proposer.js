import Pool from '../../services/engine/pool';

const DEBUG = false;

const Proposer = {

    enabled:        false,    // flag
    initialization: null,     // or a promise resolving to slots

    start() {

        Proposer.enabled = true;

        return Proposer.initialization = new Promise( resolve => {

            Pool.request('proposer', 1)
                .then( slots => {
                    resolve(slots);
                    DEBUG && console.log('Proposer.resolved', slots);
                })
            ;

        });

    },

    async stop () {

        Proposer.enabled = false;

        const slots = await Proposer.initialization;

        Pool.release(slots);
        Proposer.initialization = null;

        DEBUG && console.log('Proposer.stopped', slots);

    },

    async propose(fen, conditions={ depth: 10, maxtime: 1 }) {

        const slots = await Proposer.initialization;
        const slot  = slots[0];

        await slot.engine.isready();
        await slot.engine.position(fen);

        const result = await slot.engine.go(conditions);

        DEBUG && console.log('Proposer.proposed', result);

        return { bestmove: result.bestmove, ponder: result.ponder };

    },

};

export default Proposer;
