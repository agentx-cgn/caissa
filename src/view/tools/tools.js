import analysis from './analysis-tools';
import board    from './board-tools';
import game     from './game-tools';
import global   from './global-tools';

export default {
    ...analysis,
    ...board,
    ...game,
    ...global,
};
