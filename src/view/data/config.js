
import board_svg         from '../../extern/cm-chessboard/chessboard-sprite.svg';
import {COLOR, MOVE_INPUT_MODE} from '../../extern/cm-chessboard/Chessboard';
import { H } from '../services/helper';
import playtemplates from './play-templates';

const fens = H.create({
    empty: '8/8/8/8/8/8/8/8 w - - 0 1',
    start: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
});

const pieces = H.create({
    fens : {
        white:  'PPPPPPPPRNBQKBNR',
        black:  'pppppppprnbqkbnr',
        sorted: 'kqrbnp',
    },
    blacks: ['wk', 'wq', 'wr', 'wb', 'wn', 'wp' ],
    whites: ['bk', 'bq', 'br', 'bb', 'bn', 'bp' ],
});


const playstemplates = [
    {mode: 's-s', turn: 0 , uuid: '0000000A', subline: 'this is fun',
        pgn: '', white: 'Stockfish', black: 'Stockfish', engine: 'stockfish',
        depth: 5, timecontrol: 1,
    },

    {mode: 'h-s', turn: 0 , uuid: '0000000B', subline: 'beat the machine',
        pgn: '', white: 'Human', black: 'Stockfish', engine: 'stockfish',
        depth: 4, timecontrol: 1,
    },

    {mode: 's-h', turn: 0 , uuid: '0000000C', subline: 'beat the machine',
        pgn: '', white: 'Stockfish', black: 'Human', engine: 'stockfish',
        depth: 3, timecontrol: 1,
    },

];

// const playstatetemplate = H.create({
//     // timestamp: null, is in play
//     moves: [],
//     fen:   fens.start,
//     play:  null,
//     timecontrol: null,
// });

const gametemplateshort = H.create({

    uuid:        '00000000',     // string, 6 or 8 alphanums
    // STR (Seven Tag Roster)
    white:       'White',        // name of white player
    black:       'Black',        // name of black player
    event:       '',
    site:        '',
    round:       '',
    date:        '',
    result:      '',

    //
    termination: '',
    timecontrol: '',
    pgn:         '',             // game moves in pgn notation
    header:      {},            // from PGN parsing

});

// const gametemplate = H.create({
//     ...gametemplateshort,
//     mode:       'h-h',          // indicates opponents s=stockfish, h= human, l=leela
//     turn:       -3 ,            // Number, used to gen gen and display on board (-3 unknown, -2 empty board, -1 start, 0 after first ply)
//     plycount:   0,              // # of halfmoves
//     subline:    'this is fun',  // optional comment
//     opening:    '',             // optional
//     time:       10,             // optional, only for machine opponent
//     depth:      3,              // optional,
//     difficulty: 'rooky',        // optional, only for machine opponent
//     timestamp:  1589137091395,  // game started or viewed
// });

const gametemplate = H.create({
    // game        : {},
    moves       : [],
    score: {
        maxcp       : 0,
        maxmate     : 0,
    },
    buttons: {
        rotate:   true,
        backward: true,
        forward:  true,
        left:     true,
        right:    true,
        play:     false,
        pause:    false,
        evaluate: true,
    },
    flags : {
        turn: '',     // turn w || b
        over: false,  // game_over
        chck: false,  // in_check
        mate: false,  // check_mate
        draw: false,  // in_draw
        stal: false,  // in_stalemate
        insu: false,  // insufficient_material
        repe: false,  // in_threefold_repetition
    },
});

const boardtemplate = H.create({
    fen: '',
    pgn: '',
    orientation: COLOR.white,
    moveStart: '',
    bestmove: {move: {from: '', to: ''}, ponder: {from: '', to: ''}},

    // illustrations : CFG.board.illustrations,

});

const opponents = H.create({
    'h': 'Human',
    'l': 'Leela',
    's': 'Stockfish',
});

// const urls = [
//     'https://google.com',
//     'https://en.wikipedia.com',
// ].map(encodeURI);

export default H.deepFreeze(H.create({

    fens,
    pieces,
    opponents,

    database: {
        updateInterval: 60 * 1000,
    },

    templates : {
        game:        gametemplate,
        gameshort:   gametemplateshort,
        play:        playtemplates,
        plays:       playstemplates,
        boardstate:  boardtemplate,
    },
    tableTemplates: {
        Games:   gametemplate,
        Play:    playtemplates,
        Boards:  boardtemplate,
    },

    pagecache: {
        size: 5,
    },

    navigation : [
        ['/sources/',        {}, 'PGNS'],
        ['/games/',          {}, 'GAMES'],  // loads imported games so far
        ['/game/',           {}, 'GAME'],
        ['/plays/',          {}, 'PLAY'],
        ['/analyzer/',       {}, 'ANALYSE'],
        ['/system/:module/', {module: 'system'}, 'SYSTEM'],
        ['/options/',        {}, 'OPTIONS'],
        ['/help/',           {}, 'HELP'],

        // [`/info/${urls[1]}/`,   'INFO'],
        // ['/test',     'TEST'],
    ],

    apis: [
        {idx: 1, caption: 'api.chess.com/pub/player/',   value: 'https://api.chess.com/pub/player/noiv/games/2020/04/pgn'},
        {idx: 2, caption: 'lichess.org/api/games/user',  value: 'http://localhost:3000/static/games.pgn'},
        {idx: 3, caption: 'localhost:3000/static/games.few.pgn',   value: 'http://localhost:3000/static/games.few.pgn'},
        {idx: 4, caption: 'localhost:3000/static/games.pgn',       value: 'http://localhost:3000/static/games.pgn'},
    ],

    // still dummies
    openings : [
        H.create({idx: 1, caption: 'OP01', value: 'OP01'}),
        H.create({idx: 2, caption: 'OP02', value: 'OP02'}),
        H.create({idx: 3, caption: 'OP03', value: 'OP03'}),
    ],

    timecontrols: [                          // initial | bonus
        H.create({idx: 0, caption: '10 secs', value: `${ 1*10*1000}|0`}),
        H.create({idx: 1, caption: '1 min',   value: `${ 1*60*1000}|0`}),
        H.create({idx: 2, caption: '5 min',   value: `${ 5*60*1000}|0`}),
        H.create({idx: 3, caption: '10 min',  value: `${10*60*1000}|0`}),
    ],

    plays: H.create({
        difficulties : {
            '0':   'looser',
            '3':   'rooky',
            '5':   'beginner',
            '10':  'experienced',
            '20':  'hardcore',
            '30': 'no chance',
        },
        defaults: [
            {uuid: '00000001', mode: 'h-s', time: 10, depth: 3, subline: 'play white against Stockfish'},
            {uuid: '00000002', mode: 's-h', time: 10, depth: 3, subline: 'play black against Stockfish'},
            {uuid: '00000003', mode: 's-s', time: 10, depth: 3, subline: 'this is fun'                 },
        ],
    }),
    board: H.create({
        config: {
            position:               'empty',        // set as fen, 'start' or 'empty'
            orientation:            COLOR.white,    // white on bottom
            style: {
                cssClass:           'gray',         // this is custom => analyzer.scss
                showCoordinates:    false,           // show ranks and files
                showBorder:         false,           // display a border around the board
            },
            sprite: {
                url:                board_svg ,     // pieces and markers are stored es svg in the sprite
                grid:               40,             // the sprite is tiled with one piece every 40px
                markers:            ['marker4', 'marker5'],
            },
            responsive:             true,           // resizes the board on window resize, if true
            animationDuration:      500,            // pieces animation duration in milliseconds
            moveInputMode:          MOVE_INPUT_MODE.dragPiece, // set to MOVE_INPUT_MODE.dragPiece or MOVE_INPUT_MODE.dragMarker for interactive movement
        },
    }),

    flagTitles : H.create({
        'n'  : 'a non-capture',
        'b'  : 'a pawn push of two squares',
        'e'  : 'an en passant capture',
        'c'  : 'a standard capture',
        'p'  : 'a promotion',
        'k'  : 'kingside castling',
        'q'  : 'queenside castling',
        'pc' : 'capture + promotion',
    }),
    flagColors: H.create({
        w: {
            'n'  : '#fff',
            'b'  : 'darkgreen',
            'e'  : 'darkgreen',
            'c'  : 'darkred',
            'p'  : 'red',
            'k'  : 'darkgreen',
            'q'  : 'darkgreen',
            'pc' : 'orange',
        },
        b: {
            'n'  : '#333',
            'b'  : 'darkgreen',
            'e'  : 'darkred',
            'c'  : 'darkred',
            'p'  : 'red',
            'k'  : 'darkgreen',
            'q'  : 'darkgreen',
            'pc' : 'orange',
        },
    }),
    fontPieces : H.create({ // 'l w t n j o'
        'k': 'l',
        'q': 'w',
        'r': 't',
        'b': 'n',
        'n': 'j',
        'p': 'o',
    }),
    fontPiecesWhite : H.create({ // 'l w t n j o'
        'K': 'l',
        'Q': 'w',
        'R': 't',
        'B': 'n',
        'N': 'j',
        'P': 'o',
    }),

}));
