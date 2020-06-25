import Chess       from 'chess.js';
import Config      from '../data/config';
import { H, $$ }   from '../services/helper';
import DB          from '../services/database';
import globaltools from './global-tools';

const gametools = {

    resolvePlayers (game) {

        const opponents = Config.opponents;
        const username = DB.Options.first['user-data'].name;

        const w = game.mode[0];
        const b = game.mode[2];

        return {
            white: opponents[w] === 'Human' ? username : opponents[w],
            black: opponents[b] === 'Human' ? username : opponents[b],
        };

    },

    // used for terminated games
    hash (game) {
        const unique = JSON.stringify({
            1: game.header.White,
            2: game.header.Black,
            3: game.header.Event,
            4: game.header.Site,
            5: game.header.Date,
            6: game.header.Result,
            7: game.pgn.slice(0, 20),
        });
        return H.hash(unique);
    },

    fen (game) {
        const turn = ~~game.turn;
        return (
            turn === -2 ? Config.fens.empty :
            turn === -1 ? Config.fens.start :
            game.moves[turn].fen
        );
    },

    scrollTurnIntoView (turn, msecs=60) {
        setTimeout( () => {

            const selectorElem = 'td[data-turn="' + turn + '"]';
            const selectorView = 'div.gm-moves';
            const isVisible    = H.isVisibleInView($$(selectorElem), $$(selectorView));

            if (!selectorElem || !selectorView) {
                console.warn('scrollIntoView', selectorElem, selectorView);
            }

            if ( !isVisible && $$(selectorElem) ){
                $$(selectorElem).scrollIntoView(true);
            }

        }, msecs);
    },

    resultLine(game) {
        let accu = '';
        game.header.Result      && (accu += game.header.Result + ' ');
        game.header.Termination && (accu += game.header.Termination + ' ');
        typeof game.timecontrol === 'object' && (accu += game.timecontrol.caption + ' ');
        typeof game.header.TimeControl === 'string' && (accu += game.header.TimeControl + ' ');
        return accu;
    },
    timeLine(game) {
        let accu = '';
        game.date
            ? (accu += game.date)
            : game.timestamp
                //TODO: make this locale
                ? (accu += H.date2isoUtc(new Date(game.timestamp)))
                : void(0)
        ;
        return accu;
    },

    fromPlay (playtemplate, formdata) {

        const play = {
            ...Config.templates.game,
            ...playtemplate,
            ...formdata,
            ...gametools.resolvePlayers(playtemplate),
            difficulty: globaltools.resolveDifficulty(formdata.depth),
            timestamp: Date.now(),
        };

        delete play.autosubmit;
        delete play.group;
        // delete play.subline;
        delete play.submit;

        play.turn = -1;
        play.uuid = H.hash(JSON.stringify(play));

        console.log('createGamefromPlay', play);

        return play;

    },

    // generates full list of moves in game
    updateMoves (game) {

        if (game.pgn === '') {
            game.moves    = [];
            game.plycount = 0;
            return;
        }

        const chess  = new Chess();
        const chess1 = new Chess();
        !chess.load_pgn(game.pgn) && console.warn('gametools.updateMoves.failed', game.pgn);

        chess.history({verbose: true})
            .map( (move, idx) => {
                chess1.move(move);
                move.fen  = chess1.fen();
                move.turn = idx;
                game.moves.push(move);
            })
        ;
        game.plycount = game.moves.length;

    },

    // lastMovePointer (list) {

    //     return (
    //         list.length % 2 === 0 ?
    //             'b' + (~~(list.length/2) -1)    :
    //             'w' + (~~(list.length/2))
    //     );

    // },

    // gameLength (game) {
    //     if (game.pgn === '') {
    //         return 0;
    //     } else {
    //         const chess  = new Chess();
    //         !chess.load_pgn(game.pgn) && console.warn('gameLength.error', game);
    //         return chess.history().length;
    //     }
    // },

    // turn2pointer (turn) {
    //     const color = ~~turn % 2 === 0 ? 'w' : 'b';
    //     const move  = Math.floor(~~turn / 2) +1;
    //     return color + move;
    // },

};

export default gametools;
