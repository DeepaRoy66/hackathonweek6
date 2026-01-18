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

# Database and AI Clients
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
        # 1. Extract Text from exactly the first TWO pages
        reader = PdfReader(io.BytesIO(await file.read()))
        
        # Slicing [:2] safely handles PDFs with only 1 page as well
        text_parts = [page.extract_text() for page in reader.pages[:2]]
        text = "\n".join(text_parts)[:2000] # Truncate for speed

        # 2. Use the "Instant" model for 1-3 second response times
        chat = ai_client.chat.completions.create(
            model="llama-3.1-8b-instant", 
            messages=[
                {"role": "system", "content": "Return JSON: { 'questions': [ { 'q': 'str', 'a': 'str' } ] }."},
                {"role": "user", "content": f"Extract {count} questions from: {text}"}
            ],
            response_format={"type": "json_object"}
        )
        data = json.loads(chat.choices[0].message.content)
        
        if "questions" not in data: data = {"questions": []}

        # 3. Data Persistence
        await collection.insert_one({
            "filename": file.filename, 
            "content": data['questions'],
            "count": count
        })
        return data

    except Exception as e:
        return {"questions": [], "error": "Processing error. Try a simpler PDF."}

@app.get("/api/history")
async def history():
    docs = await collection.find().sort("_id", -1).to_list(10)
    for d in docs: d["_id"] = str(d["_id"])
    return docs