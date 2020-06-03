
import { H } from '../services/helper';

export default {
    create (name, comp) {
        return H.deepCreateFreeze(comp, {
            name,
        });
    },
};

