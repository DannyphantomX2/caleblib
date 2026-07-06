import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                              f1_score, roc_auc_score, confusion_matrix,
                              classification_report)
import warnings
warnings.filterwarnings('ignore')

# Load data
df = pd.read_csv('training_data.csv')

# Encode all columns
le = LabelEncoder()
df_enc = df.copy()
for col in df.columns:
    df_enc[col] = le.fit_transform(df[col].astype(str))

X = df_enc.drop('Adaptivity Level', axis=1)
y = df_enc['Adaptivity Level']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

models = {
    'Logistic Regression': LogisticRegression(
        max_iter=1000, class_weight='balanced', random_state=42),
    'Random Forest': RandomForestClassifier(
        n_estimators=100, class_weight='balanced', random_state=42),
    'Neural Network (MLP)': MLPClassifier(
        hidden_layer_sizes=(64, 32), max_iter=500, random_state=42)
}

print("="*70)
print(f"{'Model':<25} {'Accuracy':>9} {'Precision':>10} {'Recall':>8} {'F1':>8} {'AUC-ROC':>9} {'CV Mean':>9} {'CV Std':>8}")
print("="*70)

results = {}
for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    acc  = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    rec  = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1   = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    try:
        y_prob = model.predict_proba(X_test)
        auc = roc_auc_score(y_test, y_prob, multi_class='ovr', average='weighted')
    except:
        auc = float('nan')

    cv = cross_val_score(model, X, y, cv=5, scoring='accuracy')

    results[name] = {
        'Accuracy': round(acc*100, 1),
        'Precision': round(prec*100, 1),
        'Recall': round(rec*100, 1),
        'F1 Score': round(f1*100, 1),
        'AUC-ROC': round(auc*100, 1) if not np.isnan(auc) else 'N/A',
        'CV Mean': round(cv.mean()*100, 1),
        'CV Std': round(cv.std()*100, 1),
    }

    print(f"{name:<25} {acc*100:>8.1f}% {prec*100:>9.1f}% {rec*100:>7.1f}% {f1*100:>7.1f}% {(auc*100 if not np.isnan(auc) else 0):>8.1f}% {cv.mean()*100:>8.1f}% {cv.std()*100:>7.1f}%")

    print(f"\n--- {name} Classification Report ---")
    print(classification_report(y_test, y_pred,
          target_names=['High','Low','Moderate'], zero_division=0))
    print(f"Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}\n")

print("="*70)
print("\nWhat each metric measures:")
print("Accuracy  : overall % correct predictions")
print("Precision : of all predicted positives, how many were right")
print("Recall    : of all actual positives, how many were caught")
print("F1 Score  : harmonic mean of Precision and Recall (balance both)")
print("AUC-ROC   : ability to distinguish between classes (1.0 = perfect)")
print("CV Mean   : average accuracy across 5 cross-validation folds")
print("CV Std    : consistency — lower std means more stable model")
