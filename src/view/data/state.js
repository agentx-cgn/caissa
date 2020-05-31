import {COLOR} from '../../extern/cm-chessboard/Chessboard';
import CFG from './config';

export default {

    game : { ...CFG.gamestatetemplate },
    play : { ...CFG.playstatetemplate },

    games : {
        idx: 0,
    },

    board: {
        fen: '',
        pgn: '',
        orientation: COLOR.white,
        moveStart: '',
        bestmove: {move: {from: '', to: ''}, ponder: {from: '', to: ''}},

        illustrations : CFG.board.illustrations,

    },
    // chess: {
    //     pgn:        '',
    //     fen:        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    //     curMove:    0,
    // },

};
