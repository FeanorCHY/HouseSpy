import nltk
from nltk.tokenize import *
from nltk.stem import WordNetLemmatizer
from nltk.stem import SnowballStemmer
from collections import Counter
from sklearn.cluster import AgglomerativeClustering

wnl = WordNetLemmatizer()

ss = SnowballStemmer("english")



import json

with open(".//t.json") as file:
    data = json.load(file)



pet_words = ["park"]
k = 10


all_pet_sents = []
for d in data:
    pet_sents_for_doc = []
    for s in sent_tokenize(d["description"]):
        words =[ w.lower() for w in regexp_tokenize(s,r"[\w$]+",discard_empty=True)]
        for pet_word in pet_words:
            if pet_word in words:
                pet_sents_for_doc.append(words)
                break
    all_pet_sents.append(pet_sents_for_doc)


words = [word for sents in all_pet_sents for sent in sents for word in sent]
stat = Counter(words)
stat.most_common()[:k]





data[0]["amenity"].keys()

list({key  for d in data for key in d["amenity"].keys()})