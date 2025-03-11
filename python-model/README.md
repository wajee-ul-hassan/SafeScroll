# SafeScroll Image Classification API

This is the Python backend for SafeScroll's image classification functionality. It uses Flask to serve a REST API that processes images and determines if they are inappropriate.

## Setup Instructions

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Ensure your model file (`model.pth`) is in the python-model directory.

## Running the Server

1. Start the Flask server:
```bash
python app.py
```

The server will run on `http://localhost:5000`.

## API Endpoints

### POST /predict
Predicts whether an image is inappropriate.

Request body:
```json
{
    "image_url": "https://example.com/image.jpg"
}
```

Response:
```json
{
    "prediction": 0,
    "probabilities": [0.9, 0.1],
    "is_inappropriate": false,
    "confidence": 0.9
}
```

## Integration with Chrome Extension

The Flask server needs to be running for the Chrome extension's image filtering functionality to work. The content script (`content.js`) communicates with this server to process images on web pages. 