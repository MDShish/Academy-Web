from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from fastapi.responses import Response, StreamingResponse
import csv
from io import BytesIO, StringIO

# --- Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./career_guidance.db"
Base = declarative_base()

class StudentScore(Base):
    __tablename__ = "student_scores"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    school = Column(String)
    district = Column(String)
    mobile = Column(String)
    board = Column(String)
    scores = Column(JSON) # Category scores
    trait_dominance = Column(String)

from sqlalchemy import create_engine
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

# --- App Initialization ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class StudentRegistration(BaseModel):
    name: str
    school: str
    district: str
    mobile: str
    board: str

class AssessmentSubmission(BaseModel):
    student_info: StudentRegistration
    responses: dict # { "1": 5, "2": 3, ... }

class AdminLoginRequest(BaseModel):
    password: str

# --- Scoring Logic ---
CATEGORIES = {
    "Realistic": [1, 7, 13, 19, 25, 31, 37, 43, 49, 55],
    "Investigative": [2, 8, 14, 20, 26, 32, 38, 44, 50, 56],
    "Artistic": [3, 9, 15, 21, 27, 33, 39, 45, 51, 57],
    "Social": [4, 10, 16, 22, 28, 34, 40, 46, 52, 58],
    "Enterprising": [5, 11, 17, 23, 29, 35, 41, 47, 53, 59],
    "Conventional": [6, 12, 18, 24, 30, 36, 42, 48, 54, 60]
}

def calculate_scores(responses):
    final_scores = {cat: 0 for cat in CATEGORIES}
    
    for cat, q_ids in CATEGORIES.items():
        total = 0
        for q_id in q_ids:
            val = responses.get(str(q_id), 3) # Default neutral
            total += val
        final_scores[cat] = (total / 50) * 100 # Percentage
        
    return final_scores

# --- API Endpoints ---

@app.post("/api/submit")
async def submit_assessment(data: AssessmentSubmission):
    db = SessionLocal()
    try:
        raw_scores = calculate_scores(data.responses)
        
        # Apply Commerce Bias (1.5x for Enterprising and Conventional)
        weighted_scores = raw_scores.copy()
        for trait in ["Enterprising", "Conventional"]:
            weighted_scores[trait] *= 1.5
            
        dominant_trait = max(weighted_scores, key=weighted_scores.get)
        
        # Determine Suggested Stream
        if dominant_trait in ["Enterprising", "Conventional"]:
            suggested_stream = "Commerce"
        elif dominant_trait in ["Realistic", "Investigative"]:
            suggested_stream = "Science"
        else: # Artistic, Social
            suggested_stream = "Arts"
        
        db_student = StudentScore(
            name=data.student_info.name,
            school=data.student_info.school,
            district=data.student_info.district,
            mobile=data.student_info.mobile,
            board=data.student_info.board,
            scores=raw_scores, # Store raw scores in DB
            trait_dominance=dominant_trait
        )
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        
        return {
            "id": db_student.id,
            "scores": raw_scores,
            "dominant_trait": dominant_trait,
            "suggested_stream": suggested_stream
        }
    finally:
        db.close()

@app.get("/api/admin/students")
async def get_students():
    db = SessionLocal()
    students = db.query(StudentScore).all()
    db.close()
    return students

@app.post("/api/admin/login")
async def admin_login(data: AdminLoginRequest):
    if data.password == "adminAmira123@":
        return {"status": "success", "message": "Logged in successfully"}
    else:
        raise HTTPException(status_code=401, detail="Invalid password")

@app.get("/api/admin/export-csv")
async def export_csv():
    db = SessionLocal()
    students = db.query(StudentScore).all()
    db.close()
    
    if not students:
        raise HTTPException(status_code=404, detail="No data available to export")

    output = StringIO()
    writer = csv.writer(output)
    
    # Header
    header = ["ID", "Name", "School", "District", "Mobile", "Board", "Dominant Trait"]
    # Add category scores to header
    categories = list(students[0].scores.keys())
    header.extend(categories)
    writer.writerow(header)
    
    for student in students:
        row = [
            student.id, 
            student.name, 
            student.school, 
            student.district, 
            student.mobile, 
            student.board, 
            student.trait_dominance
        ]
        # Add category scores to row
        for cat in categories:
            row.append(f"{student.scores.get(cat, 0):.2f}")
        writer.writerow(row)
    
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sslc_career_guidance_data.csv"}
    )

@app.get("/api/report/{student_id}")
async def get_report(student_id: int):
    db = SessionLocal()
    student = db.query(StudentScore).filter(StudentScore.id == student_id).first()
    db.close()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # Simple Branded PDF
    p.setFont("Helvetica-Bold", 24)
    p.drawString(100, 750, "SOPHIA ACADEMY")
    p.setFont("Helvetica", 14)
    p.drawString(100, 730, "SSLC Career Guidance Report")
    
    p.line(100, 720, 500, 720)
    
    p.drawString(100, 680, f"Name: {student.name}")
    p.drawString(100, 660, f"School: {student.school}")
    p.drawString(100, 640, f"Dominant Trait: {student.trait_dominance}")
    
    p.drawString(100, 600, "Detailed Scores:")
    y = 580
    for cat, score in student.scores.items():
        p.drawString(120, y, f"{cat}: {score:.1f}%")
        y -= 20
        
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return Response(content=buffer.getvalue(), media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename=Sophia_Report_{student.name}.pdf"
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
