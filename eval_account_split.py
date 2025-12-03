# eval_account_split.py
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from scipy.sparse import hstack

CSV = 'train.csv'  # ensure this is the correct path

df = pd.read_csv(CSV)
df = df.dropna(subset=['description','category','account_id']).reset_index(drop=True)
df['description'] = df['description'].astype(str)
df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0).astype(float)

print("Total rows after cleaning:", len(df))
print("Unique accounts:", df['account_id'].nunique())
print("Unique categories:", df['category'].nunique())

# pick ~15% of accounts as test set
unique_accounts = df['account_id'].unique().tolist()
n_test = max(1, int(0.15 * len(unique_accounts)))
test_accounts = set(unique_accounts[:n_test])

train_df = df[~df['account_id'].isin(test_accounts)].reset_index(drop=True)
test_df  = df[df['account_id'].isin(test_accounts)].reset_index(drop=True)

print(f"Train rows: {len(train_df)}, Test rows: {len(test_df)} (test accounts: {len(test_accounts)})")

# Build pipeline
tfidf = TfidfVectorizer(max_features=4000, ngram_range=(1,2))
X_text = tfidf.fit_transform(train_df['description'])
scaler = StandardScaler()
X_num = scaler.fit_transform(train_df[['amount']])
X_train = hstack([X_text, X_num])

clf = LogisticRegression(max_iter=400, class_weight='balanced')
clf.fit(X_train, train_df['category'])

# Evaluate on account-wise test set
X_text_t = tfidf.transform(test_df['description'])
X_num_t = scaler.transform(test_df[['amount']])
X_test = hstack([X_text_t, X_num_t])
pred = clf.predict(X_test)

print("\n=== ACCOUNT-SPLIT CLASSIFICATION REPORT ===")
print(classification_report(test_df['category'], pred))
