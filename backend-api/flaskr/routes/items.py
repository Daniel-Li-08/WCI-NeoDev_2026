from flask import Blueprint
from flask import request, Response
import json
from lib.utils import *
from lib.db import db
from google.cloud import firestore

itemRoutes = Blueprint("itemRoutes", __name__)

@itemRoutes.route('/cart/additem', methods=["POST"])         
def addItem():
    obj = request.get_json()
    if (type(obj) == str):
        obj = json.loads(obj)

    params = ['link','quantity','cart']

    if not paramsEqual(params,obj.keys()):
        return Response("Invalid params",status=400)
    
    docRef = db.collection('Carts').document(obj['cart'])

    if (docRef.get().to_dict() is None):
        return Response("Cart doesn't exist",status=400)

    docRef.get().to_dict()['items'].append({"link":obj['link'], "quantity":obj['quantity']})
    
    return Response("Passed",status=200)
