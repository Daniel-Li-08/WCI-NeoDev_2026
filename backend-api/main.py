from flaskr import create_app
from flask import Flask
from flask_cors import CORS


app = create_app()

CORS(app,resources={r"/api/*": {"origins": "*"}},
     origins=["*"],
     
     allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

     )

def main(app:Flask):

    app.run(host="0.0.0.0", port=5000, debug=True)


if __name__ == "__main__":
    main(app)