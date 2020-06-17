
import './options.scss';

import DB            from '../../services/database';
import Forms         from '../../components/forms';
import Factory       from '../../components/factory';
import { PageTitle } from '../../components/misc';

const Options = Factory.create('Options', {

    view ( vnode ) {

        const { className, style } = vnode.attrs;
        const formgroups = Object.keys(DB.Options.first);

        return m('div.page.options', { className, style }, [

            m(PageTitle, 'Options'),
            m('div.mv1.ph3.w-100',
                m('button.w-100.pv1', {onclick: () => DB.reset()   },        'Defaults'),
            ),
            ...formgroups.map( formgroup => {
                const formdata = {
                    group: formgroup,
                    autosubmit: true,
                    ...DB.Options.first[formgroup],
                    submit: () => {
                        DB.Options.update('0', {[formgroup]: formdata});
                        // DB.Forms.save(formgroup, formdata);
                    },
                };
                return m(Forms, {formdata, class: 'default-options group-' + formgroup});
            }),

        ]);
    },

});

export default Options;
