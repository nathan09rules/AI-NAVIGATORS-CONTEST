import ollama

response = ollama.chat(model="smollm-diagnosis", messages=[{"role": "user", "content": ""}])

print(response['message']['content'])
