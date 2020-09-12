import EventEmitter from 'es-event-emitter';
import Logger from '../logger';
// import EngineChain from './enginechain';
import { REGEX } from './constants';
import {
    goCommand,
    initReducer,
    goReducer,
    parseInfo,
    parseBestmove,
} from './parser/parser';

import Worker     from 'worker-loader!../../../worker/stockfish.asm';

// import Worker     from 'worker-loader!../../../worker/stockfish.wasm';
// import Worker from '../../../worker/stockfish.wasm';
// import gh from '../../../worker/stockfish.asm'

const DEBUG = false;

export default class Engine {

    constructor(slot) {
        this.slot    = slot,
        this.options = new Map();
        this.worker  = new Worker();
    }

    connect () {
        this.worker.onmessage      = this.listener;
        this.worker.onerror        = this.errorListener;
        this.worker.onmessageerror = this.errorListener;
    }

    // eslint-disable-next-line no-unused-vars
    listener ({ data }) {
        DEBUG && console.log('engine.listener', data);
    }
    errorListener ( e ) {
        console.warn('engine.errorListener', e);
    }

    write(msg) {
        Logger.log('engine', `${this.slot.name || 'unknown'}.${this.slot.idx}.write: ` + msg);
        this.worker.postMessage(msg);
    }

    async getBufferUntil(condition) {

        const lines = [];
        let listener, rejector;

        const promise = new Promise((resolve, reject) => {

            listener = ({ data }) => {
                data = data.trim();
                if (data){
                    lines.push(data);
                    if (condition(data)) {
                        return resolve();
                    }
                }
            };

            rejector = ( e ) => {
                console.warn('engine.getBufferUntil', e);
                reject();
            };

            this.worker.onmessage      = listener;
            this.worker.onerror        = rejector;
            this.worker.onmessageerror = rejector;

        });

        await promise;

        //cleanup
        this.connect();

        return lines;
    }

    async init() {

        this.connect();
        this.write('uci');

        //parse lines
        const lines = await this.getBufferUntil(line => line === 'uciok');
        const { id, options } = lines.reduce(initReducer, {
            id: {},
            options: {},
        });

        //set id and options
        id && ( this.id = id );
        if (options) {
            Object.keys(options).forEach(key => {
                this.options.set(key, options[key]);
            });
        }

        return this;

    }

    // async terminate() {

    //     if (!this.worker)
    //         throw new Error('cannot call "terminate()": worker not running');

    //     this.worker.terminate();
    //     return this;
    // }

    async isready() {

        this.write('isready');
        await this.getBufferUntil(line => line === 'readyok');

        return this;

    }

    async sendCmd(command) {

        if (!this.worker)
            throw new Error(`cannot call "${command}()": worker not running`);

        //send cmd to engine
        this.write(command);

        //return after ready - avoids pitfalls for commands
        //that dont return a response
        return this.isready();
    }

    async setoption(name, value) {

        //construct command
        let command = 'name ' + name;

        if (typeof value !== 'undefined') {
            command += ` value ${value.toString()}`;
        }

        //send and wait for response
        await this.sendCmd('setoption ' + command);
        this.options.set(name, value);

        return this;

    }

    async ucinewgame() {
        return this.sendCmd('ucinewgame');
    }

    async ponderhit() {
        return this.sendCmd('ponderhit');
    }

    async position(fen, moves='') {

        //can be startpos or fen string
        let cmd = fen === 'startpos' ? 'startpos' : 'fen ' + fen;

        //add moves if provided
        if (moves.length) {
            cmd += (' moves ' + moves.join(' '));
        }

        return this.sendCmd('position ' + cmd);

    }

    async go(options) {

        if (!this.worker)
            throw new Error('cannot call "go()": worker not running');

        //construct command and send
        const command = goCommand(options);
        this.write(command);

        //parse lines
        const lines = await this.getBufferUntil(line => REGEX.bestmove.test(line));
        const result = lines.reduce(goReducer, {
            bestmove: null,
            info: [],
        });

        return result;

    }

    goInfinite(options = {}) {

        if (!this.worker)
            throw new Error('cannot call "goInfinite()": worker not running');

        //set up emitter
        this.emitter = new EventEmitter();
        const listener = buffer => {
            buffer
                .split(/\r?\n/g)
                .filter(line => !!line.length)
                .forEach(line => {
                    const info = parseInfo(line);
                    if (info) return this.emitter.emit('data', info);
                    const bestmove = parseBestmove(line);
                    if (bestmove) return this.emitter.emit('data', bestmove);
                });
        };
        // eslint-disable-next-line no-debugger
        debugger;
        options.infinite = true;
        const command = goCommand(options);
        this.proc.stdout.on('data', listener);
        this.emitter.on('stop', () => {
            this.proc.stdout.removeListener('data', listener);
        });

        this.write(command);
        return this.emitter;

    }

    async stop() {

        if (!this.emitter)
            throw new Error('cannot call "stop()": goInfinite() is not in progress');

        //send the stop message & end goInfinite() listener
        this.write('stop');
        this.emitter.emit('stop');

        //same idea as go(), only we expect just bestmove line here
        const lines  = await this.getBufferUntil(line => REGEX.bestmove.test(line));
        const result = lines.reduce(goReducer, {
            bestmove: null,
            info: [],
        });

        return result;

    }

    async evaluate (move, conditions={depth: 3, maxtime: 1}) {

        await this.isready();
        await this.position(move.fen);

        const result = await this.go(conditions);
        const info   = result.info.slice(-1)[0]; // should be max depth

        // console.log(result);

        info.score.unit === 'cp'   && (move.cp   = Math.abs(info.score.value));
        info.score.unit === 'mate' && (move.mate = info.score.value);
        move.pv = info.pv;

    }

    async evaluateMoves (moves, conditions, callback) {

        for (let i=0; i< moves.length; i++) {
            await this.evaluate(moves[i], conditions);
            callback(moves[i]);
        }

        return this;

    }

}
