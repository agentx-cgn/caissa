
import './options.scss';

import DB            from '../../services/database';
import Forms         from '../../components/forms';
import Factory       from '../../components/factory';
import { TitleLeft } from '../../components/misc';

let formgroups = Object.keys(DB.Options);

const Options = Factory.create('Options', {

    oncreate: function( /* vnode */ ) {
        formgroups = Object.keys(DB.Options);
    },
    view ( vnode ) {

        const { className, style } = vnode.attrs;

        return m('div.page.options', { className, style }, [

            m(TitleLeft, 'Options'),
            m('div.mv1.ph3.w-100',
                m('button.w-100.pv1', {onclick: () => DB.reset()   },        'Defaults'),
            ),
            ...formgroups.map( formgroup => {
                const formdata = {
                    group: formgroup,
                    autosubmit: true,
                    ...DB.Options[formgroup],
                    submit: () => {
                        DB.Forms.save(formgroup, formdata);
                    },
                };
                return m(Forms, {formdata, class: 'default-options group-' + formgroup});
            }),

        ]);
    },

});

export default Options;
