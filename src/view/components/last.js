
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
        setTimeout( () => dispatcher.send('onafterupdates', { msecs }));
    },
    oncreate ({attrs:{msecs}}) {
        setTimeout( () => dispatcher.send('onafterupdates', { msecs }));
    },

});

export default Last;
