
import Caissa    from '../../caissa';
import Providers from '../../data/provider';
import Factory   from '../../components/factory';
import { PageTitle, HeaderLeft, FlexList, FlexListEntry, GrowSpacer} from '../../components/misc';

const Sources = Factory.create('Sources', {

    view ( vnode ) {

        const { className, style } = vnode.attrs;

        return m('div.page.sources', { className, style }, [
            m(PageTitle, 'Choose a Game Collection'),
            m(FlexList,
                Providers.list().map( provider => {

                    const onclick = async (e) => {
                        e.redraw = false;
                        if (!provider.games.length){
                            await provider.fetch();
                            if (!provider.error){
                                Caissa.route('/games/:idx/', {idx: provider.idx});
                            }
                        } else {
                            Caissa.route('/games/:idx/', {idx: provider.idx});
                        }
                    };

                    return m(FlexListEntry, { onclick, class: 'sources' }, [

                        m('img.source-icon',          {src: provider.icon}),
                        m('div.source-caption.f4',          provider.caption),
                        m('div.source-subline.f5.ellipsis', provider.subline),

                        provider.games.length
                            ? m('div.games-loaded', provider.games.length + ' games loaded')
                            : '',
                        provider.error
                            ? m('div.source-error.f5', provider.error)
                            : '',
                        provider.progress
                            ? m('div.source-progress-on',  {style: `width: ${provider.progress}%;`})
                            : m('div.source-progress-off'),

                    ]);

                }),
            ),
            m(HeaderLeft, 'Or download Online Games'),
            m(GrowSpacer),
        ]);
    },
});

export default Sources;
