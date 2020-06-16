
// import H           from '../services/helper';
import Factory     from '../components/factory';
// import {ConfigPages} from '../data/config-pages';
// import History     from '../services/history';
// import { Nothing } from './../components/misc';

const Sections = Factory.create('Sections', {

    view ( vnode ) {

        return m('section.bg-555', {}, vnode.children);

    },

});

export default Sections;
