const fs = require("fs");
const path = require("path");
const https = require("https");

const pdfJsVersion = "3.11.174"; // Use a specific version that's available
const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfJsVersion}/build/pdf.worker.min.js`;
const outputPath = path.join(__dirname, "../public/pdf.worker.min.js");

console.log(`Downloading PDF.js worker v${pdfJsVersion}...`);

https
  .get(workerUrl, (response) => {
    if (response.statusCode !== 200) {
      console.error(
        `Failed to download worker: ${response.statusCode} ${response.statusMessage}`
      );
      return;
    }

    const file = fs.createWriteStream(outputPath);
    response.pipe(file);

    file.on("finish", () => {
      file.close();
      console.log(`PDF.js worker downloaded to ${outputPath}`);
    });
  })
  .on("error", (err) => {
    console.error(`Error downloading worker: ${err.message}`);
  });
