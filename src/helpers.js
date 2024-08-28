const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');

const unzipFile = async (zipFilePath, outputPath) => {
    const outputDir = path.join(__dirname + '/..', outputPath);

    fs.createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: outputDir }))
        .on('close', () => console.log('Unzip completed.'));
};

const readTsFilesRecursive = async (dir) => {
    const readDir = async (currentDir) => {
      const files = await fs.promises.readdir(currentDir, { withFileTypes: true });
      const tsFileDetails = [];
  
      for (const file of files) {
        const fullPath = path.join(currentDir, file.name);
  
        if (file.isDirectory()) {
          const subDirContents = await readDir(fullPath);
          tsFileDetails.push(...subDirContents);
        } else if (path.extname(file.name) === '.ts') {
          const content = await fs.promises.readFile(fullPath, 'utf-8');
          const relativePath = path.relative(dir, fullPath);
          tsFileDetails.push({ relativePath, content });
        }
      }
  
      return tsFileDetails;
    };
  
    const directoryPath = path.join(__dirname, '..', dir);
  
    console.log(`Reading files from ${directoryPath}`);
  
    return readDir(directoryPath);
  };

const filterInputFiles = (fileArray) => {
    return fileArray
    .filter(file => !file.relativePath.includes('.spec'))
    .filter(file => !file.relativePath.includes('/service/'))
    .filter(file => !file.relativePath.includes('index.ts'))
    .filter(file => !file.relativePath.includes('Client.ts')) 
}

module.exports = { unzipFile, readTsFilesRecursive, filterInputFiles };