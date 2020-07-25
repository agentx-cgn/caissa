
import iconChess from './../../assets/static/chess.128.trans.png';

export default   [
    // route             caption        params
    ['/sources/',        'COLLECTIONS', {},                     {
        ifa: 'fa-chess-pawn',
        subline: 'Checkput out games from various collections.',
    } ],
    ['/games/',          'GAMES',       { idx: 0 },             {
        img: iconChess,
        subline: 'All games from a collection',
    } ],  // loads imported games so far
    ['/game/',           'GAME',        {},                     {
        img: iconChess,
        subline: 'Currently open games',
    } ],
    ['/plays/',          'PLAY',        {},                     {
        img: iconChess,
        subline: 'Start a new game',
    } ],
    ['/openings/',       'OPENINGS',    {},                     {
        img: iconChess,
        subline: 'Explore Chess Openings',
    } ],
    ['/system/:module/', 'SYSTEM',      { module: 'system' },   {
        ifa: 'fa-microchip' ,
        subline: 'This is hidden in production',
    } ],
    ['/preferences/',    'PREFERENCES', {},                     {
        ifa: 'fa-cogs',
        subline: 'Custumize Caissa to your needs',
    } ],

    // ['/analyzer/',       {}, 'ANALYSE'],
    // ['/help/',           {}, 'HELP'],

    // [`/info/${urls[1]}/`,   'INFO'],
    // ['/test',     'TEST'],
];
