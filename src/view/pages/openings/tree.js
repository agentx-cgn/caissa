
const Volume = {
    view ( v ) {
        const { href, label } = v.attrs;
        return m('div.eco-volume.tl.mt2.mh3',
            m(m.route.Link, {
                class: 'saim f3 white',
                style: 'text-decoration: none',
                href: '/openings' + href,
            }, label),
        );
    },
};
const Group = {
    view ( v ) {
        return m('div.eco-group.tl.fiom.f5.blue', m('span', v.attrs, v.children));
    },
};
const Variation = {
    view ( v ) {
        return m('div.eco-variation.tl.fiom.f4.white', m('span', v.attrs, v.children));
    },
};
const Moves = {
    view ( v ) {
        return m('div.eco-moves.tl.fiom.f4.white', m('span', v.attrs, v.children));
    },
};

const Tree = {
    Volume,
    Group,
    Variation,
    Moves,
};

export default Tree;
