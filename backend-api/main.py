from flaskr import create_app
from flask import Flask
from flask_cors import CORS, cross_origin


app = create_app()

CORS(app,resources={r"*": {"origins": "*"}})
@cross_origin
def request():
    ...


def main(app:Flask):

    app.run(host="0.0.0.0", port=5000, debug=True)


if __name__ == "__main__":
    main(app)