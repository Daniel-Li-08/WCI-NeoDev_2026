from flask import Blueprint
from flask import request, Response
import json
from lib.utils import *
from lib.db import db
from google.cloud import firestore


routes = Blueprint("routes", __name__)

@routes.route('/', methods=["GET"])         
def home():
    return "Hello World"


'''
Documentation

'''



@routes.route('/cart/create', methods=["POST"])         
def createCart():
    data = request.get_json()
    user = data["user"]
    return ""
    



@routes.route('/user/create', methods=["POST"])         
def createUser():
    data = request.get_json()
    obj:dict = json.loads(data)
    params = ['name','pw','prime']

    if not paramsEqual(params,obj.keys()):
        return Response(message="Invalid params",status=400)
    
    collectRef = db.collection('Users')
    collectRef.add(
        {
            "pw":obj["pw"],
            "prime":obj["prime"]
        },
        obj["name"]
    )

    return Response(message="Passed",status=200)



@routes.route('/user/delete', methods=["POST"])
def deleteUser():
    data = request.get_json()
    obj:dict = json.loads(data)
    params = ['name','pw']

    if not paramsEqual(params,obj.keys()):
        return Response(message="Invalid params",status=400)
    
    userRef = db.collection('Users').document(obj["name"])
    if (userRef is None):
        return Response(message="User doesn't exist",status=400)
    
    if userRef.get().to_dict()["pw"] != obj["pw"]:
        return Response(message="Incorrect password",status=400)
    
    userRef.delete()

    return Response(message="Passed",status=200)


@routes.route('/user/<name>', methods=["POST"])
def getUser(name):
    data = request.get_json()
    obj:dict = json.loads(data)

    
    userRef = db.collection('Users').document(obj["name"])
    if (userRef is None):
        return Response("{}",message="User not found",status=400)
    
    prime = userRef.get().to_dict()["prime"]
    
    

    return Response(json.dumps({"name":name,"prime":prime}),status=200)

@routes.route('/cart/addItem', methods=["POST"])
def addItem():
    return ""

