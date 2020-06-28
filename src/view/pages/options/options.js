
import './options.scss';

import DB            from '../../services/database';
import Forms         from '../../components/forms';
import Factory       from '../../components/factory';
import { PageTitle } from '../../components/misc';

const Options = Factory.create('Options', {

    view ( vnode ) {

        const { className, style } = vnode.attrs;
        const formgroups = Object.keys(DB.Options.first);

        // throw '';

        return m('div.page.options', { className, style }, [
            m(PageTitle, 'Options'),
            m('div.viewport-y', [
                //TODO: use formgrous to hide uuid
                ...formgroups.map( formgroup => {
                    const formdata = {
                        group: formgroup,
                        autosubmit: true,
                        ...DB.Options.first[formgroup],
                        submit: () => {
                            delete formdata.group;
                            delete formdata.submit;
                            delete formdata.autosubmit;
                            DB.Options.update('0', {[formgroup]: formdata}, true);
                        },
                    };
                    return m(Forms, {formdata, noheader: false, className: 'default-options group-' + formgroup});
                }),
            ]),
            m('div.mv1.ph3.w-100.tc.pv2',
                m('button.w-80.pv1', { style: 'border-radius: 15px', onclick: () => DB.reset() },        'Defaults'),
            ),

        ]);
    },

});

export default Options;
