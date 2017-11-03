from flask import Flask, render_template

MINI_APPS = [
    {'name': 'Line Game', 'filename': 'line_game.html'},
    {'name': 'Conway\'s Game Of Life', 'filename': 'conways_game_of_life.html'},
]

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', mini_apps=MINI_APPS)

@app.route('/mini_app/<filename>')
def mini_app(filename):
    return render_template(
        filename,
        filename=filename,
        mini_apps=MINI_APPS
    )

if __name__ == '__main__':
    app.run()
