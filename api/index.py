import os
import io
import json
from fastapi import FastAPI, UploadFile, File, Query
from motor.motor_asyncio import AsyncIOMotorClient
from groq import Groq
from pypdf import PdfReader
from dotenv import load_dotenv

# Load variables from .env for local testing
load_dotenv()

app = FastAPI()

# Database and AI Clients
# Ensure MONGODB_URI and GROQ_API_KEY are added to Vercel Environment Variables
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
        # 1. Performance Optimization: Read only first 1500 characters of the first page
        # This prevents the AI from timing out on large documents
        reader = PdfReader(io.BytesIO(await file.read()))
        text = reader.pages[0].extract_text()[:1500] 

        # 2. Call Groq using the fastest model (8b-instant)
        chat = ai_client.chat.completions.create(
            model="llama-3.1-8b-instant", 
            messages=[
                {"role": "system", "content": "Return JSON: { 'questions': [ { 'q': 'str', 'a': 'str' } ] }. Be very concise."},
                {"role": "user", "content": f"Extract exactly {count} study questions from: {text}"}
            ],
            response_format={"type": "json_object"}
        )
        data = json.loads(chat.choices[0].message.content)
        
        # Ensure 'questions' key exists in response
        if "questions" not in data:
            data = {"questions": []}

        # 3. Save to MongoDB Atlas for history
        await collection.insert_one({
            "filename": file.filename, 
            "content": data['questions'],
            "count": count
        })
        return data

    except Exception as e:
        # Return a safe error response to prevent frontend crashes
        return {"questions": [], "error": "Processing timeout. Try a smaller PDF."}

@app.get("/api/history")
async def history():
    # Retrieve the latest 10 generations for the sidebar
    docs = await collection.find().sort("_id", -1).to_list(10)
    for d in docs: d["_id"] = str(d["_id"])
    return docs