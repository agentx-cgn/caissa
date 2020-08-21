
import Caissa              from '../../caissa';
import DB                  from '../../services/database';
import { H }               from '../../services/helper';
import System              from '../../data/system';
import Pool                from '../../services/engine/pool';
import GameProgress        from './game-progress';

export default function evaluate (game, onfinish) {

    const t0         = Date.now();
    const bigStep    = 4;
    const smallStep  = ( 99 - 3 * bigStep * threads ) / game.moves.length;
    const divisor    = 2;
    const options    = DB.Options.first['game-evaluator'];
    const depth      = ~~options.maxdepth;
    const threads    = ~~options.maxthreads;
    const partitions = H.partitions(game.moves, threads);

    let counter      = 0;
    let progress     = 0;

    game.score.maxcp   = 0;
    game.score.maxmate = 0;

    const conditions = {
        depth,
        time:  options.maxsecs,
    };

    const updateProgress = (step) => {
        progress += step;
        GameProgress.render(progress);
    };

    const callback = move => {
        counter += 1;
        updateProgress(smallStep);
        game.score.maxcp = Math.abs(move.cp) > game.score.maxcp ? move.cp : game.score.maxcp;
        if(!(divisor % counter)){
            //TODO: use dom
            Caissa.redraw();
        }
    };
    const finish = slots => {

        slots.forEach( slot => slot.idle = true );
        GameProgress.render(0);

        console.log('game.evaluator.finish',
            game.moves.length, 'moves in',
            Date.now() - t0, 'msecs',
            `${threads}/${System.threads} threads`,
            'depth:',    conditions.depth,
            'maxScrore:', game.score.maxcp,
            slots,
        );

        onfinish();

    };

    console.log('game.evaluator.start', threads, '/', System.threads, 'depth', conditions.depth);

    GameProgress.render(bigStep);

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
