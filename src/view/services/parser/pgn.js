
import Config from '../../data/config';
import Tools  from '../../tools/tools';
import { H }  from '../helper';

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

        let rxp, game = H.create(H.deepcopy(Config.templates.game));

        lines.forEach( (line) => {

            line = line.trim();
            rxp  = line.match(/^\[(\w+)\s+"(.*)"\]$/);

            if ( rxp !== null && rxp[1] === 'Event' ){
                // if first dont push
                if (game.header.Event){
                    games.push(game);
                }
                game = H.create(H.deepcopy(Config.templates.game));
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

        false && console.log('Info   :', 'Parsed', games.length, 'pgns in', Date.now() - t0, 'msecs');

        return games;


    },
    sanitizeGames (games) {
        return games.map( game => {

            // https://en.wikipedia.org/wiki/Portable_Game_Notation#Tag_pairs

            game.uuid  = Tools.genGameHash(game);

            console.log(H.shrink(game));

            // STR (Seven Tag Roster) // event is handled above
            // game.white = game.header.White ? game.header.White : 'White';
            // game.black = game.header.Black ? game.header.Black : 'Black';

            // game.header.Result      && ( game.result      = game.header.Result );
            // game.header.Round       && ( game.round       = game.header.Round );
            // game.header.Site        && ( game.site        = game.header.Site );
            game.date  = (
                game.header.Date       ? game.header.Date      :
                game.header.EventDate  ? game.header.EventDate :
                game.header.UTCDate    ? game.header.UTCDate   :
                '????.??.??'
            );

            // dropping mode, fen
            // game.header.Time        && ( game.time        = game.header.Time );
            // game.header.Termination && ( game.termination = game.header.Termination );
            // game.header.TimeControl && ( game.timecontrol = game.header.TimeControl );
            // game.header.Eco         && ( game.eco         = game.header.Eco );
            // game.header.PlyCount    && ( game.plycount    = ~~game.header.PlyCount );

            H.map(game.header, (key, val) => {
                !val && delete game.header[key];
            });
            game.searchtext = H.map(game.header, (_, val) => val).join(' ').toLowerCase();

            // game.searchtext = (game.date +' '+ (game.result||'') +' '+ game.white  +' '+ game.black  +' '+ (game.event||'')).toLowerCase();

            if (!game.pgn) {
                // eslint-disable-next-line no-debugger
                debugger;
            }
            return game;
        });
    },

};

export default Parser;
