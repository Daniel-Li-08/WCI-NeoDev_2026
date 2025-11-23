import requests
import json

def createUserTest(name:str,pw:str,prime:bool):
    print(requests.post('http://127.0.0.1:5000/user/create', json=json.dumps({
        "name":name,
        "pw":pw,
        "prime":prime
    })).text)

def deleteUserTest(name:str,pw:str):
    print(requests.post('http://127.0.0.1:5000/user/delete', json=json.dumps({
        "name":name,
        "pw":pw,
    })).text)

def createCartTest(owner:str):
    print(requests.post('http://127.0.0.1:5000/cart/create', json=json.dumps({
        "owner":owner,
    })).text)

def deleteCartTest(owner:str,pw:str):
    print(requests.post('http://127.0.0.1:5000/cart/delete', json=json.dumps({
        "owner":owner,
        "pw":pw
    })).text)

def getCartTest(owner:str):
    print(requests.post('http://127.0.0.1:5000/cart/getCart', json=json.dumps({
        "owner":owner,
    })).json())

def setCartTest(name:str, owner:str):
    print(requests.post('http://127.0.0.1:5000/user/setCart', json=json.dumps({
        "name":name,
        "owner":owner,
    })).text)

def checkPwTesT(name:str,pw:str):
    print(requests.post('http://127.0.0.1:5000/user/checkpw', json=json.dumps({
        "name":name,
        "pw":pw,
    })).text)

checkPwTesT("primsade","prime")

