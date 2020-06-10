
import Factory   from './factory';

let dispatcher = null;

const Last = Factory.create('Last', {

    onregister (disp) {
        dispatcher = disp;
    },
    view ( ) {
        return m('div.last.dn');
    },
    onupdate ({attrs:{msecs}}) {
        setTimeout( () => dispatcher.send('onafterupdates', { msecs }), 0);
    },
    oncreate ({attrs:{msecs}}) {
        setTimeout( () => dispatcher.send('onafterupdates', { msecs }), 0);
    },

});

export default Last;
