const figlet = require('figlet');
const color = '\x1b[36m';
console.log(
        figlet.textSync('Echo Search', {
            font: 'Standard',
            horizontalLayout: 'default',
            verticalLayout: 'default',
        })
    );
console.log(color, 'Starting rollup Build for Echo Search! ')

