
import { REGEX } from '../constants';
import parseId from './parseId';
import parseOption from './parseOption';

export default function initReducer(result, line) {

    const cmdType = REGEX.cmdType.exec(line);
    if (!cmdType){
        console.log('initRecucer.unkown', line);
        return result;
    }
    switch (cmdType[1]) {
    case 'id':
        result.id = {
            ...result.id,
            ...parseId(line),
        };
        break;
    case 'option':
        result.options = {
            ...result.options,
            ...parseOption(line),
        };
        break;
    }
    return result;
}
