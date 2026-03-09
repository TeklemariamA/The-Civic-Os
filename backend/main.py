"""
Civic OS – FastAPI Backend
Serves proposals, polls/voting, users, and dashboard data for the React frontend.
All data is held in-memory (suitable for a demo; swap for a DB in production).
"""

from datetime import datetime
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Civic OS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Seed data (mirrors the frontend's initial static data) ──────────────────

proposals_db: List[dict] = [
    {
        "id": 1,
        "title": "Green Energy Initiative",
        "category": "Environment",
        "status": "Active",
        "author": "Jane Cooper",
        "date": "Mar 5, 2026",
        "description": "Transition all municipal buildings to renewable energy sources by 2028.",
        "votes": {"yes": 142, "no": 38},
    },
    {
        "id": 2,
        "title": "Community Park Renovation",
        "category": "Infrastructure",
        "status": "Active",
        "author": "Tom Harris",
        "date": "Mar 3, 2026",
        "description": "Renovate Riverside Park with new playground equipment, walking paths, and lighting.",
        "votes": {"yes": 205, "no": 21},
    },
    {
        "id": 3,
        "title": "Public Library Expansion",
        "category": "Education",
        "status": "Passed",
        "author": "Linda Park",
        "date": "Feb 18, 2026",
        "description": "Expand the downtown library with a new wing dedicated to digital resources and youth programs.",
        "votes": {"yes": 310, "no": 62},
    },
    {
        "id": 4,
        "title": "Downtown Revitalization Plan",
        "category": "Urban Development",
        "status": "Under Review",
        "author": "Mark Spencer",
        "date": "Mar 1, 2026",
        "description": "Redevelop the downtown core to attract businesses and improve pedestrian accessibility.",
        "votes": {"yes": 88, "no": 44},
    },
    {
        "id": 5,
        "title": "Transportation Budget 2026",
        "category": "Transportation",
        "status": "Rejected",
        "author": "Rachel Nguyen",
        "date": "Feb 10, 2026",
        "description": "Allocate additional budget for road maintenance and public transit improvements.",
        "votes": {"yes": 95, "no": 130},
    },
    {
        "id": 6,
        "title": "School Safety Cameras",
        "category": "Education",
        "status": "Draft",
        "author": "Carlos Rivera",
        "date": "Mar 7, 2026",
        "description": "Install updated security camera systems across all public schools.",
        "votes": {"yes": 0, "no": 0},
    },
]

polls_db: List[dict] = [
    {
        "id": 1,
        "title": "Community Park Renovation",
        "description": "Should the city proceed with renovating Riverside Park with new amenities?",
        "closes": "March 12, 2026",
        "status": "Open",
        "participation": 62,
        "options": [
            {"label": "Yes, proceed immediately", "votes": 142},
            {"label": "Yes, but reduce the budget", "votes": 63},
            {"label": "No, defer to next year", "votes": 38},
            {"label": "No, cancel the project", "votes": 21},
        ],
    },
    {
        "id": 2,
        "title": "Downtown Revitalization Plan",
        "description": "Which approach should the city take for revitalizing the downtown area?",
        "closes": "March 15, 2026",
        "status": "Open",
        "participation": 38,
        "options": [
            {"label": "Focus on retail and commerce", "votes": 88},
            {"label": "Prioritize green spaces", "votes": 105},
            {"label": "Mixed-use development", "votes": 134},
            {"label": "Historic preservation only", "votes": 29},
        ],
    },
    {
        "id": 3,
        "title": "School Infrastructure Bond",
        "description": "Do you support issuing a $50 million bond for school infrastructure improvements?",
        "closes": "March 20, 2026",
        "status": "Open",
        "participation": 74,
        "options": [
            {"label": "Strongly support", "votes": 198},
            {"label": "Support with conditions", "votes": 87},
            {"label": "Oppose", "votes": 44},
            {"label": "Strongly oppose", "votes": 12},
        ],
    },
    {
        "id": 4,
        "title": "Transportation Budget 2026",
        "description": "Should the transportation budget be increased by 15% for 2026?",
        "closes": "Feb 28, 2026",
        "status": "Closed",
        "participation": 55,
        "options": [
            {"label": "Yes", "votes": 95},
            {"label": "No", "votes": 130},
        ],
    },
]

users_db: List[dict] = [
    {"id": 1, "name": "Alice Johnson",  "email": "alice@example.com",  "role": "Administrator", "joined": "Jan 10, 2025", "proposals": 8, "votes": 42, "active": True},
    {"id": 2, "name": "Bob Martinez",   "email": "bob@example.com",    "role": "Moderator",     "joined": "Feb 3, 2025",  "proposals": 5, "votes": 37, "active": True},
    {"id": 3, "name": "Carol Wang",     "email": "carol@example.com",  "role": "Member",        "joined": "Mar 15, 2025", "proposals": 3, "votes": 29, "active": True},
    {"id": 4, "name": "David Kim",      "email": "david@example.com",  "role": "Member",        "joined": "Apr 22, 2025", "proposals": 1, "votes": 14, "active": False},
    {"id": 5, "name": "Eva Patel",      "email": "eva@example.com",    "role": "Moderator",     "joined": "May 8, 2025",  "proposals": 6, "votes": 51, "active": True},
    {"id": 6, "name": "Frank Nguyen",   "email": "frank@example.com",  "role": "Observer",      "joined": "Jun 30, 2025", "proposals": 0, "votes": 8,  "active": True},
    {"id": 7, "name": "Grace Lee",      "email": "grace@example.com",  "role": "Member",        "joined": "Jul 17, 2025", "proposals": 2, "votes": 22, "active": True},
    {"id": 8, "name": "Henry Brown",    "email": "henry@example.com",  "role": "Member",        "joined": "Aug 5, 2025",  "proposals": 0, "votes": 5,  "active": False},
]

activity_log: List[dict] = [
    {"type": "proposal", "text": 'New proposal submitted: "Green Energy Initiative"', "time": "2 hours ago",  "icon": "📋"},
    {"type": "vote",     "text": 'Vote started: "Community Park Renovation"',          "time": "5 hours ago",  "icon": "🗳️"},
    {"type": "user",     "text": "New member joined: Sarah Mitchell",                   "time": "1 day ago",    "icon": "👤"},
    {"type": "passed",   "text": 'Proposal passed: "Public Library Expansion"',         "time": "2 days ago",   "icon": "✅"},
    {"type": "vote",     "text": 'Vote closed: "Transportation Budget 2025"',            "time": "3 days ago",   "icon": "🏁"},
]

# ── Pydantic request models ──────────────────────────────────────────────────

class NewProposal(BaseModel):
    title: str
    category: str
    description: str


class VoteCast(BaseModel):
    option_index: int


# ── Health check ─────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok"}


# ── Dashboard ─────────────────────────────────────────────────────────────────

@app.get("/api/dashboard")
def get_dashboard():
    active_proposals = sum(1 for p in proposals_db if p["status"] == "Active")
    open_votes       = sum(1 for p in polls_db      if p["status"] == "Open")
    registered_users = len(users_db)
    passed_measures  = sum(1 for p in proposals_db  if p["status"] == "Passed")

    open_polls = [p for p in polls_db if p["status"] == "Open"]
    upcoming_votes = [
        {
            "title":         p["title"],
            "closes":        p["closes"],
            "participation": p.get("participation", 0),
        }
        for p in open_polls[:3]
    ]

    return {
        "stats": {
            "active_proposals": active_proposals,
            "open_votes":       open_votes,
            "registered_users": f"{registered_users:,}",
            "passed_measures":  passed_measures,
        },
        "recent_activity": activity_log[:5],
        "upcoming_votes":  upcoming_votes,
    }


# ── Proposals ─────────────────────────────────────────────────────────────────

@app.get("/api/proposals")
def get_proposals():
    return proposals_db


@app.post("/api/proposals", status_code=201)
def create_proposal(data: NewProposal):
    new_id = max((p["id"] for p in proposals_db), default=0) + 1
    today  = datetime.now().strftime("%b %d, %Y").replace(" 0", " ")
    proposal = {
        "id":          new_id,
        "title":       data.title,
        "category":    data.category,
        "status":      "Draft",
        "author":      "Civic User",
        "date":        today,
        "description": data.description,
        "votes":       {"yes": 0, "no": 0},
    }
    proposals_db.insert(0, proposal)
    activity_log.insert(0, {
        "type": "proposal",
        "text": f'New proposal submitted: "{data.title}"',
        "time": "Just now",
        "icon": "📋",
    })
    return proposal


# ── Polls / Voting ────────────────────────────────────────────────────────────

@app.get("/api/polls")
def get_polls():
    return polls_db


@app.post("/api/polls/{poll_id}/vote")
def cast_vote(poll_id: int, data: VoteCast):
    poll = next((p for p in polls_db if p["id"] == poll_id), None)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    if poll["status"] == "Closed":
        raise HTTPException(status_code=400, detail="Poll is closed")
    if data.option_index < 0 or data.option_index >= len(poll["options"]):
        raise HTTPException(status_code=400, detail="Invalid option index")
    poll["options"][data.option_index]["votes"] += 1
    return poll


# ── Users ─────────────────────────────────────────────────────────────────────

@app.get("/api/users")
def get_users():
    return users_db


@app.post("/api/users/{user_id}/toggle")
def toggle_user(user_id: int):
    user = next((u for u in users_db if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["active"] = not user["active"]
    return user
