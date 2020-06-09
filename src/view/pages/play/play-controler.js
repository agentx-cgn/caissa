
import Chess        from 'chess.js';
import Clock        from '../../components/chessclock';
import Pool         from '../../services/engine/pool';
import Dispatcher   from '../../services/dispatcher';
import { H }        from '../../services/helper';

const fire = Dispatcher.connect({ name: 'play-controller',

});

const controller = {
    doprocess : false,
    slots     : [],
    chess: new Chess(),
    stop () {
        controller.process = false;
    },
    start (timecontrol) {

        //Mmh
        controller.slots.forEach(slot => slot.idle = true);

        return Promise.all( Pool.request(2).map( (slot) => {
            return slot.engine.init()
                .then( engine => {
                    return engine.isready();
                })
                .then( engine => {
                    return engine.ucinewgame();
                })
                .then( () => {
                    return slot;
                })
            ;
        })).then( slots => {

            controller.slots   = slots;
            controller.process = true;
            controller.chess   = new Chess();
            controller.white.engine = slots[0].engine;
            controller.black.engine = slots[1].engine;

            slots[0].name = 'white';
            slots[1].name = 'black';

            fire('board', 'fen', [ controller.chess.fen() ]);

            Clock.start(timecontrol);
            Clock.over = (whitetime, blacktime) => {
                controller.finish('play.time.over', whitetime, blacktime);
            };
            controller.white.tomove();

        });

    },
    finish (reason, ...data) {

        console.log('controller.finish', reason, ...data);
        controller.process = false;
        controller.slots.forEach(slot => slot.idle = true);

        return false;

    },
    validates (result) {


        const move = result.bestmove;
        const valid = controller.chess.move(move, { sloppy: true });

        if (controller.chess.game_over()) {
            return controller.finish('game.over', valid);

        } else if (!valid) {
            if (move === '(none)'){
                return controller.finish('game.over', move);
            } else {
                return controller.finish('illegal move', move);
            }

        }

        fire('board', 'fen', [ controller.chess.fen() ]);

        return controller.process;

    },
    white:{
        engine: null,
        async tomove () {

            await H.sleep(1000);
            await controller.white.engine.position(controller.chess.fen());
            const result = await controller.white.engine.go({depth: 4});

            if (controller.validates(result)){
                Clock.whiteclick();
                controller.black.tomove();
            }

        },
    },
    black:{
        engine: null,
        async tomove () {

            await H.sleep(1000);
            await controller.black.engine.position(controller.chess.fen());
            const result = await controller.black.engine.go({depth: 4});

            if (controller.validates(result)){
                Clock.blackclick();
                controller.white.tomove();
            }

        },
    },
};

export { controller as default };


