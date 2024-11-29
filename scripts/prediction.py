import pickle
import numpy as np

MODEL_PATH = "./model/enhanced_route_model.pkl"

def load_model():
    """Load the trained Gradient Boosting model."""
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    return model

def predict_suitability(features):
    """Make predictions for road suitability."""
    model = load_model()
    features = np.array(features).reshape(1, -1)
    prediction = model.predict(features)
    return prediction[0]