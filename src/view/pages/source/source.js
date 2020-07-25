
// import Caissa    from '../../caissa';
import Providers from '../../data/provider';
import Factory   from '../../components/factory';
import { PageTitle, FlexList, Spacer} from '../../components/misc';

const Source = Factory.create('Source', {

    view ( vnode ) {

        const { className, style } = vnode.attrs;

        return m('div.page.sources', { className, style }, [
            m(PageTitle, 'Choose a Game Collection'),
            m(Spacer),
            m(FlexList,
                Providers.list().map( () => {}),
            ),
        ]);
    },

});

export default Source;
