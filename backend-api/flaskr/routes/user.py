from flask import Blueprint
from flask import request, Response
import json
from lib.utils import *
from lib.db import db
from google.cloud import firestore

userRoutes = Blueprint("userRoutes", __name__)

@userRoutes.route('/user/create', methods=["POST"])         
def createUser():
    obj = request.get_json()
    if (type(obj) == str):
        obj = json.loads(obj)

    params = ['name','pw','prime']

    if not paramsEqual(params,obj.keys()):
        return Response("Invalid params",status=400)
    
    collectRef = db.collection('Users')
    if (obj["name"] == ""):
        return Response("Name illegal",status=400)

    docs = collectRef.stream()
    uids = [doc.id for doc in docs]

    if (obj["name"] in uids): 
        return Response("Name taken",status=400)

    collectRef.add(
        {
            "pw":obj["pw"],
            "prime":obj["prime"],
            "cart":""
        },
        obj["name"]
    )

    return Response("Passed",status=200)



@userRoutes.route('/user/delete', methods=["POST"])
def deleteUser():
    obj = request.get_json()
    if (type(obj) == str):
        obj = json.loads(obj)
    params = ['name','pw']

    if not paramsEqual(params,obj.keys()):
        return Response("Invalid params",status=400)
    
    userRef = db.collection('Users').document(obj["name"])
    if (userRef.get().to_dict() is None):
        return Response("User doesn't exist",status=400)
    
    if userRef.get().to_dict()["pw"] != obj["pw"]:
        return Response("Incorrect password",status=400)
    
    userRef.delete()

    return Response("Passed",status=200)


@userRoutes.route('/user/getPrime', methods=["GET"])
def getUser():
    obj = request.get_json()
    if (type(obj) == str):
        obj = json.loads(obj)
    params = ['name']

    if not paramsEqual(params,obj.keys()):
        return Response("Invalid params",status=400)
    
    userRef = db.collection('Users').document(obj["name"])
    if (userRef is None):
        return Response("{}","User not found",status=400)
    
    prime = userRef.get().to_dict()["prime"]
    
    

    return Response(json.dumps({"name":obj["name"],"prime":prime}),status=200)


@userRoutes.route('/user/checkpw', methods=["POST"])
def checkPw():
    obj = request.get_json()
    if (type(obj) == str):
        obj = json.loads(obj)
    params = ['name','pw']

    if not paramsEqual(params,obj.keys()):
        return Response("Invalid params",status=400)

    userRef = db.collection('Users').document(obj["name"])
    if (userRef is None):
        return Response("{}","User not found",status=400)
    
    if (obj["pw"] != userRef.get().to_dict()["pw"]):
        return Response("Incorrect password",status=400)
    prime = userRef.get().to_dict()["prime"]
    return Response(json.dumps({"name":obj["name"],"prime":prime}),status=200)


@userRoutes.route('/user/setCart', methods=["POST"])
def setCart():
    obj = request.get_json()
    if (type(obj) == str):
        obj = json.loads(obj)
    params = ['name','owner']

    if not paramsEqual(params,obj.keys()):
        return Response("Invalid params",status=400)

    userRef = db.collection('Carts').document(obj["owner"])
    if (userRef is None):
        return Response("{}","Cart not found",status=400)

    userRef = db.collection('Users').document(obj["name"])
    if (userRef is None):
        return Response("{}","User not found",status=400)
    
    x = userRef.get().to_dict()
    x['cart'] = obj['owner']
    userRef.set(x)

    return Response("Joined",status=200)

@userRoutes.route('/user/getCart', methods=["POST"])
def UsergetCart():
    obj = request.get_json()
    if (type(obj) == str):
        obj = json.loads(obj)
    params = ['name']

    if not paramsEqual(params,obj.keys()):
        return Response("Invalid params",status=400)


    userRef = db.collection('Users').document(obj["name"])
    if (userRef is None):
        return Response("{}","User not found",status=400)
    
    x = userRef.get().to_dict()['cart']

    return Response(json.dumps({"cart":x}),status=200)