
import Config  from '../data/config';
import { H, $$ }   from '../services/helper';

const Tools = {

    scrollTurnIntoView (state, msecs=60) {

        if (state.moves.length){
            setTimeout( () => {

                const selectorElem = 'td[data-turn="' + state.game.turn + '"]';
                const selectorView = 'div.gm-moves';
                const isVisible    = H.isVisibleInView($$(selectorElem), $$(selectorView));

                if (!selectorElem || !selectorView) {
                    console.warn('scrollIntoView', selectorElem, selectorView);
                }

                if ( !isVisible && $$(selectorElem) ){
                    $$(selectorElem).scrollIntoView(true);
                }

            }, msecs);
        }

    },

    genGameHash (game) {
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

    // matches depth to string with ranges
    resolveDifficulty (value) {

        const diffs = Config.plays.difficulties;

        let hit = diffs['0'];
        let result = hit;

        H.range(0, 31).forEach( num => {
            hit    = diffs[num] ? diffs[num] : hit;
            result = ~~num <= value ? hit : result;
        });

        return result;

    },

    resolvePlayers (game) {

        const opponents = Config.opponents;

        const w = game.mode[0];
        const b = game.mode[2];

        return {
            white: opponents[w],
            black: opponents[b],
        };

    },

    createPlayTemplate (playtemplate, formdata) {

        const play = {
            uuid: H.shortuuid(),
            turn: 0,
            ...Tools.resolvePlayers(playtemplate),
            ...formdata,
            ...playtemplate,
            difficulty: Tools.resolveDifficulty(formdata.depth),
            pgn: '',
        };

        return play;

    },

};

export {Tools as default};
