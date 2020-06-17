
import pgnimport00   from '../../assets/games/famous-chess-games.pgn';
import pgnimport01   from '../../assets/games/capablanca-best-games.pgn';
import imgLichess    from '../../assets/images/lichess.trans.128.png';
import imgFloppy     from '../../assets/images/floppy.256.png';

import DB                from '../services/database';

import { ImportProvider, UrlProvider } from '../services/provider';

const providerTemplates = [

    {
        idx:         0,
        key:         'pgnimport00',
        caption:     'Famous Chess Games',
        subline:     'Collection included with Caissa, [21]',
        icon:        imgFloppy,
        source:      pgnimport00,
        constructor: ImportProvider,
    },
    {
        idx:         1,
        key:         'pgnimport01',
        caption:     'Capablanca\'s Best Games',
        subline:     'José Raúl Capablanca, 1888 – 1942, [11]',
        icon:        imgFloppy,
        source:      pgnimport01,
        constructor: ImportProvider,
    },
    {
        idx:         2,
        key:         'pgnurl00',
        caption:     'Alekhine\'s Best Games',
        subline:     'Alexander Alekhine, 1882 – 1946, [10]',
        icon:        imgLichess,
        source:      '/static/pgn/alekhine-best-games.pgn',
        info:        'https://en.wikipedia.org/wiki/Alexander_Alekhine',
        constructor: UrlProvider,
    },
    {
        idx:         3,
        key:         'pgnurl01',
        caption:     'FIDE Steinitz Memorial 2020',
        subtext:     'The FIDE Online Steinitz Memorial took place 15th to 17th May 2020. Two 10 player events an Open and a Women\'s event - 18 Round Double Round Robin over 3 days. ',
        icon:        imgLichess,
        // source:      '/static/pgn/steinitzmem20.pgn.pgn', // provokes error
        source:      '/static/pgn/steinitzmem20.pgn',
        info:        'https://theweekinchess.com/chessnews/events/fide-online-steinitz-memorial-2020',
        constructor: UrlProvider,
    },
];

function genProviderList (templates) {

    const params = {
        user  : DB.Options.first['user-data'].name,
        month : ('00' + ((new Date()).getUTCMonth() +1)).slice(-2),
        year  : (new Date()).getUTCFullYear(),
    };

    return templates.map( tpl => {
        return tpl.constructor(tpl, params);
    });

}

const Providers = {
    list () { return genProviderList(providerTemplates); },
};

// Also needed if changes, think APIs
// providers.list = genProviderList(providerTemplates);
// console.log(providers);

export default Providers;
