// commands.js
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Helper to check if a path is absolute
const isAbsolutePath = (p) => path.isAbsolute(p);

// Helper to resolve path relative to current directory
const resolvePath = (cwd, targetPath) => {
    if (isAbsolutePath(targetPath)) {
        return targetPath;
    }
    return path.resolve(cwd, targetPath);
};

// 1. Navigation & Working Directory
function goUp(currentDir) {
    const parentDir = path.dirname(currentDir);
    // Prevent going above root
    if (parentDir === currentDir || parentDir === '.' || parentDir === path.parse(currentDir).root) {
        return currentDir;
    }
    return parentDir;
}

async function changeDir(cwd, targetPath) {
    if (!targetPath) throw new Error();
    const newPath = resolvePath(cwd, targetPath);
    const exists = await fs.promises.stat(newPath).then(() => true).catch(() => false);
    if (exists) {
        return newPath;
    }
    throw new Error();
}

// 2. List directory
async function listDir(cwd) {
    const entries = await fs.promises.readdir(cwd, {
        withFileTypes: true
    });
    const folders = entries.filter(e => e.isDirectory()).map(e => e.name).sort();
    const files = entries.filter(e => e.isFile()).map(e => e.name).sort();

    folders.forEach(folder => console.log(`${folder} - folder`));
    files.forEach(file => console.log(`${file} - file`));
}

// 3. Read file
async function readFile(cwd, filename) {
    if (!filename) throw new Error();
    const filePath = resolvePath(cwd, filename);
    const stream = fs.createReadStream(filePath, {
        encoding: 'utf8'
    });
    stream.on('error', () => {
        throw new Error();
    });
    for await (const chunk of stream) {
        process.stdout.write(chunk);
    }
    console.log(); // newline after content
}

// 4. Create empty file
async function createFile(cwd, filename) {
    if (!filename) throw new Error();
    const filePath = resolvePath(cwd, filename);
    await fs.promises.writeFile(filePath, '');
}

// 5. Create folder
async function createFolder(cwd, folderName) {
    if (!folderName) throw new Error();
    const folderPath = resolvePath(cwd, folderName);
    await fs.promises.mkdir(folderPath);
}

// 6. Rename file
async function rename(cwd, oldName, newName) {
    if (!oldName || !newName) throw new Error();
    const oldPath = resolvePath(cwd, oldName);
    const newPath = resolvePath(cwd, newName);
    await fs.promises.rename(oldPath, newPath);
}

// 7. Copy file using streams
async function copyFile(cwd, src, destFolder) {
    if (!src || !destFolder) throw new Error();
    const srcPath = resolvePath(cwd, src);
    const destDir = resolvePath(cwd, destFolder);
    const filename = path.basename(srcPath);
    const destPath = path.join(destDir, filename);

    await fs.promises.access(srcPath);
    await fs.promises.mkdir(destDir, {
        recursive: true
    });

    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(srcPath);
        const writeStream = fs.createWriteStream(destPath);
        readStream.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('finish', resolve);
        readStream.pipe(writeStream);
    });
}

// 8. Move file
async function moveFile(cwd, src, destFolder) {
    await copyFile(cwd, src, destFolder);
    const srcPath = resolvePath(cwd, src);
    await fs.promises.unlink(srcPath);
}

// 9. Delete file
async function deleteFile(cwd, filename) {
    if (!filename) throw new Error();
    const filePath = resolvePath(cwd, filename);
    await fs.promises.unlink(filePath);
}

// 10. OS info
async function osInfo(param) {
    switch (param) {
        case '--EOL':
            console.log(JSON.stringify(os.EOL));
            break;
        case '--cpus':
            const cpus = os.cpus();
            console.log(`Number of CPUs: ${cpus.length}`);
            cpus.forEach((cpu, index) => {
                console.log(`CPU ${index + 1}: Model: ${cpu.model}, Speed: ${cpu.speed / 1000} GHz`);
            });
            break;
        case '--homedir':
            console.log(os.homedir());
            break;
        case '--username':
            console.log(os.userInfo().username);
            break;
        case '--architecture':
            console.log(os.arch());
            break;
        default:
            console.log('Invalid OS parameter');
    }
}

// 11. Hash calculation
async function hashFile(cwd, filename) {
    if (!filename) throw new Error();
    const filePath = resolvePath(cwd, filename);
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.on('error', reject);
        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => {
            const digest = hash.digest('hex');
            console.log(digest);
            resolve();
        });
    });
}

// 12. Compress file
async function compressFile(cwd, src, dest) {
    if (!src || !dest) throw new Error();
    const srcPath = resolvePath(cwd, src);
    const destPath = resolvePath(cwd, dest);
    const zlib = require('zlib');

    await fs.promises.mkdir(path.dirname(destPath), {
        recursive: true
    });
    const readStream = fs.createReadStream(srcPath);
    const writeStream = fs.createWriteStream(destPath);
    const brotli = zlib.createBrotliCompress();

    return new Promise((resolve, reject) => {
        readStream.pipe(brotli).pipe(writeStream).on('finish', resolve).on('error', reject);
    });
}

// 13. Decompress file
async function decompressFile(cwd, src, dest) {
    if (!src || !dest) throw new Error();
    const srcPath = resolvePath(cwd, src);
    const destPath = resolvePath(cwd, dest);
    const zlib = require('zlib');

    await fs.promises.mkdir(path.dirname(destPath), {
        recursive: true
    });
    const readStream = fs.createReadStream(srcPath);
    const writeStream = fs.createWriteStream(destPath);
    const brotli = zlib.createBrotliDecompress();

    return new Promise((resolve, reject) => {
        readStream.pipe(brotli).pipe(writeStream).on('finish', resolve).on('error', reject);
    });
}

module.exports = {
    goUp,
    changeDir,
    listDir,
    readFile,
    createFile,
    createFolder,
    rename,
    copyFile,
    moveFile,
    deleteFile,
    osInfo,
    hashFile,
    compressFile,
    decompressFile
};