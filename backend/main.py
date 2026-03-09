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


# ═══════════════════════════════════════════════════════════════════════════════
# ── BOUNTIES ──────────────────────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════════════════

import time as _time
import hashlib as _hashlib
import random as _random

bounties_db: List[dict] = [
    {
        "id": 1,
        "description": "Report and document unsafe road conditions in the downtown core",
        "category": "Infrastructure",
        "base_reward": 50.0,
        "urgency_coeff": 0.08,
        "created_at": _time.time() - 3600,   # 1 hour ago
        "status": "open",
        "claimed_by": None,
        "posted_by": "City Works Dept.",
    },
    {
        "id": 2,
        "description": "Audit and verify park maintenance logs for Q1 2026",
        "category": "Environment",
        "base_reward": 120.0,
        "urgency_coeff": 0.05,
        "created_at": _time.time() - 7200,   # 2 hours ago
        "status": "open",
        "claimed_by": None,
        "posted_by": "Parks & Recreation",
    },
    {
        "id": 3,
        "description": "Translate public-health notices into 3 community languages",
        "category": "Public Health",
        "base_reward": 200.0,
        "urgency_coeff": 0.03,
        "created_at": _time.time() - 86400,  # 1 day ago
        "status": "claimed",
        "claimed_by": "Carol Wang",
        "posted_by": "Health Services",
    },
    {
        "id": 4,
        "description": "Identify and map all broken street lights in Ward 5",
        "category": "Infrastructure",
        "base_reward": 75.0,
        "urgency_coeff": 0.10,
        "created_at": _time.time() - 1800,   # 30 minutes ago
        "status": "open",
        "claimed_by": None,
        "posted_by": "Utilities Dept.",
    },
]


class NewBounty(BaseModel):
    description: str
    category: str
    base_reward: float
    urgency_coeff: float = 0.05


@app.get("/api/bounties")
def get_bounties():
    result = []
    for b in bounties_db:
        elapsed = _time.time() - b["created_at"]
        current_reward = round(b["base_reward"] * (1 + b["urgency_coeff"] * (elapsed / 60)), 2)
        result.append({**b, "current_reward": current_reward})
    return result


@app.post("/api/bounties", status_code=201)
def create_bounty(data: NewBounty):
    new_id = max((b["id"] for b in bounties_db), default=0) + 1
    bounty = {
        "id":            new_id,
        "description":   data.description,
        "category":      data.category,
        "base_reward":   data.base_reward,
        "urgency_coeff": data.urgency_coeff,
        "created_at":    _time.time(),
        "status":        "open",
        "claimed_by":    None,
        "posted_by":     "Civic User",
    }
    bounties_db.append(bounty)
    elapsed = 0.0
    return {**bounty, "current_reward": bounty["base_reward"]}


@app.post("/api/bounties/{bounty_id}/claim")
def claim_bounty(bounty_id: int, claimer: str = "Civic User"):
    bounty = next((b for b in bounties_db if b["id"] == bounty_id), None)
    if not bounty:
        raise HTTPException(status_code=404, detail="Bounty not found")
    if bounty["status"] != "open":
        raise HTTPException(status_code=400, detail="Bounty is no longer open")
    bounty["status"]     = "claimed"
    bounty["claimed_by"] = claimer
    elapsed = _time.time() - bounty["created_at"]
    current_reward = round(bounty["base_reward"] * (1 + bounty["urgency_coeff"] * (elapsed / 60)), 2)
    return {**bounty, "current_reward": current_reward}


# ═══════════════════════════════════════════════════════════════════════════════
# ── ZK-AUDIT ──────────────────────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════════════════

audit_log_db: List[dict] = [
    {
        "id": 1,
        "timestamp": _time.time() - 3600,
        "proof_signature": "a3f1c2d4e5b6a7f8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
        "action": "cast_vote",
        "verified": True,
    },
    {
        "id": 2,
        "timestamp": _time.time() - 7200,
        "proof_signature": "b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5",
        "action": "sign_consent",
        "verified": True,
    },
    {
        "id": 3,
        "timestamp": _time.time() - 14400,
        "proof_signature": "c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
        "action": "submit_proposal",
        "verified": True,
    },
]


class ZKProofSubmit(BaseModel):
    action_type: str
    user_secret: str   # hashed client-side before sending


@app.get("/api/audit/log")
def get_audit_log():
    return sorted(audit_log_db, key=lambda e: e["timestamp"], reverse=True)


@app.post("/api/audit/submit")
def submit_zk_proof(data: ZKProofSubmit):
    """
    Simulates a ZK proof submission.
    The client hashes (username + local_secret + action) before sending;
    only the proof hash is stored – the server never learns WHO acted.
    """
    proof_hash = _hashlib.sha256(
        f"{data.user_secret}{data.action_type}{_time.time()}".encode()
    ).hexdigest()
    entry = {
        "id":              len(audit_log_db) + 1,
        "timestamp":       _time.time(),
        "proof_signature": proof_hash,
        "action":          data.action_type,
        "verified":        True,
    }
    audit_log_db.append(entry)
    return {"message": "Action verified and anonymized on public ledger", "proof_signature": proof_hash}


# ═══════════════════════════════════════════════════════════════════════════════
# ── JUSTICE ───────────────────────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════════════════

cases_db: List[dict] = [
    {
        "id":             1,
        "category":       "Contract",
        "plaintiff":      "Alice Johnson",
        "defendant":      "Bob Martinez",
        "evidence_hash":  _hashlib.sha256(b"contract_dispute_evidence_001").hexdigest(),
        "description":    "Disputed service agreement for community center renovation project.",
        "jurors":         ["Carol Wang", "Eva Patel", "Grace Lee"],
        "votes":          {"Carol Wang": "liable", "Eva Patel": "liable"},
        "status":         "deliberating",
        "filed_date":     "Mar 1, 2026",
    },
    {
        "id":             2,
        "category":       "Conduct",
        "plaintiff":      "Frank Nguyen",
        "defendant":      "David Kim",
        "evidence_hash":  _hashlib.sha256(b"conduct_violation_evidence_002").hexdigest(),
        "description":    "Allegation of misconduct during public council meeting on Feb 20.",
        "jurors":         ["Alice Johnson", "Bob Martinez", "Henry Brown"],
        "votes":          {},
        "status":         "open",
        "filed_date":     "Mar 5, 2026",
    },
]


class NewCase(BaseModel):
    plaintiff:   str
    defendant:   str
    category:    str
    description: str
    evidence:    str


class Verdict(BaseModel):
    juror_name: str
    verdict:    str   # "liable" | "not liable" | "dismissed"


@app.get("/api/justice/cases")
def get_cases():
    return cases_db


@app.post("/api/justice/cases", status_code=201)
def file_case(data: NewCase):
    all_names = [u["name"] for u in users_db
                 if u["name"] != data.plaintiff and u["name"] != data.defendant and u["active"]]
    jurors = _random.sample(all_names, min(3, len(all_names)))
    today  = datetime.now().strftime("%b %d, %Y").replace(" 0", " ")
    new_case = {
        "id":            max((c["id"] for c in cases_db), default=0) + 1,
        "category":      data.category,
        "plaintiff":     data.plaintiff,
        "defendant":     data.defendant,
        "description":   data.description,
        "evidence_hash": _hashlib.sha256(data.evidence.encode()).hexdigest(),
        "jurors":        jurors,
        "votes":         {},
        "status":        "open",
        "filed_date":    today,
    }
    cases_db.append(new_case)
    return new_case


@app.post("/api/justice/cases/{case_id}/verdict")
def cast_verdict(case_id: int, data: Verdict):
    case = next((c for c in cases_db if c["id"] == case_id), None)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if data.juror_name not in case["jurors"]:
        raise HTTPException(status_code=403, detail="Not a juror on this case")
    if case["status"] == "resolved":
        raise HTTPException(status_code=400, detail="Case already resolved")

    case["votes"][data.juror_name] = data.verdict
    case["status"] = "deliberating"

    if len(case["votes"]) == len(case["jurors"]):
        tally: dict = {}
        for v in case["votes"].values():
            tally[v] = tally.get(v, 0) + 1
        majority = max(tally, key=lambda k: tally[k])
        case["status"]  = "resolved"
        case["verdict"] = majority
    return case


# ═══════════════════════════════════════════════════════════════════════════════
# ── CONSENT FORMS ─────────────────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════════════════

consent_forms_db: List[dict] = [
    {
        "id":          1,
        "title":       "Data Sharing & Privacy Consent",
        "description": "I consent to the Civic OS platform collecting and using my anonymised participation data to improve civic services and publish aggregate community statistics.",
        "category":    "Privacy",
        "required":    True,
        "version":     "1.2",
        "signatories": 1047,
        "signed_by_me": False,
    },
    {
        "id":          2,
        "title":       "Digital Identity Issuance Consent",
        "description": "I consent to the issuance of a Sovereign Digital Identity credential linked to my civic profile. This credential will be used for authenticating participation in governance processes.",
        "category":    "Identity",
        "required":    True,
        "version":     "2.0",
        "signatories": 892,
        "signed_by_me": False,
    },
    {
        "id":          3,
        "title":       "Automated Decision Transparency Notice",
        "description": "I acknowledge that certain civic decisions may be assisted by algorithmic tools, and I consent to being notified when automated scoring or ranking influences outcomes that affect me.",
        "category":    "Governance",
        "required":    False,
        "version":     "1.0",
        "signatories": 654,
        "signed_by_me": False,
    },
    {
        "id":          4,
        "title":       "Community Alert Subscription",
        "description": "I consent to receive digital alerts for emergency notices, voting deadlines, proposal milestones, and community events relevant to my registered ward.",
        "category":    "Communications",
        "required":    False,
        "version":     "1.1",
        "signatories": 1284,
        "signed_by_me": False,
    },
]


@app.get("/api/consent/forms")
def get_consent_forms():
    return consent_forms_db


@app.post("/api/consent/forms/{form_id}/sign")
def sign_consent(form_id: int):
    form = next((f for f in consent_forms_db if f["id"] == form_id), None)
    if not form:
        raise HTTPException(status_code=404, detail="Consent form not found")
    if form["signed_by_me"]:
        raise HTTPException(status_code=400, detail="Already signed")
    form["signed_by_me"] = True
    form["signatories"] += 1
    return form


# ═══════════════════════════════════════════════════════════════════════════════
# ── SOVEREIGN IDENTITY ────────────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════════════════

identities_db: List[dict] = [
    {
        "id":           1,
        "did":          "did:civicos:0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
        "holder":       "Alice Johnson",
        "issued_date":  "Jan 15, 2025",
        "expiry_date":  "Jan 15, 2027",
        "status":       "active",
        "merit_score":  82,
        "credentials":  ["Verified Citizen", "Ward 3 Resident", "Active Voter"],
        "ward":         "Ward 3",
    },
    {
        "id":           2,
        "did":          "did:civicos:0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
        "holder":       "Bob Martinez",
        "issued_date":  "Feb 8, 2025",
        "expiry_date":  "Feb 8, 2027",
        "status":       "active",
        "merit_score":  68,
        "credentials":  ["Verified Citizen", "Ward 1 Resident"],
        "ward":         "Ward 1",
    },
    {
        "id":           3,
        "did":          "did:civicos:0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
        "holder":       "Carol Wang",
        "issued_date":  "Mar 20, 2025",
        "expiry_date":  "Mar 20, 2027",
        "status":       "active",
        "merit_score":  74,
        "credentials":  ["Verified Citizen", "Ward 2 Resident", "Bounty Hunter"],
        "ward":         "Ward 2",
    },
]


class NewIdentity(BaseModel):
    holder:     str
    ward:       str


@app.get("/api/identity/list")
def list_identities():
    return identities_db


@app.post("/api/identity/issue", status_code=201)
def issue_identity(data: NewIdentity):
    raw = f"{data.holder}{data.ward}{_time.time()}"
    did_suffix = _hashlib.sha256(raw.encode()).hexdigest()[:40]
    today = datetime.now().strftime("%b %d, %Y").replace(" 0", " ")
    expiry_year = datetime.now().year + 2
    expiry = datetime.now().replace(year=expiry_year).strftime("%b %d, %Y").replace(" 0", " ")
    new_id = {
        "id":           max((i["id"] for i in identities_db), default=0) + 1,
        "did":          f"did:civicos:0x{did_suffix}",
        "holder":       data.holder,
        "issued_date":  today,
        "expiry_date":  expiry,
        "status":       "active",
        "merit_score":  0,
        "credentials":  ["Verified Citizen", f"{data.ward} Resident"],
        "ward":         data.ward,
    }
    identities_db.append(new_id)
    return new_id
