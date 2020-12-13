
import { REGEX } from '../constants';
import parseBestmove from './parseBestmove';
import parseInfo from './parseInfo';

export default function goReducer(result, line) {

    const cmdType = REGEX.cmdType.exec(line);
    if (!cmdType){
        // console.log('goReducer.unkown', line);
        return result;
    }
    switch (cmdType[1]) {
    case 'bestmove': {
        const best = parseBestmove(line);
        if (best.bestmove) result.bestmove = best.bestmove;
        if (best.ponder) result.ponder = best.ponder;
        break;
    }
    case 'info': {
        const info = parseInfo(line);
        if (info) result.info.push(info);
        break;
    }
    }
    return result;
}
