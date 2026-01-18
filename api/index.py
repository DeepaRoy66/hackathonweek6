import os
import io
import json
from fastapi import FastAPI, UploadFile, File, Query
from motor.motor_asyncio import AsyncIOMotorClient
from groq import Groq
from pypdf import PdfReader
from dotenv import load_dotenv

# Load variables from .env for security
load_dotenv()

app = FastAPI()

# Database & AI Clients
client = AsyncIOMotorClient(os.environ.get("MONGODB_URI"))
db = client.week6_db
collection = db.questions
ai_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@app.post("/api/generate")
async def generate(
    file: UploadFile = File(...), 
    count: int = Query(default=3, ge=1, le=15)
):
    try:
        # 1. Extract PDF Text
        reader = PdfReader(io.BytesIO(await file.read()))
        text = " ".join([p.extract_text() for p in reader.pages[:3]])

        # 2. Call Groq with updated Llama 3.3 model
        chat = ai_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Return JSON: { 'questions': [ { 'q': 'str', 'a': 'str' } ] }"},
                {"role": "user", "content": f"Extract exactly {count} questions from: {text}"}
            ],
            response_format={"type": "json_object"}
        )
        data = json.loads(chat.choices[0].message.content)
        
        # Safety check: Ensure the key exists even if AI output is messy
        if "questions" not in data:
            data = {"questions": []}

    except Exception as e:
        print(f"Server Error: {e}")
        return {"questions": [], "error": str(e)}

    # 3. Save to MongoDB
    await collection.insert_one({
        "filename": file.filename, 
        "content": data['questions'],
        "count": count
    })
    
    return data

@app.get("/api/history")
async def history():
    docs = await collection.find().sort("_id", -1).to_list(10)
    for d in docs: d["_id"] = str(d["_id"])
    return docs