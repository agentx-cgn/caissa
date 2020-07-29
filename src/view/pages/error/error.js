
import Factory       from '../../components/factory';
import { Spacer, GrowSpacer, PageTitle, TextCenter, FlexList } from '../../components/misc';

const Error = Factory.create('Error', {
    view ( vnode) {

        const { className, style } = vnode.attrs;

        return m('div.page.error', { className, style }, [
            m(PageTitle,  'Error' ),
            m(FlexList, [
                m(Spacer),
                m(TextCenter,    JSON.stringify(vnode.attrs) ),
                m(GrowSpacer),
            ]),
        ]);

    },
});

export default Error;
