
export default {

    'user-data': {
        name: 'noiv',
    },

    'play-h-s': {
        depth: 3,
        timecontrol:  {idx: 0, caption: '10 secs', value: `${ 1*10*1000}|0`},  // idx from Config.timecontrols
        opening:      {idx: 0, label: 'OP01'},
    },

    'play-s-s': {
        depth: 3,
        timecontrol:  {idx: 0, caption: '10 secs', value: `${ 1*10*1000}|0`},  // idx from Config.timecontrols
        opening:      {idx: 0, label: 'OP01'},
    },

    'game-evaluator': {
        engine:      'stockfish', // not yet an options
        maxthreads:  2,           //
        maxdepth:    5,          //
        maxsecs:     1.0,         // 0.01 60 secs
        divisor:     2,           // not yet an options
    },

    'board-illustrations' : {
        pinning   : true,
        bestmove  : true,
        ponder    : true,
        lastmove  : true,
        availmoves: true,
        attack    : true,
        valid     : true,
    },

    'board-decoration': {
        decoration: false,          // a1 - h8
        'light-color': '#789',      // fields light
        'dark-color':  '#987',      //
    },

    ui: {
        waitscreen: true,
    },
    'other' : {
        'ui-collapsed' : {
            'section-left':  false,
        },
    },


};
