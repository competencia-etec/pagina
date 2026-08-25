from FlagEmbedding import FlagModel
import pickle

model = FlagModel('BAAI/bge-m3',
                  query_instruction_for_retrieval="Generate a representation for this word for retrieving related words:",
                  use_fp16=True)

with open("common_spanish_words.txt") as f:
    all_words = f.readlines()

print(f"Processing {len(all_words)} words")

words = []
for word in all_words:
    word_filtered = word.strip()
    if len(word_filtered) > 3:
        words.append(word_filtered)

embeddings = model.encode(words)

with open("embeddings.pkl", "wb+") as f:
    pickle.dump(embeddings, f)

