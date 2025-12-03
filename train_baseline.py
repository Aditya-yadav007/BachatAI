# train_baseline.py - TF-IDF + LogisticRegression baseline
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
from scipy.sparse import hstack
import joblib

# 1) load
df = pd.read_csv('train.csv')
# keep only rows with required fields
df = df.dropna(subset=['description','category'])
df['description'] = df['description'].astype(str)
df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0).astype(float)

# 2) features
tfidf = TfidfVectorizer(max_features=8000, ngram_range=(1,2))
X_text = tfidf.fit_transform(df['description'])
scaler = StandardScaler()
X_num = scaler.fit_transform(df[['amount']])
X = hstack([X_text, X_num])

# 3) split
y = df['category']
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.15, random_state=42, stratify=y)

# 4) train
clf = LogisticRegression(max_iter=400, class_weight='balanced')
clf.fit(X_train, y_train)

# 5) eval
pred = clf.predict(X_val)
print("=== Classification Report ===")
print(classification_report(y_val, pred))
# optional: confusion matrix
cm = confusion_matrix(y_val, pred, labels=clf.classes_)
print("Classes:", clf.classes_)
print("Confusion matrix shape:", cm.shape)

# 6) save artifacts
joblib.dump(tfidf, 'tfidf.pkl')
joblib.dump(scaler, 'scaler.pkl')
joblib.dump(clf, 'clf.pkl')
print("Saved artifacts: tfidf.pkl, scaler.pkl, clf.pkl")
