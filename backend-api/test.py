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



# createUserTest("MeMyselfAndI","testPass",True)
deleteUserTest("MeMyselfAndI","testPass")