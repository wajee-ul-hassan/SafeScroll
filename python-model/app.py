from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import predict, load_model
from fe import process_image, cleanup_image
import torch
import os

app = Flask(__name__)
CORS(app)

# Force CPU usage
device = "cpu"
torch.cuda.is_available = lambda : False

try:
    # Load model using the new load_model function
    model = load_model("model.pth")
    model.eval()
    print("✓ Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    model = None

@app.route('/predict', methods=['POST'])
def predict_image():
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded properly'}), 500
            
        data = request.get_json()
        image_url = data.get('image_url')
        
        if not image_url:
            return jsonify({'error': 'No image URL provided'}), 400

        # Process image and get features
        text_features, image_features = process_image(image_url)
        
        if text_features is None or image_features is None:
            return jsonify({'error': 'Failed to process image'}), 400

        # Make prediction
        pred_class, pred_probs = predict(model, image_features, text_features, mode="both")
        
        return jsonify({
            'prediction': int(pred_class),
            'probabilities': pred_probs.tolist(),
            'is_inappropriate': bool(pred_class == 1),
            'confidence': float(pred_probs[pred_class])
        })

    except Exception as e:
        # Clean up any remaining files in the downloads directory
        if os.path.exists('downloads'):
            for file in os.listdir('downloads'):
                cleanup_image(os.path.join('downloads', file))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 