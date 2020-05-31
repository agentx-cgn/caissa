
import { REGEX, INFO_NUMBER_TYPES } from '../constants';

export default function parseInfo(line) {
    const info = {};
    for (let [key, val] of Object.entries(REGEX.info)) {
        const parsed = val.exec(line);
        if (!parsed) continue;
        switch (key) {
        case 'score':
            info[key] = {
                unit: parsed[1],
                value: parseFloat(parsed[2]),
            };
            break;
        default:
            if (INFO_NUMBER_TYPES.includes(key)) {
                info[key] = parseFloat(parsed[1]);
            } else {
                info[key] = parsed[1];
            }
        }
    }
    // forEach(REGEX.info, (val, key) => {
    //     const parsed = val.exec(line);
    //     if (!parsed) return;
    //     switch (key) {
    //     case 'score':
    //         info[key] = {
    //             unit: parsed[1],
    //             value: parseFloat(parsed[2]),
    //         };
    //         break;
    //     default:
    //         if (INFO_NUMBER_TYPES.includes(key)) {
    //             info[key] = parseFloat(parsed[1]);
    //         } else {
    //             info[key] = parsed[1];
    //         }
    //     }
    // });
    if (!Object.keys(info).length) {
        return;
    }
    return info;
}
