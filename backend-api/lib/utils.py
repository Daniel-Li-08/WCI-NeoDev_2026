def paramsEqual(params:list,requestParams:list):
    for x in requestParams:
        if x not in params:
            return False
    return True
