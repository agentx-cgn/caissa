
import Layout          from '../layout';
import Help            from '../pages/help/help';
import Options         from '../pages/options/options';
import Games           from '../pages/games/games';
import Plays           from '../pages/plays/plays';
import Play            from '../pages/play/play';
import Board           from '../pages/board/board';
import Game            from '../pages/game/game';
import Sources         from '../pages/sources/sources';
import System          from '../pages/system/system';
// import {Nothing}       from './components/misc';
import { H }           from '../services/helper';

const Pages  = H.create({

    // Route                Layout  Content  Section         Navigation Feedback  Flags          Title
    '/sources/':          [ Layout, Sources, Board , { navi: '/sources/',  flags: ' sb ', title: 'Sources'}    ],
    '/games/':            [ Layout, Games,   Board , { navi: '/games/',    flags: ' sb ', title: 'Games'}      ],
    '/games/:idx/':       [ Layout, Games,   Board , { navi: '/games/',    flags: ' sb ', title: 'Games %s'}   ],
    '/game/':             [ Layout, Game,    Board , { navi: '/game/',     flags: ' sb ', title: 'Games'}      ],
    '/game/:turn/:uuid/': [ Layout, Game,    Board , { navi: '/game/',     flags: ' sb ', title: 'Game %s'}    ],
    '/plays/':            [ Layout, Plays,   Board , { navi: '/plays/',    flags: ' sb ', title: 'Plays'}      ],
    '/plays/:mode/':      [ Layout, Plays,   Board , { navi: '/plays/',    flags: ' sb ', title: 'Plays'}      ],
    '/play/:uuid/':       [ Layout, Play,    Board , { navi: '/play/',     flags: ' sb ', title: 'Plays %s'}   ],
    '/analyzer/:fen/':    [ Layout, Game,    Board , { navi: '/analyzer/', flags: ' sb ', title: 'Analyzer'}   ],
    '/options/':          [ Layout, Options, Board , { navi: '/options/',  flags: ' sb ', title: 'Options'}    ],

    '/system/':           [ Layout, System         , { navi: '/system/',   flags: ' sb ', title: 'System %'}   ],
    '/system/:module/':   [ Layout, System         , { navi: '/system/',   flags: ' sb ', title: ''}           ],

    '/help/':             [ Layout, Help           , { navi: '/help/',     flags: ' fw ', title: 'Help'}        ],
    '/help/:url/':        [ Layout, Help           , { navi: '/help/',     flags: ' fw ', title: 'Help'}        ],

});

export default Pages;
