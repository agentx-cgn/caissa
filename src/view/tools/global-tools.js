
import Config  from '../data/config';
import { H }   from '../services/helper';

const globaltools = {

    // m.buildPathname
    interpolate (route, params) {
        let target = route;
        H.each(params, (key, val) => {
            target = target.replace(':' + key, val);
        });
        return target;
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

};

export default globaltools;
