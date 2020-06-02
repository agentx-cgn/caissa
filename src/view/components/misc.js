
import { H } from '../services/helper';
import './components.scss';

const Backdrop = ( function () {

    let callback = null;
    let visible = false;

    const onclick = () => {
        visible = false;
        callback && callback();
    };

    return {
        show (cb) {
            callback = cb || null;
            visible = true;
        },
        hide () {
            callback = null;
            visible = false;
        },
        view () {
            const style = visible
                ? 'z-index: 5; position:absolute; top:0;left:0; width:100%; height: 100%; background-color: rgba(128, 128, 128, 0.5)'
                : ''
            ;
            return m('div.backdrop', { style, onclick });
        },
    };

}());


const  Sample = {
    view ( vnode ) {
        return m('div', vnode.attrs, m.trust('&nbsp;'));
    },
};

const Nothing = {
    view ( ) {
        return m('div');
    },
};

const Spacer = {
    view ( vnode ) {
        return m('div.spacer', vnode.attrs, m.trust('&nbsp;'));
    },
};

const GrowSpacer = {
    view ( vnode ) {
        return m('div.spacer.flex-grow', vnode.attrs, m.trust('&nbsp;'));
    },
};

const ListFilter = {
    view ( vnode ) {

        const { oninput } = vnode.attrs;

        return m('input[type=text].w-100.mv2', {
            oninput,
            placeholder: 'type to filter',
        });

    },
};

const TitleLeft = {
    view ( v ) {
        return m('div.title-left.tl.saim.white', m('span', v.attrs, v.children));
    },
};
const HeaderLeft = {
    view ( v ) {
        return m('div.header-left.tl.saim.f3.white', m('span', v.attrs, v.children));
    },
};
const TextLeft = {
    view ( v ) {
        return m('div.text-left.tl.fiom.f4.white', m('span', v.attrs, v.children));
    },
};
const TextCenter = {
    view ( v ) {
        return m('div.text-center.tc.fiom.f4.white', m('span', v.attrs, v.children));
    },
};
const HeaderCentered = {
    view ( v ) {
        return m('div.header-center.tc.saim.f3.white', v.attrs, m('span', v.children));
    },
};


const FlexList = {
    view ( vnode ) {
        return m('div.flexlist', vnode.attrs, vnode.children);
    },
};

const FixedList = {
    view ( vnode ) {
        return m('div.fixedlist.viewport-y.noselect', vnode.attrs, vnode.children);
    },
};

const FlexListFixed = {
    view ( vnode ) {
        // return m('div.flexlist.flex.flex-column.flex-grow.noselect', vnode.attrs, vnode.children);
        return m('div.flexlist.flex.flex-column.noselect', vnode.attrs, vnode.children);
    },
};

const FlexListShrink = {
    view ( vnode ) {
        return m('div.flexlist.flex.flex-column.flex-shrink.viewport-y.noselect', vnode.attrs, vnode.children);
    },
};

const FlexListEntry = {
    view ( vnode ) {
        const { style, onclick } = vnode.attrs;
        return m('div.flexlistentry', { style, onclick }, vnode.children);
    },
};

const FlexListPlayEntry = {

    view ( vnode ) {

        const { play, onclick } = vnode.attrs;

        return m(FlexListEntry, {onclick}, [
            m('.fiom.f4', play.white + ' vs ' + play.black),
            m('.fior.f5', H.date2isoLocal(new Date(play.timestamp))),
            m('.fior.f5', `${play.difficulty} (${play.depth}) / ${play.time} secs`),
        ]);
    },

};

export {

    Sample,
    Nothing,

    Backdrop,

    Spacer,
    GrowSpacer,

    ListFilter,

    TitleLeft,
    HeaderLeft,
    HeaderCentered,
    TextCenter,
    TextLeft,

    FixedList,
    FlexList,
    FlexListFixed,
    FlexListShrink,

    FlexListEntry,
    FlexListPlayEntry,

};


