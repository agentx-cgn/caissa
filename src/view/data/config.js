
import board_svg         from '../../extern/cm-chessboard/chessboard-sprite.svg';
import {COLOR, MOVE_INPUT_MODE} from '../../extern/cm-chessboard/Chessboard';
import { H } from '../services/helper';

const fens = {
    empty: '8/8/8/8/8/8/8/8 w - - 0 1',
    start: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
};

const moveTemplate = {
    turn:  null,
    fen:   '',
    from:  '',
    to:    '',
    color: '',
};

const gametemplate = {

    uuid:        'G0000000',     // string, 6 or 8 alphanums
    mode:        'h-h',
    turn:         -1,
    moves:        [],
    score: {
        maxcp:    0,
        maxmate:  0,
    },
    header:      {
        // STR (Seven Tag Roster)
        White:       'White',        // name of white player
        Black:       'Black',        // name of black player
        Event:       '',
        Site:        'caissa.js.org',
        Round:       '',
        Date:        '',
        Result:      '',
        Termination: '',
        TimeControl: '',
    },            // from PGN parsing
    pgn:         '',             // game moves in pgn notation
    // timestamp

};

const boardtemplate = {
    uuid:        'B0000000',
    fen:         '',
    moveStart:   '',
    bestmove:    { move: {from: '', to: ''}, ponder: {from: '', to: ''}},
    captured:    { white: [], black: []},
    orientation: COLOR.white,
    buttons:   {
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
        turn:     '',     // turn w || b
        over:     false,  // game_over
        chck:     false,  // in_check
        mate:     false,  // check_mate
        draw:     false,  // in_draw
        stal:     false,  // in_stalemate
        insu:     false,  // insufficient_material
        repe:     false,  // in_threefold_repetition
    },
    illustrations : {}, // coming from Options

};

const opponents = {
    'h': 'Human',
    'l': 'Leela',
    's': 'Stockfish',
};

// const urls = [
//     'https://google.com',
//     'https://en.wikipedia.com',
// ].map(encodeURI);

// export default H.deepFreeze({
export default H.deepFreezeCreate({

    fens,
    opponents,

    database: {
        updateInterval: 60 * 1000,
    },

    templates : {
        move:    moveTemplate,
        game:    gametemplate,
        board:   boardtemplate,
        plays:   [
            {mode: 'h-h', uuid: 'P0000000', subline: 'a classic',        header: { White: '',          Black: ''          }},
            {mode: 'x-x', uuid: 'P1000000', subline: 'no pressure',      header: { White: 'White',     Black: 'Black'     }},
            {mode: 's-s', uuid: 'P2000000', subline: 'this is fun',      header: { White: 'Stockfish', Black: 'Stockfish' }},
            {mode: 'h-s', uuid: 'P3000000', subline: 'beat the machine', header: { White: 'Human',     Black: 'Stockfish' }},
            {mode: 's-h', uuid: 'P4000000', subline: 'beat the machine', header: { White: 'Stockfish', Black: 'Human'     }},
        ],
    },
    tableTemplates: {
        Games:   gametemplate,
        Boards:  boardtemplate,
    },

    pieces: {
        fens : {
            white:  'PPPPPPPPRNBQKBNR',
            black:  'pppppppprnbqkbnr',
            sorted: 'kqrbnp',
        },
        // blacks: ['wk', 'wq', 'wr', 'wb', 'wn', 'wp' ],
        // whites: ['bk', 'bq', 'br', 'bb', 'bn', 'bp' ],
        font : {
            'k': 'l',
            'q': 'w',
            'r': 't',
            'b': 'n',
            'n': 'j',
            'p': 'o',
            'K': 'l',
            'Q': 'w',
            'R': 't',
            'B': 'n',
            'N': 'j',
            'P': 'o',
        },

    },

    pagecache: {
        size: 5,
    },

    navigation : [
        ['/sources/',        {}, 'PGNS'],
        ['/games/',          {}, 'GAMES'],  // loads imported games so far
        ['/game/',           {}, 'GAME'],
        ['/plays/',          {}, 'PLAY'],
        // ['/analyzer/',       {}, 'ANALYSE'],
        ['/system/:module/', {module: 'system'}, 'SYSTEM'],
        ['/options/',        {}, 'OPTIONS'],
        // ['/help/',           {}, 'HELP'],

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
        {idx: 1, caption: 'OP01', value: 'OP01'},
        {idx: 2, caption: 'OP02', value: 'OP02'},
        {idx: 3, caption: 'OP03', value: 'OP03'},
    ],

    timecontrols: [                          // initial | bonus
        {idx: 0, caption: '10 secs + 0', value: `${ 1*10*1000}+0`},
        {idx: 1, caption: ' 1 min  + 0', value: `${ 1*60*1000}+0`},
        {idx: 2, caption: ' 5 min  + 0', value: `${ 5*60*1000}+0`},
        {idx: 3, caption: '10 min  + 0', value: `${10*60*1000}+0`},
    ],

    plays: {
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
    },
    board: {
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
            animationDuration:      300,            // pieces animation duration in milliseconds
            moveInputMode:          MOVE_INPUT_MODE.dragPiece, // set to MOVE_INPUT_MODE.dragPiece or MOVE_INPUT_MODE.dragMarker for interactive movement
        },
    },

    flagTitles : {
        'n'  : 'a non-capture',
        'b'  : 'a pawn push of two squares',
        'e'  : 'an en passant capture',
        'c'  : 'a standard capture',
        'p'  : 'a promotion',
        'k'  : 'kingside castling',
        'q'  : 'queenside castling',
        'pc' : 'capture + promotion',
    },
    flagColors: {
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
    },

});
