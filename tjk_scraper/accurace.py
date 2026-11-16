# -*- coding: utf-8 -*-
"""Accurace ara-pozisyon verisini indirip güvenli biçimde eşleştiren yardımcılar.

Accurace ölçümleri resmî TJK sonuç verisi değildir. Bu modül, yalnızca tarih,
şehir, koşu, at adı ve bitiriş sırası doğrulandıktan sonra taktik analizine
katılabilecek ölçümleri döndürür.
"""

import json
import re
import unicodedata
from datetime import datetime

import requests
from bs4 import BeautifulSoup


SOURCE_NAME = "Accurace (resmî olmayan ara-pozisyon ölçümü)"
CITY_SLUGS = {
    "Ankara": "ANKARA",
    "İstanbul": "ISTANBUL",
    "İzmir": "IZMIR",
    "Bursa": "BURSA",
    "Adana": "ADANA",
    "Şanlıurfa": "SANLIURFA",
    "Elazığ": "ELAZIG",
    "Diyarbakır": "DIYARBAKIR",
    "Kocaeli": "KOCAELI",
    "Antalya": "ANTALYA",
}


def normalize_city_slug(city):
    """Şehir adını Accurace URL'sinde kullanılan resmî slug'a çevirir."""
    key = normalize_text(city)
    for name, slug in CITY_SLUGS.items():
        if normalize_text(name) == key or _same_horse_name(city, name):
            return slug
    return None


def normalize_text(value):
    value = (value or "").replace("\ufffd", "")
    value = value.replace("İ", "I").replace("ı", "i")
    value = unicodedata.normalize("NFKD", value)
    value = "".join(char for char in value if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]", "", value.lower())


def parse_race_date(value):
    """TJK profilindeki tarih biçimlerini ISO tarihe dönüştürür."""
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(value.strip(), fmt).strftime("%Y-%m-%d")
        except (TypeError, ValueError):
            pass
    return None


def _resolve_ref(payload, value):
    """Nuxt/devalue nesne, dizi ve reactive referanslarını çözer."""
    if isinstance(value, int) and 0 <= value < len(payload):
        candidate = payload[value]
        if isinstance(candidate, (str, dict, list)):
            value = candidate
    while isinstance(value, list) and len(value) > 1 and value[0] in {
        "ShallowReactive", "Reactive", "Ref", "ShallowRef"
    }:
        ref = value[1]
        value = payload[ref] if isinstance(ref, int) and 0 <= ref < len(payload) else ref
    return value


def _scalar_ref(payload, value):
    """Sayısal/string atomik Nuxt referansını tam bir kez çözer."""
    if isinstance(value, int) and 0 <= value < len(payload):
        candidate = payload[value]
        if isinstance(candidate, (int, float, str)) and not isinstance(candidate, bool):
            return candidate
    return value


def parse_accurace_page(html):
    """Accurace Nuxt sayfasından yarış ve at ara-pozisyonlarını ayrıştırır."""
    soup = BeautifulSoup(html or "", "html.parser")
    serialized = next(
        (script.get_text() for script in soup.find_all("script")
         if (script.get_text() or "").lstrip().startswith("[[")),
        None,
    )
    if not serialized:
        raise ValueError("Accurace Nuxt veri yükü bulunamadı")

    payload = json.loads(serialized)
    if not isinstance(payload, list) or len(payload) < 2:
        raise ValueError("Accurace veri yükü beklenen biçimde değil")

    root = _resolve_ref(payload, payload[1])
    page_path = _scalar_ref(payload, root.get("path")) if isinstance(root, dict) else None
    path_match = re.fullmatch(r"/network/(\d{4}-\d{2}-\d{2})/([A-Z]+)/([1-9]\d*)", page_path or "")
    if not path_match:
        raise ValueError("Accurace istek yolu doğrulanamadı")
    requested_date, requested_city_slug, requested_race_no = path_match.groups()
    data_ref = root.get("data") if isinstance(root, dict) else None
    wrapper = _resolve_ref(payload, data_ref)
    result = _resolve_ref(payload, wrapper.get("result")) if isinstance(wrapper, dict) else None
    response = _resolve_ref(payload, result.get("data")) if isinstance(result, dict) else None
    table_ref = response.get("table") if isinstance(response, dict) else None
    table = _resolve_ref(payload, table_ref)
    if not isinstance(table, dict) or not all(key in table for key in ("race", "horse")):
        raise ValueError("Accurace yarış tablosu bulunamadı")

    race_ref = _resolve_ref(payload, table["race"])
    race = {
        key: _scalar_ref(payload, value)
        for key, value in race_ref.items()
    }
    horses = []
    for horse_ref in _resolve_ref(payload, table["horse"]):
        horse = _resolve_ref(payload, horse_ref)
        name = _scalar_ref(payload, horse.get("horse_name"))
        horse_no = _scalar_ref(payload, horse.get("horse_number"))
        finish = _scalar_ref(payload, horse.get("place"))
        checkpoints = []
        for checkpoint_ref in _resolve_ref(payload, horse.get("checkpoint")):
            checkpoint = _resolve_ref(payload, checkpoint_ref)
            meter = _scalar_ref(payload, checkpoint.get("checkpoint"))
            position = _scalar_ref(payload, checkpoint.get("place"))
            split_time = _scalar_ref(payload, checkpoint.get("time"))
            if isinstance(meter, int) and isinstance(position, int):
                checkpoints.append({
                    "meter": meter,
                    "position": position,
                    "time": split_time if isinstance(split_time, str) else None,
                })
        checkpoints.sort(key=lambda item: item["meter"])
        if isinstance(name, str) and isinstance(finish, int) and finish >= 1:
            horses.append({
                "name": name,
                "number": horse_no if isinstance(horse_no, int) else None,
                "finish": finish,
                "checkpoints": checkpoints,
            })

    if not horses:
        raise ValueError("Accurace sayfasında eşleştirilebilir at bulunamadı")
    distance = race.get("length") if isinstance(race.get("length"), int) else None
    # Bazı sayfalarda yarış dışı kalan atın bitiriş değeri liste uzunluğunu
    # aşabiliyor. Geçersiz atı dışlayıp alan büyüklüğünü en büyük geçerli
    # bitirişe göre hesapla; sağlam atların ölçümlerini kaybetme.
    field_size = max(len(horses), max(horse["finish"] for horse in horses))
    for horse in horses:
        horse["checkpoints"] = [
            item for item in horse["checkpoints"]
            if isinstance(distance, int)
            and 0 < item["meter"] <= distance
            and 1 <= item["position"] <= field_size
        ]
    parsed_date = parse_race_date(race.get("date"))
    if parsed_date != requested_date:
        raise ValueError("Accurace sayfa tarihi URL ile uyuşmuyor")
    if normalize_city_slug(race.get("city")) != requested_city_slug:
        raise ValueError("Accurace sayfa şehri URL ile uyuşmuyor")

    return {
        "city": race.get("city"),
        "city_slug": requested_city_slug,
        "date": parsed_date,
        "requested_race_no": int(requested_race_no),
        "distance": distance,
        "source": SOURCE_NAME,
        "horses": horses,
    }


def fetch_race(session, date_iso, city_slug, race_no, timeout=20):
    url = f"https://accurace.net/network/{date_iso}/{city_slug}/{int(race_no)}"
    response = session.get(url, timeout=timeout, headers={"User-Agent": "Mozilla/5.0"})
    response.raise_for_status()
    response.encoding = "utf-8"
    parsed = parse_accurace_page(response.text)
    if parsed["date"] != date_iso:
        raise ValueError(f"Tarih uyuşmadı: {parsed['date']} != {date_iso}")
    expected_city = next((name for name, slug in CITY_SLUGS.items() if slug == city_slug), None)
    if not expected_city or not _same_horse_name(parsed["city"], expected_city):
        raise ValueError(f"Şehir uyuşmadı: {parsed['city']} != {city_slug}")
    parsed["url"] = url
    return parsed


def _same_horse_name(left, right):
    if normalize_text(left) == normalize_text(right):
        return True
    # Accurace'nin bazı Türkçe harfleri U+FFFD olarak verdiği gözlendi. Yalnızca
    # tek karakterlik eksiklik durumunda tolerans göster; koşu ve bitiriş de ayrıca eşleşmeli.
    if "\ufffd" not in (left or "") and "\ufffd" not in (right or ""):
        return False
    left_norm = normalize_text(left)
    right_norm = normalize_text(right)
    if not left_norm or not right_norm or abs(len(left_norm) - len(right_norm)) > 1:
        return False
    previous = list(range(len(right_norm) + 1))
    for i, char_left in enumerate(left_norm, 1):
        current = [i]
        for j, char_right in enumerate(right_norm, 1):
            current.append(min(
                current[-1] + 1,
                previous[j] + 1,
                previous[j - 1] + (char_left != char_right),
            ))
        previous = current
    return previous[-1] <= 1


def match_horse_result(race_data, horse_name, finish_position):
    """At adı ve bitiriş sırası tekil eşleşirse ara-pozisyonlarını döndürür."""
    if not normalize_text(horse_name) or not isinstance(finish_position, int):
        return None
    matches = [
        horse for horse in race_data.get("horses", [])
        if _same_horse_name(horse.get("name"), horse_name)
        and horse.get("finish") == finish_position
        and horse.get("checkpoints")
    ]
    return matches[0] if len(matches) == 1 else None


def _median(values):
    ordered = sorted(values)
    return ordered[len(ordered) // 2]


def classify_race_style(horse, field_size, distance):
    """Bir koşudaki ölçülmüş pozisyonlardan koşu stilini çıkarır.

    Bitiriş sırası stil hesabına katılmaz; yalnızca eşleştirme doğrulamasında kullanılır.
    stilin kendisi her zaman 100 m ara-pozisyonlarından türetilir.
    """
    checkpoints = horse.get("checkpoints") or []
    finish = horse.get("finish")
    if not checkpoints or not isinstance(field_size, int) or field_size < 4:
        return None
    if not isinstance(distance, int) or distance < 600 or not isinstance(finish, int):
        return None

    usable = [
        item for item in checkpoints
        if 0 < item["meter"] <= distance and 1 <= item["position"] <= field_size
    ]
    if not usable:
        return None

    early = [item["position"] for item in usable if item["meter"] <= max(300, int(distance * 0.30))]
    middle = [
        item["position"] for item in usable
        if int(distance * 0.30) <= item["meter"] <= int(distance * 0.70)
    ]
    late = [
        item for item in usable
        if int(distance * 0.65) <= item["meter"] < distance
    ]

    # Kısa yarışlarda veya eksik ölçümlerde tek pencere boş kalabilir;
    # mevcut ölçümlerin tamamından güvenli bir çapa üret.
    anchor_values = middle or early or [item["position"] for item in usable]
    early_values = early or anchor_values[: max(1, len(anchor_values) // 2)]
    middle_rank = _median(middle or anchor_values)
    early_rank = _median(early_values)

    early_ratio = early_rank / field_size
    rear_threshold = max(4, int(field_size * 0.60 + 0.999))

    # Kapanış sprinteri: yalnızca ara-pozisyon eğrisinden, arka gruptan öne
    # doğru belirgin bir kazanç varsa atanır. Bitiriş sırası kullanılmaz.
    if late:
        last_late = max(late, key=lambda item: item["meter"])["position"]
        gained = middle_rank - last_late
        if (last_late >= rear_threshold and gained >= 3) or gained >= 5:
            return "SPRINTER"

    # Liderlik yalnızca erken ölçümlerin en az yarısında fiilen 1. sırada
    # olmakla verilir. Erken ikincilik kaçak değil, presçi taktiğidir.
    early_leader_ratio = sum(1 for position in early_values if position == 1) / len(early_values)
    if early_rank == 1 and early_leader_ratio >= 0.50:
        return "KACAK"

    # Ön grubu takip eden presçi: ilk bölümde alanın ön yarısında seyir veya
    # yarış ortasında ilk üçe yerleşmiş olmak.
    if early_rank <= max(4, int(field_size * 0.45)) or early_ratio <= 0.45:
        return "PRESCI"
    if middle_rank <= max(3, int(field_size * 0.30)) and early_rank <= max(5, int(field_size * 0.55)):
        return "PRESCI"

    # Orta grup: yarışın ortasında alanın ön yarısı ile %75 diliminde seyir.
    if middle_rank <= max(6, int(field_size * 0.72 + 0.999)):
        return "ORTA_GRUP"

    # Geride bekleyen / düzlükte arayan safkan. Ölçüm arka grupta kaldığını
    # gösteriyorsa bu da ölçülmüş bir taktiktir; sonuç sırasından türetilmez.
    return "SPRINTER"


def collect_horse_observations(conn, horse_id, history_rows):
    """Önceden önbelleğe alınmış yarışları TJK at geçmişiyle doğrular."""
    observations = []
    for row in history_rows:
        date_iso = parse_race_date(row["tarih"])
        city_slug = normalize_city_slug(row["hipodrom_sehir"])
        race_no = row["kosu_no"]
        if not date_iso or not city_slug or not race_no:
            continue
        cached = conn.execute(
            "SELECT payload_json FROM accurace_race_cache "
            "WHERE date_iso = ? AND city_slug = ? AND race_no = ? AND status = 'OK'",
            (date_iso, city_slug, race_no),
        ).fetchone()
        if not cached or not cached["payload_json"]:
            continue
        try:
            race_data = json.loads(cached["payload_json"])
        except (TypeError, json.JSONDecodeError):
            continue
        if race_data.get("requested_race_no") != race_no:
            continue
        expected_distance = row["mesafe"]
        if expected_distance and race_data.get("distance") != expected_distance:
            continue
        if race_data.get("date") != date_iso or race_data.get("city_slug") != city_slug:
            continue
        matched = match_horse_result(race_data, row["at_adi"] if "at_adi" in row.keys() else "", row["sira"])
        if not matched:
            # Profil satırındaki at adı eksikse, ana at kaydından kimliği doğrula.
            horse_row = conn.execute("SELECT at_adi FROM atlar WHERE id = ?", (horse_id,)).fetchone()
            matched = match_horse_result(race_data, horse_row["at_adi"] if horse_row else "", row["sira"])
        if not matched:
            continue
        observations.append({
            "date": date_iso,
            "distance": row["mesafe"] or race_data.get("distance"),
            "field_size": len(race_data.get("horses", [])),
            "horse": matched,
        })
    return observations
