
import { H } from '../../services/helper';

const VolumeHeader = {
    view ( v ) {
        const { href, label } = v.attrs;
        return m('div.eco-volume.tl.mt2.mh3',
            m(m.route.Link, {
                class: 'saim f3 white',
                href: '/openings' + href,
            }, label),
        );
    },
};

const GroupHeader = {
    view ( v ) {
        const { href, label } = v.attrs;
        return m('div.eco-group.tl.mt2.mh3',
            m(m.route.Link, {
                class: 'saim f4 white',
                href: '/openings' + href,
            }, label),
        );
    },
};

const VolumeList = {
    view ( v ) {
        const { selected } = v.attrs;
        const linker = function (letter) {
            const className = 'saim f3 white ' + (letter === selected ? 'selected' : '');
            return m(m.route.Link, {className, style: 'text-decoration: none', href: '/openings/A/'}, letter);
        };
        return m('div.eco-volume-list',
            m('table.w-100', {style:'background-color: #678'},
                m('tr',
                    'A B C D E'.split(' ').map( letter => m('td.tc.pv1', linker(letter)) ),
                )));
    },
};

const Group = {
    view ( v ) {
        return m('div.eco-group.tl.fiom.f5.blue', m('span', v.attrs, v.children));
    },
};

const GroupLink = {
    view ( v ) {
        const { href, color='cddd' } = v.attrs;
        return m(m.route.Link, { href,
            class: ' saim f4 ' + color,
        }, v.children);
    },
};

const GroupsList = {
    view ( v ) {
        const { volume, groups } = v.attrs;
        const list = Object.keys(groups);
        return list.map( (group, idx) => {
            const link = m(GroupLink, { color: 'c444', href: `/openings/${volume}/${group}/` }, groups[group]);
            return idx < list.length -1
                ? m('span', [ link,  ', '])
                : m('span', link)
            ;
        });
    },
};

const GroupsTable = {
    view ( v ) {
        const { volume, groups } = v.attrs;
        return m('table',
            H.map(groups, (group, value) => {
                const link = m(GroupLink, { color: 'ceee', href: `/openings/${volume}/${group}/` }, value);
                return group !== 'label' && m('tr',
                    m('td.fiom', group),
                    m('td.saim.f4.cddd', {style: 'padding-left: 1rem'}, link),
                );
            }),
        );
    },
};
const MovesLines = {
    view ( v ) {
        const { lines } = v.attrs;
        return m('div.mh1.mv2.cddd.w-100', { style: 'border-left: 1px solid #666' },
            lines.map(line => m('div.pl2.fior.f5.ellipsis', line)),
        );
    },
};

const Tree = {
    VolumeHeader,
    VolumeList,
    Group,
    GroupHeader,
    GroupsList,
    GroupsTable,
    MovesLines,
};

export default Tree;
