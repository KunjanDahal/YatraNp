const fs = require('fs');
const path = require('path');

// Create images directory if it doesn't exist
const createImagesDirectory = () => {
    const imagesPath = path.join(__dirname, '..', 'images');
    if (!fs.existsSync(imagesPath)) {
        fs.mkdirSync(imagesPath, { recursive: true });
        console.log('Images directory created successfully'.green);
    }
};

module.exports = {
    createImagesDirectory
}; 