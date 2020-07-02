
import Layout          from '../layout';
import Menu            from '../pages/menu/menu';
// import Help            from '../pages/help/help';
import Options         from '../pages/preferences/preferences';
import Games           from '../pages/games/games';
import Plays           from '../pages/plays/plays';
import Board           from '../pages/board/board';
import Game            from '../pages/game/game';
import Sources         from '../pages/sources/sources';
import System          from '../pages/system/system';
import {Nothing}       from '../components/misc';
import { H }           from '../services/helper';

const DefaultRoute = '/menu/';
const CompPages    = [Menu, Sources, Games, Game, Plays, Options, System];
// const CompPages    = [Menu, Sources];
const ConfigPages  = H.create({

    // Route                Layout  Page     Content    Navigation Feedback  Title
    '/menu/':             [ Layout, Menu,    Board,   { navi: '/menu/',        title: 'Menu'}       ],
    '/sources/':          [ Layout, Sources, Board,   { navi: '/sources/',     title: 'Sources'}    ],
    '/games/':            [ Layout, Games,   Board,   { navi: '/games/',       title: 'Games'}      ],
    '/games/:idx/':       [ Layout, Games,   Board,   { navi: '/games/',       title: 'Games %s'}   ],
    '/game/:turn/:uuid/': [ Layout, Game,    Board,   { navi: '/game/',        title: 'Game %s'}    ],
    '/plays/':            [ Layout, Plays,   Board,   { navi: '/plays/',       title: 'Plays'}      ],
    '/plays/:mode/':      [ Layout, Plays,   Board,   { navi: '/plays/',       title: 'Plays'}      ],
    '/preferences/':      [ Layout, Options, Board,   { navi: '/preferences/', title: 'Preferences'}],

    '/system/':           [ Layout, System,  Nothing, { navi: '/system/',      title: 'System'}     ],
    '/system/:module/':   [ Layout, System,  Nothing, { navi: '/system/',      title: 'System %s'}  ],

    // '/analyzer/:fen/':    [ Layout, Game,    Board,   { navi: '/analyzer/',  title: 'Analyzer'}   ],
    // '/game/':             [ Layout, Game,    Board,   { navi: '/game/',      title: 'Games'}      ],
    // '/help/':             [ Layout, Help,    Nothing, { navi: '/help/',      title: 'Help'}       ],
    // '/help/:url/':        [ Layout, Help,    Nothing, { navi: '/help/',      title: 'Help'}       ],

});

export {
    DefaultRoute,
    ConfigPages,
    CompPages,
};
