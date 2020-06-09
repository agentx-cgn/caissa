
import Component from './component';

let dispatcher = null;

const Last = Component.create('Last', {

    onregister (disp) {
        dispatcher = disp;
    },
    view ( ) {
        return m('div.last.dn');
    },
    onupdate ({attrs:{msecs}}) {
        dispatcher.send('onafterupdates', { msecs });
    },
    oncreate ({attrs:{msecs}}) {
        dispatcher.send('onafterupdates', { msecs });
    },

});

export default Last;
