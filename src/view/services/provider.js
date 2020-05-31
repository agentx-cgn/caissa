
import Parser            from './parser/pgn';
// import providerTemplates from '../data/provider';

const ImportProvider = function (template) {
    
    const provider = { 

        ...template ,
        
        error:    '',
        progress: 0,
        games:    [],
        header () {
            return `${provider.caption} ${provider.games.length} Games`; 
        },
        fetch () {
            provider.progress = 10;
            return new Promise ((resolve /*, reject */ ) => {
                provider.games    = Parser.readGames(template.source);
                provider.progress = 60;
                provider.games    = Parser.sanitizeGames(provider.games);
                provider.progress = 0;
                resolve();
            });
        },
    };

    return provider;
};

const UrlProvider = function (template) {

    const provider = { 

        ...template ,
        
        error:    '',
        progress: 0,
        games:    [],
        header () {
            return `${provider.games.length} downloaded Games`; 
        },
        fetch () {
            provider.progress = 10;
            return fetch(provider.source)
                .then( (result) => {
                    if (!result.ok) {
                        throw(result.status + ' - ' + result.statusText);
                    }
                    provider.progress = 30;
                    return result.text();
                })
                .then( text => {
                    provider.progress = 50;
                    return Parser.readGames(text);
                })
                .then( games => {
                    provider.progress = 70;
                    provider.games = Parser.sanitizeGames(games);
                })
                .then( () => {
                    provider.progress = 0;
                })
                .catch( e => {
                    provider.progress = 0;
                    provider.error = String(e);
                })
            ;
        },
    };

    return provider;

};

export { 
    ImportProvider,
    UrlProvider,
};
