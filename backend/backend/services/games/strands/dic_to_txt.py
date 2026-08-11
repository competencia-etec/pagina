import re

with open("./es_AR.dic", "r", encoding="iso-8859-1") as f:
    lines = f.read().split("\n")

lines = lines[1:-1] # Exclude the first and last lines

def remove_definition(word):
    try:
        if "/" in word:
            match = re.search(r"(\w+)/.+", word)
            return match.group(1)
        else:
            return word
    except Exception as e:
        print(f"Error on {word}")
        raise e

lines = [remove_definition(l) for l in lines]
with open("./es_AR.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))