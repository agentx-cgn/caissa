
import Ecos         from '../../services/ecos';
import { H }        from '../../services/helper';
import Tree         from './tree';
import { PageTitle, GrowSpacer, FlexList } from '../../components/misc';

const pad = H.padZero;

const DEBUG = true;

const ontitleclick = e => {
    e.redraw = false;
    H.downloadJson(Ecos.tree);
};


function groupNodes(volume){

    const groups = [];

    H.map(volume, (key, val) => {
        key !== 'label' && groups.push([key, val]);
    });

    return groups.sort().map( (group, idx) => {
        const link = m(m.route.Link, {
            class: 'saim f4',
            style: 'text-decoration: none; color: #333',
            href: '/openings/' + group[0] + '/',
        }, group[1]);
        return idx < groups.length -1
            ? m('span', [ link,  ', '] )
            : m('span', link)
        ;
    });

}

function collectOpenings(group){
    if (group.includes('-')){
        const [first, last] = group.split('-');
        const start = ~~first.slice(1);
        const end   = ~~last.slice(1) +1;
        const volume = first[0];
        return H.range(start, end).map( num => volume + pad(num));

    } else {
        return [group];
    }

}



const view = function ( vnode ) {

    const { tag, attrs } = vnode;
    const { route, params: { volume='', group='', opening='', variation='' }, className, style } = attrs;

    DEBUG && console.log('Tree.view', { route, volume, group, opening, variation } );

    if(tag.name === 'Openings' && route) {
        return m('div.page.openings', { className, style },
            m(PageTitle, { onclick: ontitleclick }, 'Openings'),
            m(FlexList, { style: '', class: 'openings-list' },
                H.map(Ecos.volumes, (key, value) => {
                    return m('[',
                        m(Tree.Volume, { href: `/${key}/`, label: key + ' - ' + value.label}),
                        m('div', {class: 'mh3'}, groupNodes(value)),
                    );
                }),
                m(GrowSpacer),
            ),
        );

    } else if (tag.name === 'Volumes') {
        return m('div.page.volumes', { className, style },
            m(PageTitle, { onclick: ontitleclick }, 'Openings (Volu)'),
            route && m(FlexList, { style: '', class: 'groups-list' },
                H.map(Ecos.volumes, (key, value) => {
                    return m('[',
                        m(Tree.Volume, { href: `/${key}/`, label: key + ' - ' + value.label}),
                        key === volume && m('div', {class: 'mh3'}, groupNodes(value)),
                    );
                }),
                m(GrowSpacer),
            ),
        );

    } else if(tag.name === 'Groups') {
        return m('div.page.groups', { className, style },
            m(PageTitle, { onclick: ontitleclick }, 'Openings (Chap)'),
        );

    } else if(tag.name === 'Chapters') {
        return m('div.page.chapters', { className, style },
            m(PageTitle, { onclick: ontitleclick }, 'Openings (Chap)'),
        );

    } else if(tag.name === 'Variations') {
        return m('div.page.variations', { className, style },
            m(PageTitle, { onclick: ontitleclick }, 'Openings (Vari)'),
        );

    } else {
        return m('wtf');
    }

    // } else if (!group) {
    //     return m('div.page.volumes', { className, style },
    //         m(PageTitle, { onclick: ontitleclick }, 'Openings'),
    //         m(Spacer),
    //         m(FlexList, { style: '', class: 'volume-list' },
    //             H.map(Ecos.volumes, (letter, volume) => {
    //                 return m('[',
    //                     m(Tree.Volume, letter + ' - ' + volume.label),
    //                     m('div', {style: ''}, groupNodes(volume)),
    //                 );
    //             }),
    //         ),
    //     );
    // }

    // if (group === '') {
    //     return m('div.page.openings', { className, style },
    //         m(PageTitle, { onclick: ontitleclick }, 'Openings'),
    //         m(Spacer),
    //         m(FlexList, { style: '', class: 'volume-list' },
    //             H.map(Ecos.volumes, (letter, volume) => {
    //                 return m('[',
    //                     m(Tree.Volume, letter + ' - ' + volume.label),
    //                     m('div', {style: ''}, groupNodes(volume)),
    //                 );
    //             }),
    //         ),
    //     );

    // } else {
    //     return m('div.page.groups', { className, style },
    //         m(PageTitle, { onclick: ontitleclick }, 'Openings'),
    //         m(Spacer),
    //         m(FlexList, { style: '', class: 'group-list' },
    //             H.map(Ecos.volumes, (letter, volume) => {

    //                 if (volume[group]){
    //                     return m('[', [
    //                         m(Tree.Group, group + ' - ' + volume[group]),
    //                         ...collectOpenings(group).map( op => {
    //                             return m('span', op);
    //                         }),
    //                     ]);

    //                 } else {
    //                     return m(Tree.Volume, letter + ' - ' + volume.label);
    //                 }
    //             }),
    //         ),
    //     );

    // }
};

export default view;
