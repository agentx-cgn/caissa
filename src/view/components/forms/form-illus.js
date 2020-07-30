
import DB      from '../../services/database';
import Factory from '../factory';
import Forms   from './forms';

const DEBUG = false;

const FormIllus = Factory.create('FormIllus', {

    view () {

        const group    = 'board-illustrations';
        const options  = DB.Options.first[group];
        const formdata = {
            group,
            ...options,
            autosubmit: true,
            submit : () => {
                DEBUG && console.log('FormIllus.submit', formdata);
                delete formdata.group;
                delete formdata.submit;
                delete formdata.autosubmit;
                DB.Options.update('0', { [group]: formdata }, true);
            },
        };

        return m(Forms, {
            formdata,
            noheader: true,
            className: 'default-options group-' + group,
        });

    },

});

export default FormIllus;
