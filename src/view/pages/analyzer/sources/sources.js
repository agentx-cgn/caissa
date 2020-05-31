
import Caissa    from '../../../caissa';
import Providers from '../../../data/provider';
import { TitleLeft, HeaderLeft, FlexList, FlexListEntry} from '../../../components/misc';

export default {

    view () {
        return m('[',
            m(TitleLeft, 'Choose a Game Collection'),
            m(FlexList,
                Providers.list.map( provider => {

                    const onclick = async () => {
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
                            ? m('div.source-loaded', provider.games.length + ' games loaded')
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

        );
    },
};
