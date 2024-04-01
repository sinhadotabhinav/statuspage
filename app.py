from flask import Flask, render_template
import json
import os
import requests
from datetime import datetime
from datetime import timedelta

app = Flask(__name__)
date_range_days = 90

# read custom applications.json
with open("./applications.json", "r", encoding="UTF-8") as applications:
    applications_json = json.load(applications)

# read existing records if any
uptime_status_json = {}
if os.path.isfile("./uptime.json"):
    with open("./uptime.json", "r", encoding="UTF-8") as uptime_status:
        uptime_status_json = json.load(uptime_status)

def fetch_uptime_status(url):
    ''' fetch status from remote. '''
    try:
        result = requests.get(url, timeout=3)
        return result.status_code
    except requests.exceptions.Timeout:
        return 500
    except requests.ConnectionError:
        return 404

def build_status():
    ''' build status array for webui. '''
    for app_item in applications_json:
        for obj in uptime_status_json["statuses"]:
            if app_item.get("name") == obj.get("name"):
                app_item["status"] = obj.get("status")
                app_item["uptime_percent"] = obj.get("uptime_percent")
        app_item["last_status"] = fetch_uptime_status(app_item.get("url"))
    return applications_json

def is_overall_active(status_list):
    ''' determine if overall status is operational or not. '''
    for item in status_list:
        if 'last_status' in item and item['last_status'] != 200:
            return False
    return True

def get_last_updated():
    ''' get last updated timestamp in uptime josn. '''
    return uptime_status_json["last_updated"] if uptime_status_json["last_updated"] is not None else None

def get_date_range(num):
    ''' custom date fetcher function . '''
    date_range = []
    today = datetime.today()
    for index in range(0, num):
        date_range.append((today - timedelta(days=index)).strftime('%Y-%m-%d'))
    return list(reversed(date_range))

@app.route('/')
def home():
    ''' home endpoint. '''

    status_list = build_status()

    if is_overall_active(status_list):
        overall_status = "All systems are operational"
    else:
        overall_status = "Some systems have outages"

    last_updated_timestamp = datetime.strptime(get_last_updated(), "%Y-%m-%d %H:%M:%S")
    current_time = datetime.now()
    time_difference = current_time - last_updated_timestamp
    hours_difference = time_difference.total_seconds() / 3600

    if hours_difference > 1:
        last_updated = f"{int(hours_difference)} hours ago"
    else:
        last_updated = f"{int(hours_difference * 60)} minutes ago"
    
    return render_template(
        'index.html',
        app_list=status_list,
        last_updated=last_updated,
        overall_status=overall_status,
        date_range=get_date_range(date_range_days),
        date_range_days=date_range_days)

# initialize application
if __name__ == '__main__':
    app.run(debug=True)
