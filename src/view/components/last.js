
import Component from './component';

let dispatcher = null;

const Last = Component.create('Debug', {

    onregister (disp) {
        dispatcher = disp;
    },
    view ( ) {
        return m('div.last.dn');
    },
    onupdate ({attrs:{msecs}}) {
        dispatcher.send({event: 'onafterupdates', msecs});
    },
    oncreate ({attrs:{msecs}}) {
        dispatcher.send({event: 'onafterupdates', msecs});
    },

});

export default Last;
