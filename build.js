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

// Create the icons folder inside the build directory
const iconsDir = path.join(buildDir, "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Copy individual files
copyFile(path.join(__dirname, "public", "manifest.json"), path.join(buildDir, "manifest.json"));
copyFile(path.join(__dirname, "public", "safescroll.png"), path.join(buildDir, "safescroll.png"));
copyFile(path.join(__dirname, "public", "background.js"), path.join(buildDir, "background.js"));
copyFile(path.join(__dirname, "public", "content.js"), path.join(buildDir, "content.js"));
copyFile(path.join(__dirname, "public", "popup.html"), path.join(buildDir, "popup.html"));
copyFile(path.join(__dirname, "public", "popup.css"), path.join(buildDir, "popup.css"));
copyFile(path.join(__dirname, "public", "popup.js"), path.join(buildDir, "popup.js"));

// Copy all icon files to the new icons folder
const iconSourceDir = path.join(__dirname, "public", "assets", "icons");
if (fs.existsSync(iconSourceDir)) {
  copyFolderSync(iconSourceDir, iconsDir);
} else {
  console.error("Icon source directory does not exist:", iconSourceDir);
}

console.log("Build folder created successfully with icons!");
