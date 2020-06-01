
import { H }  from '../services/helper';
import Tools  from '../tools/tools';
import Config from './config';
import System from './system';

/**
 *  formdata = {
 *     group:      '', // from DB.Options
 *     option:     value, ... ,
 *     submit:     function () { saves options }}
 *     autosubmit: [bool]
 *
 *  EVENTS:
 *  onchange : select, checkbox // after user committed
 *  oninput  : all other
 * */


const FormGroups = function ( formdata ) {

    return [
        {   group: 'play-s-s',               sort: 20, title: 'Options Stockfish - Stockfish', active: true,
            controls:
                [  { caption: 'Depth',       sort: 10, type: 'range',                          active: true,
                    value: () => formdata.depth,
                    datalist: ( () => {
                        return H.range(1, 31).map( n => {
                            return !(n % 5) ? {value: n, label: n} : {value: n};
                        });
                    })(),
                    attributes: {
                        oninput: (e) => {
                            const value         = ~~e.target.value;
                            formdata.depth      = value;
                            // formdata.difficulty = Tools.resolveDifficulty(value);
                            formdata.autosubmit && formdata.submit();
                        },
                        min: 1, max: 30, step: 1,
                        list: 'dl-stockfish-depth',
                    },

                }, { caption: 'Difficulty',  sort: 20, type: 'passive',                        active: true,
                    value: () => Tools.resolveDifficulty(formdata.depth) + ' (' + formdata.depth + ')',

                }, { caption: 'Timecontrol', sort: 30, type: 'selectindexed-split',            active: true,
                    options:  Config.timecontrols,
                    value: () => {
                        return formdata.timecontrol;
                    },
                    attributes: {
                        onchange: (e) => {
                            formdata.timecontrol = Config.timecontrols.find( tc => tc.idx === ~~e.target.value);
                            formdata.autosubmit && formdata.submit();
                        },
                    },

                }, { caption: 'Openings',    sort: 40, type: 'selectindexed-split',            active: true,

                    options:  Config.openings,
                    value: () => formdata.opening,
                    attributes: {
                        onchange: (e) => {
                            formdata.opening = Config.openings.find( op => op.idx === ~~e.target.value);
                            formdata.autosubmit && formdata.submit();
                        },
                    },

                }, { caption: 'Timestamp',   sort: 50, type: 'timestamp',                      active: !formdata.autosubmit,
                    value:  () => formdata.timestamp,
                    ontick: () => formdata.timestamp = new Date(),

                }, { caption: 'Play',        sort: 90, type: 'button',                         active: !formdata.autosubmit,
                    attributes: {
                        onclick: () => {
                            formdata.submit(formdata);
                        },
                    },

                }  ],

        },{ group: 'play-h-s',               sort: 30, title: 'Options Human - Stockfish',     active: true,
            controls:
                [  { caption: 'Depth',       sort: 10, type: 'range',                          active: true,
                    value: () => formdata.depth,
                    datalist: ( () => {
                        return H.range(1, 31).map( n => {
                            return !(n % 5) ? {value: n, label: n} : {value: n};
                        });
                    })(),
                    attributes: {
                        oninput: (e) => {
                            const value         = ~~e.target.value;
                            formdata.depth      = value;
                            formdata.difficulty = Tools.resolveDifficulty(value);
                            formdata.autosubmit && formdata.submit();
                        },
                        min: 1, max: 30, step: 1,
                        list: 'dl-stockfish-depth',
                    },
                }, { caption: 'Difficulty',  sort: 20, type: 'passive',                        active: true,
                    value: () => Tools.resolveDifficulty(formdata.depth) + ' (' + formdata.depth + ')',
                }, { caption: 'Timecontrol', sort: 30, type: 'selectindexed-split',            active: true,
                    options:  Config.timecontrols,
                    value: () => {
                        return formdata.timecontrol;
                    },
                    attributes: {
                        onchange: (e) => {
                            formdata.timecontrol = Config.timecontrols.find( tc => tc.idx === ~~e.target.value);
                            formdata.autosubmit && formdata.submit();
                        },
                    },

                }, { caption: 'Timestamp',   sort: 80, type: 'timestamp',                      active: !formdata.autosubmit,
                    value:  () => formdata.timestamp,
                    ontick: () => formdata.timestamp = new Date(),

                }, { caption: 'Play',        sort: 90, type: 'button',                         active: !formdata.autosubmit,
                    attributes: {
                        onclick: () => {
                            formdata.submit(formdata);
                        },
                    },
                }  ],

        },{ group: 'user-data',              sort: 10, title: 'User',                          active: true,
            controls:
                [  { caption: 'Name',        sort: 10, type: 'text-split',                     active: true,
                    value: () => formdata.name,
                    attributes: {
                        placeholder: 'your name',
                        onchange: (e) => {
                            formdata.name = e.target.value;
                        },
                    },
                } ],

        },{ group: 'board-illustrations',    sort: 40, title: 'Illustrations',                 active: true,
            controls:
                [  { caption: 'Best move',   sort: 10, type: 'checkbox',                       active:  true,
                    value: () => formdata.bestmove,
                    attributes: {
                        type: 'checkbox',
                        onchange: (e) => {
                            formdata.bestmove = !!e.target.checked;
                            formdata.autosubmit && formdata.submit();
                        },
                    },
                }, { caption: 'Last Move',   sort: 20, type: 'checkbox',                       active: true,
                    value: () => formdata.lastmove,
                    attributes:  {
                        type:    'checkbox',
                        onchange: (e) => {
                            formdata.lastmove = !!e.target.checked;
                            formdata.autosubmit && formdata.submit();
                        },
                    },
                }  ],

        },{ group: 'game-evaluator',         sort: 50, title: 'Evaluator',                     active: true,
            controls:
                [  { caption: 'Max Threads', sort: 10, type: 'range',                          active: true,
                    value: () => formdata.maxthreads,
                    datalist: H.range(1, System.threads).map( num => ({ value: num}) ),
                    attributes: {
                        oninput: (e) => {
                            formdata.maxthreads = ~~e.target.value;
                            formdata.autosubmit && formdata.submit();
                        },
                        min: 1, max: System.threads -1, step: 1,
                        list: 'dl-evaluator-threads',
                    },
                }, { caption: 'Max Depth',   sort: 20, type: 'number',                         active: true,
                    value: () => formdata.maxdepth,
                    dimension: 'deep',
                    attributes: {
                        min: 1, max: 50, step: 1,
                        onchange: (e) => {
                            formdata.maxdepth = ~~e.target.value;
                            formdata.autosubmit && formdata.submit();
                        },
                    },
                }, { caption: 'Max Wait',    sort: 30, type: 'number',                         active: true,
                    value: () => formdata.maxsecs,
                    dimension: 'secs',
                    attributes: {
                        min: '0.1', max: '5.0', step: '0.1',
                        onchange: (e) => {
                            formdata.maxsecs = parseFloat(e.target.value);
                            formdata.autosubmit && formdata.submit();
                        },
                    },
                }  ],

        },{ group: 'sources-pgn',            sort: 60, title: 'API Enpoints',                  active: true,
            controls:
                [  { caption: 'Endpoint',    sort: 2, type: 'selectindexed',                   active: true,
                    options:  Config.apis,
                    value: () => formdata.api,
                    attributes: {
                        onchange: (e) => {
                            formdata.api = Config.apis.find( api => api.idx === ~~e.target.value);
                            formdata.autosubmit && formdata.submit();
                        },
                    },
                }  ],

        },

    ];
};

export { FormGroups };
