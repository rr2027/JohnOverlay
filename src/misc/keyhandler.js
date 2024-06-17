const iohook = require('iohook');

// Set up the event listener for key presses
iohook.on('keydown', event => {
    console.log(`You pressed key code: ${event.keycode}`);
    // Add your custom logic here to show/hide application or perform other actions
});

// Start the iohook event listener
iohook.start();

// Handle graceful exit
process.on('SIGINT', () => {
    console.log('Exiting...');
    iohook.unload();
    iohook.stop();
    process.exit();
});
