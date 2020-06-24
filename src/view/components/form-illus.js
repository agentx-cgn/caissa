
import Factory from './factory';
import Forms   from './forms';
import Caissa  from '../caissa';
import DB      from '../services/database';

const FormIllus = Factory.create('FormIllus', {

    view ( vnode ) {

        const { board } = vnode.attrs;
        const formgroup = 'board-illustrations';
        const formdata  = {
            ...board.illustrations,
            group: formgroup,
            autosubmit: true,
            submit : () => {
                console.log(formdata);
                delete formdata.group;
                delete formdata.submit;
                delete formdata.autosubmit;
                DB.Boards.update(board.uuid, { illustrations: formdata });
            },
        };

        return m(Forms, { formdata, noheader: false, style:'background: #658199', className: 'default-options group-' + formgroup });

    },

});

export default FormIllus;
