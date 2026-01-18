import os
import io
import json
from fastapi import FastAPI, UploadFile, File, Query
from motor.motor_asyncio import AsyncIOMotorClient
from groq import Groq
from pypdf import PdfReader
from dotenv import load_dotenv

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
    count: int = Query(default=3, ge=1, le=10)
):
    try:
        # 1. Extract Text (Limit to first 2 pages for maximum speed on Vercel)
        reader = PdfReader(io.BytesIO(await file.read()))
        text = " ".join([p.extract_text() for p in reader.pages[:2]])

        # 2. Call Groq - Switched to 8b-instant for < 3s response time
        chat = ai_client.chat.completions.create(
            model="llama-3.1-8b-instant", 
            messages=[
                {"role": "system", "content": "Return JSON: { 'questions': [ { 'q': 'str', 'a': 'str' } ] }"},
                {"role": "user", "content": f"Extract {count} study questions from: {text}"}
            ],
            response_format={"type": "json_object"}
        )
        data = json.loads(chat.choices[0].message.content)
        
        if "questions" not in data:
            data = {"questions": []}

        # 3. Save to MongoDB
        await collection.insert_one({
            "filename": file.filename, 
            "content": data['questions'],
            "count": count
        })
        return data

    except Exception as e:
        # If AI or DB fails, return a clean error so the frontend doesn't crash
        return {"questions": [], "error": str(e)}

@app.get("/api/history")
async def history():
    docs = await collection.find().sort("_id", -1).to_list(10)
    for d in docs: d["_id"] = str(d["_id"])
    return docs