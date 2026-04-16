from flask import Flask, jsonify, request
import logic

app = Flask(__name__, static_folder='static', static_url_path='')

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/api/run")
def api_run():
    loc_param = request.args.get('loc', 'A')
    locs = [l.strip() for l in loc_param.split(',') if l.strip()]
    
    dispatch_tasks = logic.process_dispatch(locs)
    
    return jsonify({
        "grid": logic.grid,
        "locations": logic.locations,
        "warehouse": logic.warehouse,
        "tasks": dispatch_tasks
    })

if __name__ == "__main__":
    app.run(debug=True, port=8000)
