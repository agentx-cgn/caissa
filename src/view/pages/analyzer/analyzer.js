
// import './board.scss';

import Factory           from '../../components/factory';
// import DB                from '../../services/database';
// import Tools             from '../../tools/tools';


// const DEBUG = true;

const Analyzer = Factory.create('Analyzer', {
    view (  ) {

        return m('Analyzer');

    },
});

export default Analyzer;
