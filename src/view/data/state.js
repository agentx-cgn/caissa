// import {COLOR} from '../../extern/cm-chessboard/Chessboard';
import { H }   from '../services/helper';
// import CFG     from './config';

export default H.create({

    // game : H.create({ ...H.deepcopy(CFG.gamestatetemplate) }),
    // play : H.create({ ...H.deepcopy(CFG.playstatetemplate) }),

    games : H.create({
        idx: 0,
    }),

    // boards : H.create({
    //     '0': H.create({turn: -1, moves: [], fen : CFG.fens.start, game: null }),
    // }),

    // board: H.create({
    //     fen: '',
    //     pgn: '',
    //     orientation: COLOR.white,
    //     moveStart: '',
    //     bestmove: {move: {from: '', to: ''}, ponder: {from: '', to: ''}},

    //     illustrations : CFG.board.illustrations,

    // }),

});
