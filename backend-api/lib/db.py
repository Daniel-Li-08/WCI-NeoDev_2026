from google.oauth2.credentials import Credentials
from google.cloud import firestore
import google.cloud.firestore
import json, os

KeyString:str = os.environ.get('FIREBASE_SERVICE_TOKEN') or '{}'
db = google.cloud.firestore.Client.from_service_account_info(json.loads(KeyString))