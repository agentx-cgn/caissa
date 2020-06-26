
import board     from './board-tools';
import game      from './game-tools';
import global    from './global-tools';
import format    from './format-tools';

export default {
    ...global,
    Board:  { ...board  },
    Games:  { ...game   },
    Format: { ...format },
};
