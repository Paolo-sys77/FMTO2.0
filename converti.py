import pandas as pd

df = pd.read_csv("svincolati.csv", encoding="utf-8")
df.to_parquet("svincolati.parquet", index=False, compression="snappy")

print(f"Righe: {len(df)}")
print(f"Colonne: {list(df.columns)}")
print("Fatto!")