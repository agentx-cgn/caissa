
import { H } from '../services/helper';
import Tools  from '../tools/tools';
import Config from './config';
import System from './system';

const FormDefinitions = function ( formdata ) {

    return [
        // play defaults s-s
        {
            category: 'play defaults s-s',
            title:    'Options',
            sort: 1,
            active: true,
            controls: [
                {
                    sort: 2,
                    active: true,
                    caption: 'Depth',
                    type:    'range',
                    value: () => formdata.depth,
                    datalist: (function () {
                        return H.range(1, 31).map( n => {
                            return !(n % 5) ? {value: n, label: n} : {value: n};
                        });
                    })(),
                    attributes: {
                        oninput: (e) => {
                            const value     = ~~e.target.value;
                            formdata.depth      = value;
                            formdata.difficulty = Tools.resolveDifficulty(value);
                        },
                        min: 1, max: 30, step: 1,
                        list: 'dl-stockfish-depth',
                        style: 'max-width: 100%; width: 100%; margin:0; padding: 0; vertical-align: middle;',
                    },
                },
                {
                    sort: 3,
                    active: true,
                    caption: 'Difficulty',
                    type:    'none',
                    value: () => formdata.difficulty + ' (' + formdata.depth + ')',
                },
                {
                    sort: 5,
                    active: true,
                    caption: 'Timecontrol',
                    type:    'selectindexed-split',
                    options:  Config.timecontrols,
                    value: () => formdata.timecontrol,
                    attributes: {
                        onchange: (e) => {
                            formdata.timecontrol = Config.timecontrols.find( tc => tc.idx = ~~e.target.value);
                            // console.log('options.api.change', e.target.value, formdata.api);
                        },
                    },
                },
                {
                    active:  true, sort: 10,
                    caption: 'Openings',
                    type:    'search',
                    options:  Config.timecontrols,
                    value: () => formdata.timecontrol,
                    attributes: {
                        onchange: (e) => {
                            formdata.timecontrol = Config.timecontrols.find( tc => tc.idx = ~~e.target.value);
                        },
                    },
                },
                {
                    active:  true, sort: 20,
                    caption: 'Timestamp',
                    type:    'timestamp',
                    ontick:   () => formdata.timestamp = new Date(),
                },
                {
                    active:  true, sort: 30,
                    caption: 'Play',
                    type:    'button',
                    attributes: {
                        onclick: () => {
                            formdata.submit(formdata);
                        },
                    },
                },
            ],
        },

        // play defaults h-s
        {
            category: 'play defaults h-s',
            title:    'Options',
            sort: 1,
            active: true,
            controls: [
                {
                    sort: 10,
                    active: true,
                    caption: 'Play',
                    type:    'button',
                    attributes: {
                        onclick: () => {
                            // console.log('options.submit', formdata);
                            formdata.submit(formdata);
                        },
                    },
                },
                {
                    sort: 1,
                    active: true,
                    caption: 'Timestamp',
                    type:    'timestamp',
                    ontick:   () => formdata.timestamp = new Date(),
                    // value: () => H.date2isoLocal(new Date(formdata.timestamp)),
                },
                {
                    sort: 2,
                    active: true,
                    caption: 'Depth',
                    type:    'range',
                    value: () => formdata.depth,
                    datalist: (function () {
                        return H.range(1, 31).map( n => {
                            return !(n % 5) ? {value: n, label: n} : {value: n};
                        });
                    })(),
                    // stuff: [
                    //     {value: 1, label: '1'},
                    //     {value: 2},
                    //     {value: 3},
                    //     {value: 4, label: '4'},
                    // ],
                    attributes: {
                        // onchange: (e) => {
                        //     const value     = ~~e.target.value;
                        //     formdata.depth      = value;
                        //     formdata.difficulty = Tools.resolveDifficulty(value);
                        // },
                        oninput: (e) => {
                            const value     = ~~e.target.value;
                            formdata.depth      = value;
                            formdata.difficulty = Tools.resolveDifficulty(value);
                        },
                        min: 1, max: 30, step: 1,
                        list: 'dl-stockfish-depth',
                        style: 'max-width: 100%; width: 100%; margin:0; padding: 0; vertical-align: middle;',
                    },
                },
                {
                    sort: 3,
                    active: true,
                    caption: 'Difficulty',
                    type:    'none',
                    value: () => formdata.difficulty,
                },
                {
                    sort: 5,
                    active: true,
                    caption: 'Time',
                    type:    'number',
                    value: () => formdata.time,
                    dimension: 'secs',
                    attributes: {
                        onchange: (e) => {
                            formdata.time = ~~e.target.value;
                        },
                        min: 1, max: 30,
                    },
                },
            ],
        },

        // User (name)
        {
            category: 'User',
            sort:    1,
            active:  true,
            controls: [
                {
                    sort:    1,
                    active:  true,
                    caption: 'Name',
                    type:    'text-split',
                    value: () => formdata.user.name,
                    attributes: {
                        placeholder: 'your name',
                        onchange: (e) => {
                            formdata.user.name = e.target.value;
                        },
                    },
                },
            ],
        },

        // board.illustrations (bestmove, lastmove)
        {
            category: 'Illustrations',
            sort:     2,
            active:   true,
            controls: [
                {
                    sort:    1,
                    active:  true,
                    caption: 'Best move',
                    type:    'checkbox',
                    value: () => formdata.board.illustrations.bestmove,
                    attributes: {
                        type: 'checkbox',
                        // style: 'vertical-align: text-bottom;',
                        onclick: (e) => {
                            formdata.board.illustrations.bestmove = !!e.target.checked;
                        },
                    },
                },
                {
                    sort:        2,
                    active:      true,
                    caption:     'Last Move',
                    type:        'checkbox',
                    value: () => formdata.board.illustrations.lastmove,
                    attributes:  {
                        type:    'checkbox',
                        // style:   'vertical-align: text-bottom;',
                        oninput: (e) => {
                            formdata.board.illustrations.lastmove = !!e.target.checked;
                        },
                    },
                },
            ],
        },

        // Evaluator (threads, maxdepth, maxwait, (divisor) )
        {
            category: 'Evaluator',
            sort: 4,
            active: true,
            controls: [
                {
                    sort: 10,
                    active: true,
                    caption: 'Max Threads',
                    type:    'range',
                    value: () => formdata.evaluator.maxthreads,
                    datalist: H.range(1, System.threads).map( num => ({ value: num}) ),
                    attributes: {
                        oninput: (e) => {
                            formdata.evaluator.maxthreads = ~~e.target.value;
                        },
                        min: 1, max: System.threads -1, step: 1,
                        list: 'dl-evaluator-threads',
                    },
                },
                {
                    sort: 20,
                    active: true,
                    caption: 'Max Depth',
                    type:    'number',
                    value: () => formdata.evaluator.maxdepth,
                    dimension: 'deep',
                    attributes: {
                        min: 1, max: 50, step: 1,
                        onchange: (e) => {
                            formdata.evaluator.maxdepth = ~~e.target.value;
                        },
                    },
                },
                {
                    sort: 30,
                    active: true,
                    caption: 'Max Wait',
                    type:    'number',
                    value: () => formdata.evaluator.maxsecs,
                    dimension: 'secs',
                    attributes: {
                        min: '0.1', max: '5.0', step: '0.1',
                        onchange: (e) => {
                            formdata.evaluator.maxsecs = parseFloat(e.target.value);
                        },
                    },
                },


            ],
        },

        // PGN Sources (api)
        {
            category: 'PGN Sources',
            sort: 5,
            active: true,
            controls: [
                {
                    sort: 2,
                    active: true,
                    caption: 'Endpoint',
                    type:    'selectindexed',
                    options:  Config.apis,
                    value: () => formdata.api,
                    attributes: {
                        onchange: (e) => {
                            formdata.api = Config.apis.find( api => api.idx = ~~e.target.value);
                            // console.log('options.api.change', e.target.value, formdata.api);
                        },
                    },
                },
            ],
        },

        /// STUFF
        // {
        //     category: 'Options',
        //     sort: 1,
        //     active: true,
        //     controls: [
        //         {
        //             sort: 1,
        //             active: true,
        //             caption: 'save',
        //             type:    'button',
        //             attributes: {
        //                 onclick: (e) => {console.log('options.click', e);},
        //             },
        //         },
        //     ],
        // },

        /// MORE STUFF
        // {
        //     category: 'Board Illustration',
        //     sort: 2,
        //     active: true,
        //     controls: [
        //         {
        //             sort: 1,
        //             active: true,
        //             caption: 'bestmove',
        //             type:    'checkbox',
        //             value: () => State.board.illustrations.arrows.bestmoves,
        //             scheme: 'State.board.illustrations.arrows.bestmoves|boolean|true',
        //             attributes: {
        //                 type: 'checkbox',
        //                 onclick: (e) => {
        //                     State.board.illustrations.arrows.bestmoves = !!e.target.checked;
        //                 },
        //                 style: 'vertical-align: text-bottom;',
        //             },
        //         },
        //         {
        //             sort: 2,
        //             active: true,
        //             caption: 'lastmoves',
        //             type:    'checkbox',
        //             value: () => State.board.illustrations.arrows.lastmoves,
        //             scheme: 'State.board.illustrations.arrows.lastmoves|boolean|true',

        //             attributes: {
        //                 type: 'checkbox',
        //                 oninput: (e) => {
        //                     State.board.illustrations.arrows.lastmoves = !!e.target.checked;
        //                 },
        //                 style: 'vertical-align: text-bottom;',
        //             },
        //         },
        //     ],
        // },

    ];
};

export { FormDefinitions };
