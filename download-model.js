const fs = require('fs');
const path = require('path');
const https = require('https');

const modelId = 'Xenova/all-MiniLM-L6-v2';
const files = [
  'config.json',
  'tokenizer.json',
  'tokenizer_config.json',
  'vocab.txt',
  'special_tokens_map.json',
  'onnx/model_quantized.onnx' // Web uses quantized models by default
];

const baseUrl = `https://huggingface.co/${modelId}/resolve/main/`;
const targetDir = path.join(__dirname, 'public', 'models', modelId);

// Ensure directories exist
['', 'onnx'].forEach(subDir => {
  const dir = path.join(targetDir, subDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle redirect
        const redirectUrl = new URL(response.headers.location, url).href;
        downloadFile(redirectUrl, dest).then(resolve).catch(reject);
      } else if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log(`Downloading model ${modelId} to ${targetDir}...`);
  for (const file of files) {
    const url = baseUrl + file;
    const dest = path.join(targetDir, file);
    console.log(`Downloading ${file}...`);
    try {
      await downloadFile(url, dest);
      console.log(`Saved ${file}`);
    } catch (err) {
      console.error(`Error downloading ${file}:`, err.message);
    }
  }
  console.log('All downloads completed.');
}

main();
