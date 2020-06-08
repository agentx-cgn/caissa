
import Layout          from './layout';
import Info            from './pages/help/help';
import Options         from './pages/analyzer/options';
import Games           from './pages/analyzer/games/games';
import Plays           from './pages/analyzer/plays/plays';
import Play            from './pages/analyzer/play/play';
import Board           from './pages/analyzer/board/board';
import Game            from './pages/analyzer/game/game';
import Sources         from './pages/analyzer/sources/sources';
import System          from './pages/system/system';
// import {Nothing}       from './components/misc';
import { H }           from './services/helper';

const pages  = H.create({

    // Route              Layout     Content  Section            Navigation Feedback   Flags          Title
    '/sources/':          [Layout, [ Sources, Board ], { navi: '/sources/',  flags: ' sb ', title: 'Sources'}    ],
    '/games/':            [Layout, [ Games,   Board ], { navi: '/games/',    flags: ' sb ', title: 'Games'}      ],
    '/games/:idx/':       [Layout, [ Games,   Board ], { navi: '/games/',    flags: ' sb ', title: 'Games %s'}   ],
    '/game/':             [Layout, [ Game,    Board ], { navi: '/game/',     flags: ' sb ', title: 'Games'}      ],
    '/game/:turn/:uuid/': [Layout, [ Game,    Board ], { navi: '/game/',     flags: ' sb ', title: 'Game %s'}    ],
    '/plays/':            [Layout, [ Plays,   Board ], { navi: '/plays/',    flags: ' sb ', title: 'Plays'}      ],
    '/plays/:mode/':      [Layout, [ Plays,   Board ], { navi: '/plays/',    flags: ' sb ', title: 'Plays'}      ],
    '/play/:uuid/':       [Layout, [ Play,    Board ], { navi: '/play/',     flags: ' sb ', title: 'Plays %s'}   ],
    '/analyzer/:fen/':    [Layout, [ Game,    Board ], { navi: '/analyzer/', flags: ' sb ', title: 'Analyzer'}   ],
    '/options/':          [Layout, [ Options, Board ], { navi: '/options/',  flags: ' sb ', title: 'Options'}    ],

    '/system/':           [Layout, [ System         ], { navi: '/system/',   flags: ' sb ', title: 'System %'}   ],
    '/system/:module/':   [Layout, [ System         ], { navi: '/system/',   flags: ' sb ', title: ''}           ],

    '/info/':             [Layout, [ Info           ], { navi: '/info/',     flags: ' fw ', title: ''}           ],
    '/info/:url/':        [Layout, [ Info           ], { navi: '/info/',     flags: ' fw ', title: ''}           ],

});

window.caissa.onimport && window.caissa.onimport('Pages');
export default pages;
