const fs = require("fs");
const path = require("path");

function copyFile(source, destination) {
  fs.copyFileSync(source, destination);
}

function copyFolderSync(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  const items = fs.readdirSync(source, { withFileTypes: true });
  for (const item of items) {
    const sourcePath = path.join(source, item.name);
    const destPath = path.join(destination, item.name);
    if (item.isDirectory()) {
      copyFolderSync(sourcePath, destPath);
    } else {
      copyFile(sourcePath, destPath);
    }
  }
}

// Ensure build folder exists
const buildDir = path.join(__dirname, "build");
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

// Copy individual files
copyFile(path.join(__dirname, "public", "manifest.json"), path.join(buildDir, "manifest.json"));
copyFile(path.join(__dirname, "public", "logo192.png"), path.join(buildDir, "logo192.png"));
copyFile(path.join(__dirname, "public", "logo512.png"), path.join(buildDir, "logo512.png"));
copyFile(path.join(__dirname, "public", "background.js"), path.join(buildDir, "background.js"));
copyFile(path.join(__dirname, "public", "content.js"), path.join(buildDir, "content.js"));
copyFile(path.join(__dirname, "views", "index.ejs"), path.join(buildDir, "index.ejs"));

// Copy entire folders
// copyFolderSync(path.join(__dirname, "public"), path.join(buildDir, "public"));
// copyFolderSync(path.join(__dirname, "views"), path.join(buildDir, "views"));

console.log("Build folder created successfully!");
