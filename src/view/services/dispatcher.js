
import stream from 'mithril/stream';
import Logger from './logger';

const queue = stream();

let counter = 0;

function shrink (obj) {
    return JSON.stringify(obj).replace(/"/g, '').slice(0, 140);
}

function connect (handler, DEBUG=false) {

    const 
        source = handler.name,
        recent = []
    ;

    let src, tgt, params;

    queue.map(msg => {
        if (!recent.find( rec => rec.id === msg.id)){
            if (msg.source !== source && (msg.targets.includes('*') || msg.targets.includes(source))) {
                if (typeof handler[msg.action] === 'function'){
                    handler[msg.action].apply(null, msg.params);
                    while (recent.length >= 5){recent.shift();}
                    recent.push(msg);

                    src    = msg.source;
                    tgt    = msg.targets.join(';');
                    params = shrink(msg.params);
                    DEBUG && Logger.log('dispatcher', `${src} -g> ${tgt}.${msg.action} ${params}`);
                }
            }
        }
    });

    return function fire (targets=['*'], action='', params=[]) {

        counter     += 1;
        params  = typeof params  === 'string' ? [params]  : params;
        params  = typeof params  === 'number' ? [params]  : params;
        targets = typeof targets === 'string' ? [targets] : targets;

        const msg = {id: counter, source, targets, action, params};
        
        src    = msg.source;
        tgt    = msg.targets.join(';');
        params = shrink(msg.params);
        DEBUG && Logger.log('dispatcher', `${src} -r> ${tgt}.${msg.action} ${params}`);
        
        queue(msg);
        
    };
}

export default {
    connect,
};
 