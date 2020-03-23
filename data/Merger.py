import pandas as pd

a = pd.read_csv("PreMergeData.csv")
b = pd.read_csv("mergingData.csv")
c = a.merge(b, on='CENSUS')
c.to_csv("MergedDataset.csv", index=False)
