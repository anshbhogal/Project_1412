from datetime import datetime
from io import BytesIO
from typing import Optional, List

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..schemas.user import UserResponse
from ..services import financial_service
from ..models.models import Transaction

router = APIRouter()

@router.post("/generate")
def generate_report(
    period: str = Query("monthly", description="Report period: 'monthly' or 'yearly'"),
    user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # This endpoint currently just simulates generation and confirms the period.
    # In a real scenario, this might trigger a more complex async report generation job
    # and store the report metadata or file path in the database.
    return {"message": f"Report generation requested for {period} period for user {user.email}."}

@router.get("/{user_id}/download/pdf", response_class=StreamingResponse)
def download_pdf_report(
    user_id: int,
    period: str = Query("monthly", description="Report period: 'monthly' or 'yearly'"),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this user's reports")

    # For demonstration, we'll fetch a simplified financial summary.
    # In a real app, you'd fetch detailed data based on `period`.
    end_date = datetime.now()
    start_date = end_date.replace(day=1) if period == "monthly" else end_date.replace(month=1, day=1)
    
    summary = financial_service.get_financial_summary(
        db=db, user_id=user_id, start_date=start_date, end_date=end_date
    )

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph(f"Financial Report for {current_user.email}", styles['h1']))
    story.append(Paragraph(f"Period: {period.capitalize()} - {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}", styles['h2']))
    story.append(Spacer(1, 0.2 * inch)) # Spacer needs to be imported, will add later

    # Summary Data
    data = [
        ['Metric', 'Value (INR)'],
        ['Total Income', f"₹{summary['total_income']:.2f}"],
        ['Total Expenses', f"₹{summary['total_expenses']:.2f}"],
        ['Net Savings', f"₹{summary['net_savings']:.2f}"],
        ['Investment Value', f"₹{summary['investment_value']:.2f}"],
        ['Tax Liability', f"₹{summary['tax_liability']:.2f}"],
    ]
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(table)
    story.append(Spacer(1, 0.2 * inch))

    doc.build(buffer)
    buffer.seek(0)

    filename = f"tax_report_{period}_{end_date.strftime('%Y%m')}.pdf"
    headers = {"Content-Disposition": f"attachment; filename={filename}"}
    return StreamingResponse(buffer, headers=headers, media_type="application/pdf")

@router.get("/{user_id}/download/csv", response_class=StreamingResponse)
def download_csv_report(
    user_id: int,
    period: str = Query("monthly", description="Report period: 'monthly' or 'yearly'"),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this user's reports")

    end_date = datetime.now()
    start_date = end_date.replace(day=1) if period == "monthly" else end_date.replace(month=1, day=1)
    
    summary = financial_service.get_financial_summary(
        db=db, user_id=user_id, start_date=start_date, end_date=end_date
    )

    # Prepare data for CSV
    data = {
        'Metric': ['Total Income', 'Total Expenses', 'Net Savings', 'Investment Value', 'Tax Liability'],
        'Value': [summary['total_income'], summary['total_expenses'], summary['net_savings'], summary['investment_value'], summary['tax_liability']],
    }
    df = pd.DataFrame(data)

    buffer = BytesIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)

    filename = f"tax_report_{period}_{end_date.strftime('%Y%m')}.csv"
    headers = {"Content-Disposition": f"attachment; filename={filename}"}
    return StreamingResponse(buffer, headers=headers, media_type="text/csv")
