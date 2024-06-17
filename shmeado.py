import requests
import json

ign = "Ghasp"

url = "https://www.shmeado.club/player/stats/" + ign + "/general/quests/"
r = requests.get(url)
data = r.text
start_index = data.find("'online': {")
end_index = data.find("}", start_index)
online_data_str = "{" + data[start_index:end_index] + "}}}"
online_data_str = online_data_str.replace("'", '"')
try:
    online_data = json.loads(online_data_str)
    session_data = online_data["online"]["session"]

    # ------ error check ------
    if online_data["online"]["success"] == "False":
        print("Error")

    # ------ online check -----
    if session_data["online"] == "False":
        print("online: False")
    else:
        print("ign: " + ign)
        print("online: True")
        values = ["gameType", "mode", "map"]
        for value in values:
            try:
                item = session_data[value]
                print(value + ": " + item)
            except KeyError:
                continue

except json.JSONDecodeError:
    print("Error")
