const testFolder = './manifests/';
const downloadFolder = '/mnt/d/Videos/Telegram/scrolller';
const errorFile = './error.txt';
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sanitize = require("sanitize-filename");


const errorUrls = [];

const handleManifests = () => {
    fs.readdir(testFolder, (err, files) => {
        if (err) throw new Error(`Error with files: ${files}`);

        files.forEach(file => {
            console.log(file);

            handleFile(file);
        });
    });
}

// fileUrl: the absolute url of the image or video you want to download
// downloadFolder: the path of the downloaded file on your machine
const downloadFile = async (fileUrl, downloadFolder, fileNameBase) => {
    // Get the file name
    const fileNameOriginal = `${fileNameBase}-${path.basename(fileUrl)}`;
    const fileName = sanitize(fileNameOriginal);
    // const fileName = path.basename(fileUrl);

    // The path of the downloaded file on our machine
    const localFilePath = path.resolve(__dirname, downloadFolder, fileName);
    try {
        const response = await axios({
            method: 'GET',
            url: fileUrl,
            responseType: 'stream',
        });

        const w = response.data.pipe(fs.createWriteStream(localFilePath));
        w.on('finish', () => {
            console.log('Successfully downloaded file!');
        });
    } catch (err) {
        // throw new Error(err);
        console.log('err', err.message);
        console.log('>> Failed URL', fileUrl);
        errorUrls.push({ name: fileName, url: fileUrl });

        console.log('\n\n', errorUrls, '\n\n');

        fs.writeFile(errorFile, `{ name: ${fileName}, url: ${fileUrl} }`, { flag: 'a+' }, err => {
            if (err) { console.error(err); return; };
        })
    }
};

function handleFile(file) {
    const data = fs.readFileSync(`${testFolder}/${file}`, { encoding: 'utf8', flag: 'r' });

    // if (err) throw err;
    const obj = JSON.parse(data);
    console.log('obj', obj);

    obj.data.getFavorites.items.map(({ subredditTitle, title, mediaSources }) => {
        const url = mediaSources.at(-1).url;
        console.log(`mediaSources:`, url);

        downloadFile(url, downloadFolder, `${subredditTitle}-${title}`);
    })

}

handleManifests();

// handleFile('opera2.json')