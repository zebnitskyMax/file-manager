// utils.js
function parseArgs(argv) {
    const args = {};
    argv.slice(2).forEach((arg) => {
        if (arg.startsWith('--')) {
            const [key, value] = arg.split('=');
            args[key] = value;
        }
    });
    return args;
}

module.exports = {
    parseArgs
};