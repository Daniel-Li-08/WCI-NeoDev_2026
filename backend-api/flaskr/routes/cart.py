from flask import Blueprint
from flask import request, Response
import json
from lib.utils import *
from lib.db import db
from google.cloud import firestore

cartRoutes = Blueprint("cartRoutes", __name__)

@cartRoutes.route('/cart/create', methods=["POST"])         
def createCart():
    obj = request.get_json()
    if (type(obj) == str):
        obj = json.loads(obj)

    params = ['owner']

    if not paramsEqual(params,obj.keys()):
        return Response("Invalid params",status=400)
    
    collectRef = db.collection('Carts')

    docs = collectRef.stream()
    uids = [doc.id for doc in docs]



    if (obj["owner"] in uids): 
        return Response("User already has a cart",status=400)
    

    userRef = db.collection('Users').document(obj['owner'])
    if (userRef.get().to_dict() is None):
        return Response("User doesn't exist",status=400)

    collectRef.add(
        {
            "items":[]
        },
        obj["owner"]
    )

    x = userRef.get().to_dict()
    x["cart"] = obj['owner']
    userRef.set(x)

    return Response("Passed",status=200)



@cartRoutes.route('/cart/delete', methods=["POST"])
def deleteCart():
    obj = request.get_json()
    if (type(obj) == str):
        obj = json.loads(obj)
    params = ['owner','pw']

    if not paramsEqual(params,obj.keys()):
        return Response("Invalid params",status=400)
    
    userRef = db.collection('Carts').document(obj["owner"])
    if (userRef.get().to_dict() is None):
        return Response("Cart doesn't exist",status=400)
    
    if userRef.get().to_dict()["pw"] != obj["pw"]:
        return Response("Incorrect password",status=400)
    
    userRef.delete()

    return Response("Passed",status=200)

