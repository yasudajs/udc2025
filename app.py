from flask import Flask

app = Flask(__name__)


@app.route("/")
def index():
    return "Hello, UDC2025!"


if __name__ == "__main__":
    app.run(debug=True)
