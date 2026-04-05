const sharp = require('sharp');
const path = require('path');

async function processImage() {
  try {
    const inputPath = path.join(__dirname, 'public', 'logo-removebg-preview.png');
    const outputPath = path.join(__dirname, 'src', 'app', 'icon.png');
    const metadata = await sharp(inputPath).metadata();
    
    const size = metadata.height; // Use height as square size assuming logo is left-aligned
    
    await sharp(inputPath)
      .extract({ left: 0, top: 0, width: size, height: size })
      .resize(256, 256)
      .toFile(outputPath);
      
    console.log('Successfully generated icon.png');
  } catch (error) {
    console.error('Failed to process image:', error);
  }
}

processImage();
