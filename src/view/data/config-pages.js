
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
import Openings        from '../pages/openings/openings';
import {Nothing}       from '../components/misc';
import { H }           from '../services/helper';

const DefaultRoute = '/menu/';
const CompPages    = [Menu, Sources, Games, Game, Plays, Options, System, Openings];
// const CompPages    = [Menu, Sources];
const ConfigPages  = H.create({

    // Route                Layout  Page     Content      Title
    '/menu/':             [ Layout, Menu,     Board,     { title: 'Menu'}        ],
    '/sources/':          [ Layout, Sources,  Board,     { title: 'Sources'}     ],
    '/games/':            [ Layout, Games,    Board,     { title: 'Games'}       ],
    '/games/:idx/':       [ Layout, Games,    Board,     { title: 'Games %s'}    ],
    '/game/:turn/:uuid/': [ Layout, Game,     Board,     { title: 'Game %s'}     ],
    '/plays/':            [ Layout, Plays,    Board,     { title: 'Plays'}       ],
    '/plays/:rivals/':    [ Layout, Plays,    Board,     { title: 'Plays'}       ],
    '/preferences/':      [ Layout, Options,  Board,     { title: 'Preferences'} ],
    '/openings/':         [ Layout, Openings, Board,     { title: 'Openings'} ],

    '/system/':           [ Layout, System,   Nothing,   { title: 'System'}      ],
    '/system/:module/':   [ Layout, System,   Nothing,   { title: 'System %s'}   ],

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
