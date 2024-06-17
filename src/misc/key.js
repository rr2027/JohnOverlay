const { GlobalKeyboardListener } = require('node-global-key-listener');


const listener = new GlobalKeyboardListener();


listener.addListener((e) => {
    if (e.state === 'DOWN') { 
        console.log(`You pressed: ${e.name} (Raw code: ${e.rawKey._nameRaw})`);
    }

});





