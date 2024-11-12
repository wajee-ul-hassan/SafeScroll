# SafeScroll

**SafeScroll** is a browser extension designed to detect and blur hateful memes on webpages. The extension analyzes images on a page, sends them to a machine learning model to flag potential hateful content, and prevents flagged memes from loading, replacing them with a blur effect.

## Features

- **Hateful Meme Detection**: Automatically scans images on webpages, detecting potentially hateful memes.
- **Blur Blocking**: Blurs flagged images to prevent exposure to unwanted content.
- **Subscription & Dashboard**: Paid users have access to a dashboard that displays blocked memes within a specific timeframe.
- **Sign In/Sign Up Support**: Users can create accounts, sign in, and subscribe for enhanced functionality.
- **Seamless DOM Integration**: Integrates directly with the DOM to intercept and analyze image content on each page.

## Technology Stack

- **Backend**: Node.js with EJS for rendering views
- **Frontend**: HTML, CSS, and JavaScript
- **Machine Learning Model**: Deployed on the backend to classify images as hateful or safe
- **Browser Extension API**: Manifest v3 for Chrome extensions

## Installation and Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/safescroll-extension.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```

4. **Load the extension** in Chrome:
   - Open Chrome and go to `chrome://extensions/`.
   - Enable "Developer mode" (toggle in the upper right).
   - Click "Load unpacked" and select the `build` folder.

5. **Run the server**:
   ```bash
   npm start
   ```

## Usage

After installation, SafeScroll will automatically scan webpages for potentially hateful memes. If an image is flagged, it will be blurred. Users can sign in or sign up, subscribe, and access a dashboard of blocked memes (available to paid subscribers).

