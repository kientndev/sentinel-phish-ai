from typing import List, Dict, Any, Optional
from sqlalchemy import func, desc
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import logging

# Configure basic logging
logger = logging.getLogger(__name__)

# ==============================================================================
# SCHEMA DEFINITIONS (Assumed SQLAlchemy Models for Reference & Type Safety)
# ==============================================================================
# Note: In a production environment, these imports would typically come from
# a centralized models directory (e.g., from src.models import Campaign, Employee, etc.)
# Below are matching mock/declarative models to represent the database structure:
"""
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

Base = declarative_base()

class Employee(Base):
    __tablename__ = 'employee'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), nullable=False)
    tenant_id = Column(String(50), nullable=False)

class Campaign(Base):
    __tablename__ = 'campaign'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False)
    tenant_id = Column(String(50), nullable=False)

class EmailSent(Base):
    __tablename__ = 'email_sent'
    id = Column(Integer, primary_key=True)
    campaign_id = Column(Integer, ForeignKey('campaign.id'), nullable=False)
    employee_id = Column(Integer, ForeignKey('employee.id'), nullable=False)
    sent_at = Column(DateTime, default=func.now())

class ClickEvent(Base):
    __tablename__ = 'click_event'
    id = Column(Integer, primary_key=True)
    sent_email_id = Column(Integer, ForeignKey('email_sent.id'), nullable=False)
    clicked_at = Column(DateTime, default=func.now())
    ip_address = Column(String(45))
    user_agent = Column(String(255))
"""

# Import the actual models. (Fall back to assumed names if they exist, or import directly)
# For absolute correctness, we will dynamically use string-based or class-based model targets.
# To keep this service ultra-portable and robust, we dynamically resolve models
# from a database registry or assume they match class structures standard in Flask/SQLAlchemy:
try:
    from src.models import Campaign, EmailSent, ClickEvent, Employee
except ImportError:
    # If the models aren't present yet, define placeholders for the ORM compilation
    # to avoid syntax/import errors, while keeping the service fully operational.
    from sqlalchemy.ext.declarative import declarative_base
    from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
    
    Base = declarative_base()
    
    class Employee(Base):
        __tablename__ = 'employee'
        id = Column(Integer, primary_key=True)
        name = Column(String(100), nullable=False)
        email = Column(String(120), nullable=False)
        tenant_id = Column(String(50), nullable=False)
        
    class Campaign(Base):
        __tablename__ = 'campaign'
        id = Column(Integer, primary_key=True)
        name = Column(String(100), nullable=False)
        status = Column(String(50), nullable=False)
        tenant_id = Column(String(50), nullable=False)

    class EmailSent(Base):
        __tablename__ = 'email_sent'
        id = Column(Integer, primary_key=True)
        campaign_id = Column(Integer, ForeignKey('campaign.id'), nullable=False)
        employee_id = Column(Integer, ForeignKey('employee.id'), nullable=False)
        sent_at = Column(DateTime)

    class ClickEvent(Base):
        __tablename__ = 'click_event'
        id = Column(Integer, primary_key=True)
        sent_email_id = Column(Integer, ForeignKey('email_sent.id'), nullable=False)
        clicked_at = Column(DateTime)
        ip_address = Column(String(45))
        user_agent = Column(String(255))


# ==============================================================================
# CORE METRICS SERVICE ENGINE
# ==============================================================================

def get_global_metrics(db_session: Session, tenant_id: str) -> Dict[str, Any]:
    """
    Calculates high-level aggregated metrics across all campaigns for a specific
    enterprise tenant, including total campaigns, emails sent, unique clicks, and 
    the overall Phish Prone Ratio.
    
    Formula:
        Phish Prone Ratio = (Total Clicks on Phishing Link / Total Phishing Emails Sent) * 100
        
    Args:
        db_session (Session): Active SQLAlchemy database session.
        tenant_id (str): The enterprise tenant identifier.
        
    Returns:
        Dict[str, Any]: {
            "total_campaigns": int,
            "total_emails_sent": int,
            "total_unique_clicks": int,
            "overall_phish_prone_percentage": float
        }
    """
    try:
        # 1. Calculate Total Campaigns Run for the Tenant
        total_campaigns = db_session.query(func.count(Campaign.id))\
            .filter(Campaign.tenant_id == tenant_id)\
            .scalar() or 0

        # 2. Calculate Total Emails Sent under the Tenant's Campaigns
        total_emails_sent = db_session.query(func.count(EmailSent.id))\
            .join(Campaign, EmailSent.campaign_id == Campaign.id)\
            .filter(Campaign.tenant_id == tenant_id)\
            .scalar() or 0

        # 3. Calculate Total Unique Clicks (one unique click event per sent email ID)
        # Note: A click is unique per individual email interaction (sent_email_id)
        total_unique_clicks = db_session.query(func.count(func.distinct(ClickEvent.sent_email_id)))\
            .join(EmailSent, ClickEvent.sent_email_id == EmailSent.id)\
            .join(Campaign, EmailSent.campaign_id == Campaign.id)\
            .filter(Campaign.tenant_id == tenant_id)\
            .scalar() or 0

        # 4. Handle edge cases & calculate the Phish Prone Ratio percentage
        if total_emails_sent > 0:
            phish_prone_percentage = round((total_unique_clicks / total_emails_sent) * 100.0, 2)
        else:
            phish_prone_percentage = 0.00

        return {
            "total_campaigns": total_campaigns,
            "total_emails_sent": total_emails_sent,
            "total_unique_clicks": total_unique_clicks,
            "overall_phish_prone_percentage": phish_prone_percentage
        }

    except SQLAlchemyError as e:
        logger.error(f"Database error while fetching global metrics for tenant {tenant_id}: {str(e)}")
        raise RuntimeError("Failed to compute global metrics due to a database exception.") from e


def get_campaign_leaderboard(db_session: Session, tenant_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Returns the top N most vulnerable employees for an enterprise tenant,
    ranked by their total clicked phishing link count in descending order.
    
    Args:
        db_session (Session): Active SQLAlchemy database session.
        tenant_id (str): The enterprise tenant identifier.
        limit (int): Maximum number of top records to return. Defaults to 5.
        
    Returns:
        List[Dict[str, Any]]: List of records, structured as:
            [
                {
                    "employee_id": int,
                    "employee_name": str,
                    "employee_email": str,
                    "click_count": int
                },
                ...
            ]
    """
    try:
        # Query ranks employees based on click events counted via their sent emails
        leaderboard_query = db_session.query(
            Employee.id.label("employee_id"),
            Employee.name.label("employee_name"),
            Employee.email.label("employee_email"),
            func.count(ClickEvent.id).label("click_count")
        )\
        .join(EmailSent, EmailSent.employee_id == Employee.id)\
        .join(ClickEvent, ClickEvent.sent_email_id == EmailSent.id)\
        .filter(Employee.tenant_id == tenant_id)\
        .group_by(Employee.id, Employee.name, Employee.email)\
        .order_by(desc("click_count"))\
        .limit(limit)\
        .all()

        return [
            {
                "employee_id": row.employee_id,
                "employee_name": row.employee_name,
                "employee_email": row.employee_email,
                "click_count": row.click_count
            }
            for row in leaderboard_query
        ]

    except SQLAlchemyError as e:
        logger.error(f"Database error while calculating leaderboard for tenant {tenant_id}: {str(e)}")
        raise RuntimeError("Failed to compute campaign leaderboard due to a database exception.") from e


def get_metrics_by_campaign(db_session: Session, campaign_id: int) -> Dict[str, Any]:
    """
    Computes real-time execution statistics and Phish Prone breakdown for a specific campaign.
    
    Args:
        db_session (Session): Active SQLAlchemy database session.
        campaign_id (int): ID of the campaign to query.
        
    Returns:
        Dict[str, Any]: Returns a detailed metrics dictionary:
            {
                "campaign_id": int,
                "campaign_name": str,
                "campaign_status": str,
                "emails_sent_count": int,
                "unique_clicks_count": int,
                "phish_prone_percentage": float
            }
    """
    try:
        # Fetch target campaign information
        campaign = db_session.query(Campaign).filter(Campaign.id == campaign_id).one_or_none()
        if not campaign:
            return {
                "campaign_id": campaign_id,
                "error": "Campaign not found",
                "emails_sent_count": 0,
                "unique_clicks_count": 0,
                "phish_prone_percentage": 0.00
            }

        # Calculate metrics specific to this campaign
        emails_sent_count = db_session.query(func.count(EmailSent.id))\
            .filter(EmailSent.campaign_id == campaign_id)\
            .scalar() or 0

        unique_clicks_count = db_session.query(func.count(func.distinct(ClickEvent.sent_email_id)))\
            .join(EmailSent, ClickEvent.sent_email_id == EmailSent.id)\
            .filter(EmailSent.campaign_id == campaign_id)\
            .scalar() or 0

        # Calculate specific Phish Prone Ratio for this campaign
        if emails_sent_count > 0:
            phish_prone_percentage = round((unique_clicks_count / emails_sent_count) * 100.0, 2)
        else:
            phish_prone_percentage = 0.00

        return {
            "campaign_id": campaign.id,
            "campaign_name": campaign.name,
            "campaign_status": campaign.status,
            "emails_sent_count": emails_sent_count,
            "unique_clicks_count": unique_clicks_count,
            "phish_prone_percentage": phish_prone_percentage
        }

    except SQLAlchemyError as e:
        logger.error(f"Database error while querying campaign {campaign_id} metrics: {str(e)}")
        raise RuntimeError(f"Failed to fetch campaign {campaign_id} metrics due to database error.") from e
