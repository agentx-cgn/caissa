
import ECO          from '../../services/ecos';
import { H }        from '../../services/helper';
import Tree         from './tree';
import { PageTitle, FlexListGrow } from '../../components/misc';

const DEBUG = true;

const view = function ( vnode ) {

    const { tag, attrs } = vnode;
    const { route, params: { volume='', group='', opening='', variation='' }, className, style } = attrs;

    DEBUG && console.log('Tree.view', { route, volume, group, opening, variation } );

    // https://0.0.0.0:3000/#!/openings/
    if(tag.name === 'Openings' && route) {
        return m('div.page.openings', { className, style },
            m(PageTitle, 'Openings'),
            m(FlexListGrow, { class: 'openings-list' },
                H.map(ECO.volumes, (key, value) => {
                    return m('[',
                        m(Tree.VolumeHeader, { href: `/${key}/`, label: key + ' - ' + value}),
                        m('div.mh3', m(Tree.MovesLines, { lines:  ECO.volumesMoves(key)})),
                        m('div.mh3', m(Tree.GroupsList, { volume: key, groups: ECO.volumeGroups(key)})),
                    );
                }),
            ),
        );

    // https://0.0.0.0:3000/#!/openings/:A/
    } else if (tag.name === 'Volumes') {
        return m('div.page.volumes', { className, style },
            m(PageTitle, 'Openings (Volu)'),
            route && m(FlexListGrow, { class: 'groups-list' },
                m(Tree.VolumeList, { selected: volume }),
                m(Tree.VolumeHeader, { href: `/${volume}/`, label: volume + ' - ' + ECO.volumes[volume]}),
                m('div.mh3', m(Tree.MovesLines, { lines:  ECO.volumesMoves(volume)})),
                m('div.mh3', m(Tree.GroupsTable, { volume, groups: ECO.volumeGroups(volume)})),
            ),
        );

    // https://0.0.0.0:3000/#!/openings/:B/B00/
    } else if(tag.name === 'Groups') {
        return m('div.page.groups', { className, style },
            m(PageTitle, 'Openings (Grou)'),
            route && m(FlexListGrow, { class: 'groups-list' },
                m(Tree.VolumeList, { selected: volume }),
                m(Tree.VolumeHeader, { href: `/${volume}/`, label: volume + ' - ' + ECO.volumes[volume]}),
                m(Tree.GroupHeader,  { href: `/${volume}/${group}/`, label: group + ' - ' + ECO.groupHeader(volume, group)}),
                // m('div.mh3', m(Tree.MovesLines, { lines:  ECO.volumesMoves(volume)})),
                // m('div.mh3', m(Tree.GroupsTable, { volume, groups: ECO.volumeGroups(volume)})),
                m('div.ma3', H.map(ECO.groupOpenings(group), (op, [name, moves]) => {
                    return m('[',
                        m('div.mv1.mt3.ceee.sair.f4', op, ' - ', name),
                        m('div.mv1.fior', moves),
                    );
                })),
            ),
        );

    } else if(tag.name === 'Chapters') {
        return m('div.page.chapters', { className, style },
            m(PageTitle, 'Openings (Chap)'),
        );

    } else if(tag.name === 'Openings') {
        return m('div.page.variations', { className, style },
            m(PageTitle, 'Openings (Open)'),
        );

    } else if(tag.name === 'Variations') {
        return m('div.page.variations', { className, style },
            m(PageTitle, 'Openings (Vari)'),
        );

    } else {
        return m('wtf', tag.name);
    }

};

export default view;
