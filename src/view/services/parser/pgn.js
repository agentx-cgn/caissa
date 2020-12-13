
import Config from '../../data/config';
import Tools  from '../../tools/tools';
import { H }  from '../helper';

const DEBUG = false;

const Parser = {
    readGames (pgns, delimiter='\n', deleteComments=false) {

        const t0 = Date.now();

        pgns = pgns
            .replace(/\r/g, '')
            .replace(/\t/g, ' ')
        ;

        // let's see who chokes first, also () ...
        deleteComments && ( pgns = pgns.replace(/\s?\{[^}]+\}/g, '') );

        const
            games = [],
            lines = pgns.split(delimiter)
        ;

        let rxp, game = H.clone(Config.templates.game);

        lines.forEach( (line) => {

            line = line.trim();
            rxp  = line.match(/^\[(\w+)\s+"(.*)"\]$/);

            if ( rxp !== null && rxp[1] === 'Event' ){
                // if first dont push
                if (game.header.Event){
                    games.push(game);
                }
                game = H.clone(Config.templates.game);
                game.header[rxp[1]] = rxp[2];

            } else if (rxp !== null) {
                if ( rxp[2] !== ''){
                    game.header[rxp[1]] = rxp[2];
                }

            } else if ( line.length ) {
                game.pgn += ' ' + line;

            }

        });

        // last game
        if (game.header.Event){
            games.push(game);
        }

        true && console.log('Info   :', 'Parsed', games.length, 'pgns in', Date.now() - t0, 'msecs');

        return games;


    },
    sanitizeGames (games) {
        return games.map( game => {

            // https://en.wikipedia.org/wiki/Portable_Game_Notation#Tag_pairs

            game.uuid  = Tools.Games.hash(game);

            DEBUG && console.log(H.shrink(game));
            game.date  = (
                game.header.Date       ? game.header.Date      :
                game.header.EventDate  ? game.header.EventDate :
                game.header.UTCDate    ? game.header.UTCDate   :
                '????.??.??'
            );

            H.map(game.header, (key, val) => {
                !val && delete game.header[key];
            });
            game.searchtext = H.map(game.header, (_, val) => val).join(' ').toLowerCase();

            if (!game.pgn) {
                // eslint-disable-next-line no-debugger
                debugger;
            }
            return game;
        });
    },

};

export default Parser;
