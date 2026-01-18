import os
import io
import json
from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from groq import Groq
from pypdf import PdfReader
from dotenv import load_dotenv
from bson import ObjectId

# Load environment variables
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
        # 1. Extract Text from exactly the first TWO pages (Operation Optimization)
        reader = PdfReader(io.BytesIO(await file.read()))
        text_parts = [page.extract_text() for page in reader.pages[:2]]
        text = "\n".join(text_parts)[:2000] 

        # 2. Call Groq with Instant model (Latency Optimization)
        chat = ai_client.chat.completions.create(
            model="llama-3.1-8b-instant", 
            messages=[
                {"role": "system", "content": "Return JSON: { 'questions': [ { 'q': 'str', 'a': 'str' } ] }."},
                {"role": "user", "content": f"Extract {count} questions from: {text}"}
            ],
            response_format={"type": "json_object"}
        )
        data = json.loads(chat.choices[0].message.content)
        
        # 3. Save to MongoDB
        await collection.insert_one({
            "filename": file.filename, 
            "content": data.get('questions', []),
            "count": count
        })
        return data

    except Exception as e:
        return {"questions": [], "error": str(e)}

@app.get("/api/history")
async def history():
    docs = await collection.find().sort("_id", -1).to_list(10)
    for d in docs: d["_id"] = str(d["_id"])
    return docs

@app.delete("/api/history/{id}")
async def delete_history(id: str):
    try:
        result = await collection.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 1:
            return {"message": "Deleted"}
        raise HTTPException(status_code=404, detail="Not found")
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")