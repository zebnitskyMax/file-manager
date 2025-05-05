// index.js
const readline = require('readline');
const os = require('os');
const path = require('path');
const {
    parseArgs
} = require('./utils');
const commands = require('./commands');

const args = parseArgs(process.argv);
const username = args['--username'] || 'User';

let currentDir = os.homedir();

console.log(`Welcome to the File Manager, ${username}!`);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
});

const printCurrentDir = () => {
    console.log(`You are currently in ${currentDir}`);
};

const handleCommand = async (line) => {
    line = line.trim();
    if (!line) {
        printCurrentDir();
        rl.prompt();
        return;
    }
    if (line === '.exit') {
        console.log(`Thank you for using File Manager, ${username}, goodbye!`);
        rl.close();
        return;
    }

    // Parse command and args
    const [cmd, ...argsArr] = line.split(' ');
    try {
        switch (cmd) {
            case 'nwd':
                printCurrentDir();
                break;
            case 'up':
                currentDir = commands.goUp(currentDir);
                break;
            case 'cd':
                currentDir = await commands.changeDir(currentDir, argsArr[0]);
                break;
            case 'ls':
                await commands.listDir(currentDir);
                break;
            case 'cat':
                await commands.readFile(currentDir, argsArr[0]);
                break;
            case 'add':
                await commands.createFile(currentDir, argsArr[0]);
                break;
            case 'mkdir':
                await commands.createFolder(currentDir, argsArr[0]);
                break;
            case 'rn':
                await commands.rename(currentDir, argsArr[0], argsArr[1]);
                break;
            case 'cp':
                await commands.copyFile(currentDir, argsArr[0], argsArr[1]);
                break;
            case 'mv':
                await commands.moveFile(currentDir, argsArr[0], argsArr[1]);
                break;
            case 'rm':
                await commands.deleteFile(currentDir, argsArr[0]);
                break;
            case 'os':
                await commands.osInfo(argsArr[0]);
                break;
            case 'hash':
                await commands.hashFile(currentDir, argsArr[0]);
                break;
            case 'compress':
                await commands.compressFile(currentDir, argsArr[0], argsArr[1]);
                break;
            case 'decompress':
                await commands.decompressFile(currentDir, argsArr[0], argsArr[1]);
                break;
            default:
                console.log('Invalid input');
        }
    } catch (err) {
        console.log('Operation failed');
    }
    printCurrentDir();
    rl.prompt();
};

rl.on('line', handleCommand);
rl.on('close', () => {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
    process.exit(0);
});

// Initial prompt
printCurrentDir();
rl.prompt();