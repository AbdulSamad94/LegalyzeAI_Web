import google.generativeai as genai
import os
import requests

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# Load diff
with open("diff.txt", "r") as f:
    diff = f.read()

prompt = f"""
You are an AI code reviewer. 
Review the following Git diff and provide:

1. Problems / bugs
2. Security issues
3. Cleanliness and best practices
4. Performance issues
5. Suggested improvements
6. Summary

Respond in markdown.

DIFF:
{diff}
"""

model = genai.GenerativeModel("gemini-2.5-pro")
response = model.generate_content(prompt)

review_text = response.text

# Post review comment on PR
pr_number = os.environ["PR_NUMBER"]
repo = os.environ["REPO"]
token = os.environ["GITHUB_TOKEN"]

url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
headers = {"Authorization": f"Bearer {token}"}

requests.post(url, headers=headers, json={"body": review_text})

print("Review posted successfully.")
