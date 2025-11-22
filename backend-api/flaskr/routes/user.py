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

    docs = collectRef.stream()
    uids = [doc.id for doc in docs]

    if (obj["name"] in uids): 
        return Response("Name taken",status=400)

    collectRef.add(
        {
            "pw":obj["pw"],
            "prime":obj["prime"]
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


@userRoutes.route('/user/<name>', methods=["GET"])
def getUser(name):
    obj = request.get_json()
    if (type(obj) == str):
        obj = json.loads(obj)
    
    userRef = db.collection('Users').document(obj["name"])
    if (userRef is None):
        return Response("{}","User not found",status=400)
    
    prime = userRef.get().to_dict()["prime"]
    
    

    return Response(json.dumps({"name":name,"prime":prime}),status=200)


@userRoutes.route('/user/<name>/checkpw', methods=["POST"])
def checkPw(name):
    obj = request.get_json()
    if (type(obj) == str):
        obj = json.loads(obj)

    userRef = db.collection('Users').document(obj["name"])
    if (userRef is None):
        return Response("{}","User not found",status=400)
    
    if (obj["pw"] != userRef.get().to_dict()["pw"]):
        return Response("Incorrect password",status=400)
    
    return Response("Passed",status=200)