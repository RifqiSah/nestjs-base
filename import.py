from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

import psycopg2
import json

mongo = MongoClient("mongodb://192.168.10.101:27017/")
mongo_db = mongo["sl"]
collection = mongo_db["keywords"]

pg = psycopg2.connect(host="192.168.10.101", port=5432, database="SLRevamp2", user="root", password="toor")
pg.autocommit = True
cursor = pg.cursor()

def json_serializer(obj):
  if isinstance(obj, datetime):
    return obj.isoformat()

  if isinstance(obj, ObjectId):
    return str(obj)

  return str(obj)

def j(v):
  return json.dumps(v, default=json_serializer) if v is not None else None

def norm(v):
  if isinstance(v, ObjectId):
    return str(v)

  return v

success = 0
failed = 0
query="""
INSERT INTO keywords (
  mongo_id,
  reward_catalog,
  eligibility,
  bonus,
  notification,
  keyword_approval,
  is_draft,
  need_review_after_edit,
  created_by,
  hq_approver,
  non_hq_approver,
  is_main_keyword,
  child_keyword,
  keyword_edit,
  is_stoped,
  remark,
  created_at,
  updated_at,
  deleted_at
)
VALUES (
  %s,
  %s::jsonb,
  %s::jsonb,
  %s::jsonb,
  %s::jsonb,
  %s,
  %s,
  %s,
  %s::jsonb,
  %s,
  %s,
  %s,
  %s::jsonb,
  %s,
  %s,
  %s,
  %s,
  %s,
  %s
)
"""
start_date = datetime(2025, 1, 1)
for doc in collection.find({
  "created_at": {
    "$gte": start_date
  }
}):
  try:
    values = (
      norm(doc["_id"]),
      j(doc.get("reward_catalog")),
      j(doc.get("eligibility")),
      j(doc.get("bonus")),
      j(doc.get("notification")),
      norm(doc.get("keyword_approval")),
      norm(doc.get("is_draft")),
      norm(doc.get("need_review_after_edit")),
      j(doc.get("created_by")),
      norm(doc.get("hq_approver")),
      norm(doc.get("non_hq_approver")),
      norm(doc.get("is_main_keyword")),
      j(doc.get("child_keyword")),
      norm(doc.get("keyword_edit")),
      norm(doc.get("is_stoped")),
      norm(doc.get("remark")),
      norm(doc.get("created_at")),
      norm(doc.get("updated_at")),
      norm(doc.get("deleted_at")),
    )

    cursor.execute(query, values)
    print(f"[V] Success insert {doc['_id']}")
    success += 1

  except Exception as e:
    print(f"[X] Error insert {doc['_id']} → {e}")
    failed += 1

    pg.rollback()
    continue

print("\n========== RESULT ==========")
print(f"SUCCESS INSERT : {success}")
print(f"FAILED INSERT  : {failed}")

cursor.close()
pg.close()
mongo.close()