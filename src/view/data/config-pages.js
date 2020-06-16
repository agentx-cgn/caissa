
import Layout          from '../layout';
import Menu            from '../pages/menu/menu';
import Help            from '../pages/help/help';
import Options         from '../pages/options/options';
import Games           from '../pages/games/games';
import Plays           from '../pages/plays/plays';
import Play            from '../pages/play/play';
import Board           from '../pages/board/board';
import Game            from '../pages/game/game';
import Sources         from '../pages/sources/sources';
import System          from '../pages/system/system';
import {Nothing}       from '../components/misc';
import { H }           from '../services/helper';

// const CompPages = [Sources, Games, Game, Plays, Play, Options, System];

const DefaultRoute = '/menu/';
const CompPages    = [Menu, Sources, Games, Game, Options, System, Plays, Play];
const ConfigPages  = H.create({

    // Route                Layout  Page     Content    Navigation Feedback  Flags         Title
    '/menu/':             [ Layout, Menu,    Nothing, { navi: '/menu/',     flags: ' sb ', title: 'Menu'}       ],
    '/sources/':          [ Layout, Sources, Nothing, { navi: '/sources/',  flags: ' sb ', title: 'Sources'}    ],
    '/games/':            [ Layout, Games,   Nothing, { navi: '/games/',    flags: ' sb ', title: 'Games'}      ],
    '/games/:idx/':       [ Layout, Games,   Nothing, { navi: '/games/',    flags: ' sb ', title: 'Games %s'}   ],
    '/game/':             [ Layout, Game,    Board ,  { navi: '/game/',     flags: ' sb ', title: 'Games'}      ],
    '/game/:turn/:uuid/': [ Layout, Game,    Board ,  { navi: '/game/',     flags: ' sb ', title: 'Game %s'}    ],
    '/plays/':            [ Layout, Plays,   Nothing, { navi: '/plays/',    flags: ' sb ', title: 'Plays'}      ],
    '/plays/:mode/':      [ Layout, Plays,   Nothing, { navi: '/plays/',    flags: ' sb ', title: 'Plays'}      ],
    '/play/:uuid/':       [ Layout, Play,    Board ,  { navi: '/play/',     flags: ' sb ', title: 'Plays %s'}   ],
    '/analyzer/:fen/':    [ Layout, Game,    Board ,  { navi: '/analyzer/', flags: ' sb ', title: 'Analyzer'}   ],
    '/options/':          [ Layout, Options, Nothing, { navi: '/options/',  flags: ' sb ', title: 'Options'}    ],

    '/system/':           [ Layout, System,  Nothing, { navi: '/system/',   flags: ' sb ', title: 'System'}     ],
    '/system/:module/':   [ Layout, System,  Nothing, { navi: '/system/',   flags: ' sb ', title: 'System %s'}  ],

    '/help/':             [ Layout, Help,    Nothing, { navi: '/help/',     flags: ' fw ', title: 'Help'}       ],
    '/help/:url/':        [ Layout, Help,    Nothing, { navi: '/help/',     flags: ' fw ', title: 'Help'}       ],

});

export {
    DefaultRoute,
    ConfigPages,
    CompPages,
};
