def test_imports():
    print("Testing imports...")
    try:
        import torch
        print("✓ PyTorch:", torch.__version__)
        
        import torchvision
        print("✓ Torchvision:", torchvision.__version__)
        
        import numpy
        print("✓ NumPy:", numpy.__version__)
        
        import pandas
        print("✓ Pandas:", pandas.__version__)
        
        import flask
        print("✓ Flask:", flask.__version__)
        
        from flask_cors import CORS
        print("✓ Flask-CORS: Installed")
        
        import PIL
        print("✓ Pillow:", PIL.__version__)
        
        import clip
        print("✓ CLIP: Installed")
        
        import google.generativeai
        print("✓ Google Generative AI: Installed")
        
        from sentence_transformers import SentenceTransformer
        print("✓ Sentence-Transformers: Installed")
        
        print("\nAll required packages are installed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def test_cuda():
    print("\nTesting CUDA availability...")
    try:
        import torch
        if torch.cuda.is_available():
            print("✓ CUDA is available")
            print(f"✓ Using GPU: {torch.cuda.get_device_name(0)}")
        else:
            print("ℹ CUDA is not available, using CPU")
    except Exception as e:
        print(f"❌ Error checking CUDA: {str(e)}")

if __name__ == "__main__":
    print("=== SafeScroll Dependencies Test ===\n")
    if test_imports():
        test_cuda()
    print("\nTest completed!") 