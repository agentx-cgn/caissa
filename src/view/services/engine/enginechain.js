
import Logger from '../logger';
import Engine from './engine';

const CHAINABLE = [
    'init',
    'setoption',
    'isready',
    'ucinewgame',
    'quit',
    'position',
    'go',
];

export default class EngineChain {

    constructor(engine) {
        if (!engine || !(engine instanceof Engine))
            throw new Error('EngineChain requires a valid Engine.');
        //init
        Logger.log('chain init');
        this._engine = engine;
        this._queue = [];
        //construct chain functions
        CHAINABLE.forEach(funcName => {
            this[funcName] = this.chain(funcName);
        });
    }

    /**
     * Create a new function that puts its invocation to an internal queue.
     * This should not be called unless you're feeling very adventurous.
     * @param {string} funcName - the function to execute on an Engine instance
     * @return {function} - a function that will populate the queue
     * @private
     */
    //returns a function which puts the Engine call and args in the queue
    chain(funcName) {
        const self = this;
        return function() {
            // this._queue.push([::self._engine[funcName], [...arguments]])
            this._queue.push([self._engine[funcName], [...arguments]]);
            if (funcName === 'go') {
                return this.exec();
            } else {
                return this;
            }
        };
    }

    /**
     * Execute each chained item serially. This ends the chain, and returns the
     * last return value from the {@link Engine}.
     * @return {any} - last return value from the queued {@link Engine} method
     */
    async exec() {
        const results = await Promise.mapSeries(this._queue, ([fn, params]) => {
            return fn(...params);
        });
        this._queue = [];
        return results.slice(-1); // was last
    }
}
