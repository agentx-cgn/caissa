
const info = {
    view ( vnode) {
        
        let { url } = vnode.attrs;
        url = decodeURIComponent(url);
        console.log('info', url);
        
        // return m('iframe.w-100.h-100', {srcdoc: decodeURI(url), style: 'border:0; padding:0'});
        return m('iframe.w-100.h-100', {src: 'https://en.wikipedia.org/w/index.php?title=Gamergate_controversy&diff=650003294&oldid=649972067', style: 'border:0; padding:0'});

    },
};

export { info as default };
