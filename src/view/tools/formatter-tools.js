
import Config  from '../data/config';
import { H }   from '../services/helper';

const formattools = {

    lineResult(game) {
        let accu = '';
        game.header.Result      && (accu += game.header.Result + ' ');
        game.header.Termination && (accu += game.header.Termination + ' ');
        typeof game.timecontrol === 'object' && (accu += game.timecontrol.caption + ' ');
        typeof game.header.TimeControl === 'string' && (accu += game.header.TimeControl + ' ');
        return accu;
    },

};

export default formattools;
