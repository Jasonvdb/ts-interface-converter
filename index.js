require('dotenv').config()

const {convert} = require('./src/ai');
const { unzipFile, readTsFilesRecursive, filterInputFiles } = require('./src/helpers');
const path = require('path');
const fs = require('fs');

const doit = async (inputDir, outputDir, outputLanguage) => {
    // const zipFile = 'blocktank-lsp-http-master.zip';
    // await unzipFile(zipFile, outputPath);

    const tsFiles = filterInputFiles(await readTsFilesRecursive(inputDir));

    console.log(`Found ${tsFiles.length} TypeScript files.`);

    for (const {relativePath, content} of tsFiles) {
        console.log(relativePath);

        const convertedCode = await convert(content, outputLanguage);

        //Write file to output directory
        const inputFilePath = path.join(outputDir, outputLanguage, relativePath.replace('.ts', '.swift'));

        let newFileName = path.basename(inputFilePath);
        //If the filename starts with capital I and the 2nd letter is uppercase, remove the I
        if (newFileName.startsWith('I') && newFileName[1] === newFileName[1].toUpperCase()) {
            newFileName = newFileName.slice(1);
        }
        // const outputFilePath = path.join(dir, newFileName);
        //Flat directory structure
        const outputFilePath = path.join(outputDir, outputLanguage, newFileName);

        const dir = path.dirname(outputFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }


        console.log(`Writing to ${outputFilePath}`);

        // if (!fs.existsSync(dir)) {
        //     fs.mkdirSync(dir, { recursive: true });
        // }

        fs.writeFileSync(outputFilePath, convertedCode, 'utf8');
    }

}

doit('input-ts', 'output', 'Swift')
    .catch(console.error);