"""
CalebLib ML Microservice
Trains a Random Forest classifier on the Student Adaptability dataset
and exposes prediction + analytics endpoints.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import os, json

app = Flask(__name__)
CORS(app)

model = None
le_dict = {}
feature_names = []
model_meta = {}
DATASET_PATH = os.path.join(os.path.dirname(__file__), 'training_data.csv')

def train_model():
    global model, le_dict, feature_names, model_meta
    df = pd.read_csv(DATASET_PATH)
    le_dict = {}
    df_encoded = df.copy()
    for col in df.columns:
        le = LabelEncoder()
        df_encoded[col] = le.fit_transform(df[col])
        le_dict[col] = {cls: int(idx) for idx, cls in enumerate(le.classes_)}
    X = df_encoded.drop('Adaptivity Level', axis=1)
    y = df_encoded['Adaptivity Level']
    feature_names = list(X.columns)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    cv = cross_val_score(model, X, y, cv=5)
    cm = confusion_matrix(y_test, y_pred).tolist()
    report = classification_report(y_test, y_pred, target_names=['High','Low','Moderate'], output_dict=True)
    feat_imp = sorted(zip(feature_names, model.feature_importances_), key=lambda x: x[1], reverse=True)
    dist = df['Adaptivity Level'].value_counts().to_dict()
    model_meta = {
        'accuracy': round(float(acc), 4),
        'accuracy_pct': round(float(acc)*100, 1),
        'cv_mean': round(float(cv.mean()), 4),
        'cv_std': round(float(cv.std()), 4),
        'cv_mean_pct': round(float(cv.mean())*100, 1),
        'dataset_size': len(df),
        'class_distribution': {k: int(v) for k,v in dist.items()},
        'confusion_matrix': cm,
        'confusion_matrix_labels': ['High','Low','Moderate'],
        'classification_report': report,
        'feature_importances': [{'feature': f, 'importance': round(float(i), 4)} for f,i in feat_imp],
        'encodings': le_dict
    }
    print(f"Model trained — Accuracy: {acc*100:.1f}%, CV: {cv.mean()*100:.1f}%±{cv.std()*100:.1f}%")

def encode_input(data):
    encoded = {}
    for feat in feature_names:
        val = data.get(feat)
        if val is None:
            raise ValueError(f"Missing field: {feat}")
        mapping = le_dict.get(feat, {})
        if val not in mapping:
            raise ValueError(f"Unknown value '{val}' for field '{feat}'. Valid: {list(mapping.keys())}")
        encoded[feat] = mapping[val]
    return [encoded[f] for f in feature_names]

def generate_recommendations(data, prediction):
    recs = []
    if prediction == 'Low':
        if data.get('Internet Type') == 'Mobile Data':
            recs.append('Switching to WiFi connection could significantly improve online learning adaptability.')
        if data.get('Network Type') in ['2G','3G']:
            recs.append('Upgrading to a 4G network would reduce connectivity barriers to online learning.')
        if data.get('Financial Condition') == 'Poor':
            recs.append('Financial support programs or subsidised devices may improve engagement.')
        if data.get('Device') == 'Mobile':
            recs.append('Access to a computer or tablet typically improves learning outcomes.')
        if data.get('Class Duration') == '0':
            recs.append('Consistent class attendance is critical — zero class duration strongly predicts low adaptability.')
        if not recs:
            recs.append('Multiple compounding factors are reducing adaptability. A holistic support approach is recommended.')
    elif prediction == 'Moderate':
        if data.get('Self Lms') == 'No':
            recs.append('Encouraging self-directed LMS use could push adaptability from Moderate to High.')
        if data.get('Class Duration') == '1-3':
            recs.append('Increasing class duration to 3-6 hours is associated with higher adaptability.')
        if data.get('Network Type') == '3G':
            recs.append('Upgrading to 4G would likely improve online learning experience.')
    else:
        recs.append('Student shows high adaptability. Peer mentoring role recommended to support lower-adaptability peers.')
    return recs

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_ready': model is not None})

@app.route('/model/info', methods=['GET'])
def model_info():
    if model is None:
        return jsonify({'error': 'Model not trained'}), 503
    return jsonify({
        'success': True,
        'accuracy': model_meta['accuracy_pct'],
        'cv_accuracy': model_meta['cv_mean_pct'],
        'cv_std': round(model_meta['cv_std']*100, 1),
        'dataset_size': model_meta['dataset_size'],
        'class_distribution': model_meta['class_distribution'],
        'feature_importances': model_meta['feature_importances'],
        'confusion_matrix': model_meta['confusion_matrix'],
        'confusion_matrix_labels': model_meta['confusion_matrix_labels'],
        'classification_report': model_meta['classification_report'],
        'algorithm': 'Random Forest (100 estimators)',
        'train_test_split': '80/20',
        'cross_validation': '5-Fold'
    })

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not trained'}), 503
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input provided'}), 400
    try:
        encoded = encode_input(data)
        prediction_idx = int(model.predict([encoded])[0])
        probabilities = model.predict_proba([encoded])[0]
        level_map = {v: k for k,v in le_dict['Adaptivity Level'].items()}
        predicted_label = level_map[prediction_idx]
        proba_breakdown = {}
        for label, idx in le_dict['Adaptivity Level'].items():
            proba_breakdown[label] = round(float(probabilities[idx])*100, 1)
        recommendations = generate_recommendations(data, predicted_label)
        return jsonify({
            'success': True,
            'prediction': predicted_label,
            'confidence': round(float(max(probabilities))*100, 1),
            'probabilities': proba_breakdown,
            'recommendations': recommendations,
            'input': data
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/analytics/insights', methods=['GET'])
def insights():
    if model is None:
        return jsonify({'error': 'Model not trained'}), 503
    df = pd.read_csv(DATASET_PATH)
    def group(col):
        g = df.groupby([col, 'Adaptivity Level']).size().unstack(fill_value=0)
        return {row: data.to_dict() for row, data in g.iterrows()}
    return jsonify({
        'success': True,
        'by_financial_condition': group('Financial Condition'),
        'by_internet_type': group('Internet Type'),
        'by_device': group('Device'),
        'by_network_type': group('Network Type'),
        'total_samples': len(df),
        'feature_options': {feat: list(mapping.keys()) for feat, mapping in le_dict.items() if feat != 'Adaptivity Level'}
    })

# Train on startup regardless of how the app is launched
print("Training model...")
train_model()
print("ML service ready")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
