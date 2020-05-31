
import Layout          from './layout';
import Info            from './pages/help/help';
import Analyzer        from './pages/analyzer/analyzer';
import Options         from './pages/analyzer/options';
import Games           from './pages/analyzer/games/games';
import Plays           from './pages/analyzer/plays/plays';
import Play            from './pages/analyzer/play/play';
import Board           from './pages/analyzer/board/board';
import Game            from './pages/analyzer/game/game';
import Sources         from './pages/analyzer/sources/sources';
import System          from './pages/system/system';
import {Nothing}       from './components/misc';

const pages  = {

    // Route              Layout   Content   Sections            Navigation Feedback   Flags          Title
    '/sources/':          [Layout, Analyzer, [ Sources, Board ], { navi: '/sources/',  flags: ' l  ', title: 'Sources'}    ],
    '/games/':            [Layout, Analyzer, [ Games,   Board ], { navi: '/games/',    flags: ' l  ', title: 'Games'}      ],
    '/games/:idx/':       [Layout, Analyzer, [ Games,   Board ], { navi: '/games/',    flags: ' c  ', title: 'Games %s'}   ],
    '/game/':             [Layout, Analyzer, [ Game,    Board ], { navi: '/game/',     flags: ' l  ', title: 'Games'}      ],
    '/game/:turn/:uuid/': [Layout, Analyzer, [ Game,    Board ], { navi: '/game/',     flags: ' lb ', title: 'Game %s'}    ],
    '/plays/':            [Layout, Analyzer, [ Plays,   Board ], { navi: '/plays/',    flags: ' l  ', title: 'Plays'}      ],
    '/plays/:mode/':      [Layout, Analyzer, [ Plays,   Board ], { navi: '/plays/',    flags: ' l  ', title: 'Plays'}      ],
    '/play/:uuid/':       [Layout, Analyzer, [ Play,    Board ], { navi: '/play/',     flags: ' cb ', title: 'Plays %s'}   ],
    '/analyzer/:fen/':    [Layout, Analyzer, [ Game,    Board ], { navi: '/analyzer/', flags: ' cb ', title: 'Analyzer'}   ],
    '/options/':          [Layout, Analyzer, [ Options, Board ], { navi: '/options/',  flags: '    ', title: 'Options'}    ],

    '/system/':           [Layout, System,   [                ], { navi: '/system/',   flags: '   ', title: 'System %'}   ],
    '/system/:module/':   [Layout, System,   [                ], { navi: '/system/',   flags: '   ', title: ''}           ],

    '/info/':             [Layout, Analyzer, [ Nothing, Info  ], { navi: '/info/',     flags: '   ', title: ''}           ],
    '/info/:url/':        [Layout, Analyzer, [ Nothing, Info  ], { navi: '/info/',     flags: '   ', title: ''}           ],

};

export default pages;
