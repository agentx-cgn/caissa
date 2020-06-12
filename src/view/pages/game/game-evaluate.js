
import Caissa              from '../../caissa';
import DB                  from '../../services/database';
import { H }               from '../../services/helper';
import System              from '../../data/system';
import Pool                from '../../services/engine/pool';
import { GameProgressBar } from '../game/game-bars';

export default function evaluate (state) {

    const t0         = Date.now();
    const bigStep    = 4;
    const smallStep  = ( 99 - 3 * bigStep * threads ) / state.moves.length;
    const divisor    = 2;
    const options    = DB.Options['game-evaluator'];
    const depth      = ~~options.maxdepth;
    const threads    = ~~options.maxthreads;
    const partitions = H.partitions(state.moves, threads);

    let counter      = 0;
    let progress     = 0;

    state.score.maxcp   = 0;
    state.score.maxmate = 0;
    state.buttons.evaluate = false;
    state.buttons.spinner  = true;

    const conditions = {
        depth,
        time:  options.maxsecs,
    };

    const updateProgress = (step) => {
        progress += step;
        GameProgressBar.render(progress);
    };

    const callback = move => {
        counter += 1;
        updateProgress(smallStep);
        state.score.maxcp = Math.abs(move.cp) > state.score.maxcp ? move.cp : state.score.maxcp;
        if(!(divisor % counter)){
            //TODO: use dom
            Caissa.redraw();
        }
    };
    const finish = slots => {

        state.buttons.evaluate = true;
        state.buttons.spinner  = false;

        slots.forEach( slot => slot.idle = true );
        GameProgressBar.render(0);
        Caissa.redraw();

        console.log('game.evaluator.finish',
            state.moves.length, 'moves in',
            Date.now() - t0, 'msecs',
            `${threads}/${System.threads} threads`,
            'depth:', conditions.depth,
            slots,
        );
    };

    console.log('game.evaluator.start', threads, '/', System.threads, 'depth', conditions.depth);

    GameProgressBar.render(bigStep);

    Promise.all( Pool.request(threads).map( (slot, idx) => {

        updateProgress(bigStep);

        return slot.engine.init()
            .then( engine => {
                updateProgress(bigStep);
                return engine.evaluateMoves(partitions[idx], conditions, callback);
            })
            .then( engine => {
                updateProgress(bigStep);
                return engine.slot;
            })
        ;
    })).then(finish);

}
