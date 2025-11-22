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


from .routes.user import userRoutes
from .routes.cart import cartRoutes
from .routes.items import itemRoutes

routes.register_blueprint(userRoutes,url_prefix='')
routes.register_blueprint(itemRoutes,url_prefix='')
routes.register_blueprint(cartRoutes,url_prefix='')