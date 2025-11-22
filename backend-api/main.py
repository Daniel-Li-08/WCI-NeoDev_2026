from flaskr import create_app
from flask import Flask

app = create_app()

def main(app:Flask):

    app.run(host="0.0.0.0", port=5000, debug=True)


if __name__ == "__main__":
    main(app)