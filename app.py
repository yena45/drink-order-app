import re
from collections import Counter
from datetime import datetime, timezone, timedelta

from flask import Flask, request, redirect, url_for, render_template

app = Flask(__name__)

orders = []
last_reset_date = None
KST = timezone(timedelta(hours=9))

ROOMS = {
    "info": "정보시스템실",
    "invest": "투자시스템실",
    "ai": "AI혁신실",
}


def clean_drink_name(drink):
    return re.sub(r"(아이스|핫|뜨거운|따뜻한)\s*", "", drink, flags=re.IGNORECASE).strip()


def normalize(text):
    return re.sub(r"\s+", "", text.lower())


drink_menu_map = {
    "B1": {
        "coffee_drinks": [
            "아메리카노", "카페 라떼", "바닐라빈 라떼", "헤이즐넛 라떼",
            "돌체 라떼", "카라멜 마끼아또", "더블초콜릿 모카"
        ]
    },
    "2F": {
        "coffee_drinks": [
            "에스프레소", "아메리카노", "스테이트 블라썸 스페셜티",
            "카페 라떼", "카푸치노", "아인슈페너",
            "피스타치오 크림 라떼", "바닐라 라떼", "카페 모카",
            "연유 라떼", "바닐라 빈 라떼", "오트 라떼"
        ]
    },
    "SB": {
        "coffee_drinks": [],
        "free_input": True
    }
}


@app.route("/", methods=["GET", "POST"])
def index():
    global orders, last_reset_date

    room = request.args.get("room", "info")
    if room not in ROOMS:
        room = "info"

    now = datetime.now(KST)
    today_str = now.strftime("%Y-%m-%d")

    if now.hour >= 18 and last_reset_date != today_str:
        orders = []
        last_reset_date = today_str
        print(f"[RESET] 주문 내역 초기화됨 at {now}")

    if request.method == "POST":
        room = request.form.get("room", "info").strip()
        if room not in ROOMS:
            room = "info"

        name = request.form.get("name", "").strip()
        drink = request.form.get("drink", "").strip()
        temperature = request.form.get("temperature", "").strip()
        bean = request.form.get("bean", "").strip()
        size = request.form.get("size", "").strip()
        location = request.form.get("location", "").strip()

        if location not in drink_menu_map:
            return "카페를 선택해주세요.", 400

        if not name or not drink:
            return "이름과 음료는 필수입니다.", 400

        if temperature not in ["아이스", "따뜻한"]:
            return "온도 선택이 올바르지 않습니다.", 422

        cleaned_drink = clean_drink_name(drink)
        normalized_drink = normalize(cleaned_drink)

        cafe_config = drink_menu_map.get(location, {})
        is_free_input = cafe_config.get("free_input", False)

        coffee_drinks = cafe_config.get("coffee_drinks", [])
        coffee_normalized = [normalize(c) for c in coffee_drinks]

        if not is_free_input and normalized_drink in coffee_normalized and not bean:
            return "원두 선택이 필요합니다.", 400

        if location == "SB" and not size:
            return "스타벅스는 사이즈 선택이 필요합니다.", 400

        order_data = {
            "room": room,
            "name": name,
            "drink": cleaned_drink,
            "temperature": temperature,
            "location": location,
        }

        if bean:
            order_data["bean"] = bean

        if size:
            order_data["size"] = size

        orders.append(order_data)
        return redirect(url_for("index", room=room))

    room_orders = [order for order in orders if order.get("room") == room]

    summary_counter = Counter(
        f"{order['temperature']} {normalize(order['drink'])}"
        + (f" - {order['bean'].split()[0]}" if order.get("bean") else "")
        + (f" - {order['size']}" if order.get("size") else "")
        for order in room_orders
    )

    room_counts = {
        key: len([order for order in orders if order.get("room") == key])
        for key in ROOMS
    }

    return render_template(
        "index.html",
        orders=room_orders,
        enumerate=enumerate,
        summary=summary_counter,
        room=room,
        rooms=ROOMS,
        room_name=ROOMS[room],
        room_counts=room_counts,
    )


@app.route("/delete", methods=["POST"])
def delete():
    room = request.form.get("room", "info")

    idx = int(request.form["index"])
    room_order_indexes = [
        i for i, order in enumerate(orders)
        if order.get("room") == room
    ]

    if 0 <= idx < len(room_order_indexes):
        real_idx = room_order_indexes[idx]
        orders.pop(real_idx)

    return redirect(url_for("index", room=room))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
