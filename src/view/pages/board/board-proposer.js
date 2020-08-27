import Pool from '../../services/engine/pool';

// let promSlot = null;

const Proposer = {

    initialization: null,

    init() {
        return Proposer.initialization = new Promise( resolve => {

            const temp = Pool.request(1)[0];

            temp.engine.init()
                .then( engine => {
                    return engine.isready();
                })
                .then( engine => {
                    return engine.ucinewgame();
                })
                .then( engine => {
                    engine.slot.owner  = 'proposer';
                    console.log('Proposer.resolving', engine.slot);
                    resolve(engine.slot);
                })
            ;

        });
    },

    async stop () {
        const slot = await Proposer.initialization;
        Pool.release([slot]);
        Proposer.initialization = null;
        console.log('Proposer.stopped', slot);
    },

    async propose(fen, conditions={ depth: 10, maxtime: 1 }) {

        const slot = await Proposer.initialization;

        await slot.engine.isready();
        await slot.engine.position(fen);

        const result = await slot.engine.go(conditions);

        return { bestmove: result.bestmove, ponder: result.ponder };

    },

};

export default Proposer;
