
import Layout          from '../layout';
import Menu            from '../pages/menu/menu';
// import Help            from '../pages/help/help';
import Options         from '../pages/preferences/preferences';
import Analyzer        from '../pages/analyzer/analyzer';
import Games           from '../pages/games/games';
import Plays           from '../pages/plays/plays';
import Board           from '../pages/board/board';
import Game            from '../pages/game/game';
import Source          from '../pages/source/source';
import Sources         from '../pages/sources/sources';
import System          from '../pages/system/system';
import Error           from '../pages/error/error';
import { Openings, Volumes, Groups, Chapters, Variations } from '../pages/openings/subpages';
import { Nothing }     from '../components/misc';
import { H }           from '../services/helper';

const DefaultRoute = '/menu/';
const CompPages    = [Error, Menu, Sources, Games, Game, Plays, Options, System, Openings, Volumes, Groups, Chapters, Variations ];
// const CompPages    = [Menu, Sources];

const ConfigPages  = H.create({

    // routes must start with '/'
    // Route                Layout  Page     Content      Options (Title)
    '/':                  [ Layout, Menu,     Board,     { title: 'Menu 1'}        ],
    '/menu/':             [ Layout, Menu,     Board,     { title: 'Menu 2'}        ],
    '/sources/':          [ Layout, Sources,  Board,     { title: 'Sources'}     ],
    '/games/':            [ Layout, Games,    Board,     { title: 'Games'}       ],
    '/games/:idx/':       [ Layout, Games,    Board,     { title: 'Games %s'}    ],
    '/game/:turn/:uuid/': [ Layout, Game,     Board,     { title: 'Game %s'}     ],
    '/plays/':            [ Layout, Plays,    Board,     { title: 'Plays'}       ],
    '/plays/:rivals/':    [ Layout, Plays,    Board,     { title: 'Plays'}       ],
    '/preferences/':      [ Layout, Options,  Board,     { title: 'Preferences'} ],

    // https://mithril.js.org/route.html#variadic-routes
    '/openings/':                               [ Layout, Openings,   Board,     { title: 'Openings'}    ],
    '/openings/:volume/':                       [ Layout, Volumes,    Board,     { title: 'Openings'}    ],
    '/openings/:volume/:group/':                [ Layout, Groups,     Board,     { title: 'Openings'}    ],
    '/openings/:volume/:chapter/':              [ Layout, Chapters,   Board,     { title: 'Openings'}    ],
    '/openings/:volume/:chapter/:variation':    [ Layout, Variations, Board,     { title: 'Openings'}    ],

    '/system/':           [ Layout, System,   Nothing,   { title: 'System'}      ],
    '/system/:module/':   [ Layout, System,   Nothing,   { title: 'System %s'}   ],
    '/:404...':           [ Layout, Error,    Nothing,   { title: 'Error %s'}    ],

    '/analyzer/:source/': [ Layout, Source,   Analyzer,  { title: 'System %s'}   ],

    // '/analyzer/:fen/':    [ Layout, Game,    Board,    { title: 'Analyzer'}    ],
    // '/game/':             [ Layout, Game,    Board,    { title: 'Games'}       ],
    // '/help/':             [ Layout, Help,    Nothing,  { title: 'Help'}        ],
    // '/help/:url/':        [ Layout, Help,    Nothing,  { title: 'Help'}        ],

});

export {
    DefaultRoute,
    ConfigPages,
    CompPages,
};
