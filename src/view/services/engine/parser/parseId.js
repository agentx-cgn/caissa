import { REGEX } from '../constants';

export default function parseId(line) {
    const parsed = REGEX.id.exec(line);
    if (!parsed || !parsed[1] || !parsed[2]) return null;
    return {
        [parsed[1]]: parsed[2],
    };
}
