// import analysis from './analysis-tools';
import board    from './board-tools';
import game     from './game-tools';
import global   from './global-tools';

export default {
    ...global,
    board: { ...board },
    games: { ...game },
};
