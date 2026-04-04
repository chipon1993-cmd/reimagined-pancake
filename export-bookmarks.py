#!/usr/bin/env python3
"""
Firefox Bookmarks Exporter
===========================
Этот скрипт читает закладки из Firefox и сохраняет их в bookmarks.json.

Как использовать:
  1. Закрой Firefox (или он может блокировать файл)
  2. Запусти: python3 export-bookmarks.py
  3. Файл bookmarks.json появится в этой папке
  4. Закоммить bookmarks.json в репозиторий

Скрипт автоматически находит профиль Firefox на Windows, macOS и Linux.
"""

import json
import os
import platform
import shutil
import sqlite3
import sys
import tempfile
from pathlib import Path
from datetime import datetime


def find_firefox_profiles():
    """Находит директории профилей Firefox."""
    system = platform.system()

    if system == "Windows":
        base = Path(os.environ.get("APPDATA", "")) / "Mozilla" / "Firefox" / "Profiles"
    elif system == "Darwin":  # macOS
        base = Path.home() / "Library" / "Application Support" / "Firefox" / "Profiles"
    else:  # Linux
        base = Path.home() / ".mozilla" / "firefox"

    if not base.exists():
        return []

    profiles = []
    for entry in base.iterdir():
        places = entry / "places.sqlite"
        if places.exists():
            profiles.append(entry)

    return profiles


def read_bookmarks(profile_path):
    """Читает закладки из places.sqlite профиля Firefox."""
    places_db = profile_path / "places.sqlite"

    if not places_db.exists():
        print(f"  [!] places.sqlite не найден в {profile_path}")
        return None

    # Копируем БД во временный файл (Firefox может блокировать оригинал)
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".sqlite")
    tmp.close()
    shutil.copy2(places_db, tmp.name)

    try:
        conn = sqlite3.connect(tmp.name)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        # Получаем дерево закладок
        cur.execute("""
            SELECT
                b.id,
                b.type,
                b.parent,
                b.title,
                b.dateAdded,
                b.lastModified,
                p.url,
                p.description
            FROM moz_bookmarks b
            LEFT JOIN moz_places p ON b.fk = p.id
            ORDER BY b.parent, b.position
        """)

        rows = cur.fetchall()
        conn.close()

        # Строим дерево
        nodes = {}
        for row in rows:
            node = {
                "id": row["id"],
                "type": "folder" if row["type"] == 2 else "bookmark" if row["type"] == 1 else "separator",
                "title": row["title"] or "",
                "parent": row["parent"],
                "children": [],
            }
            if row["url"] and not row["url"].startswith("place:"):
                node["url"] = row["url"]
            if row["description"]:
                node["description"] = row["description"]
            if row["dateAdded"]:
                # Firefox stores microseconds
                try:
                    node["dateAdded"] = datetime.fromtimestamp(row["dateAdded"] / 1_000_000).isoformat()
                except (ValueError, OSError):
                    pass

            nodes[row["id"]] = node

        # Собираем дерево
        root_children = []
        for nid, node in nodes.items():
            parent_id = node["parent"]
            if parent_id in nodes:
                nodes[parent_id]["children"].append(node)
            else:
                root_children.append(node)

        # Убираем служебные поля для чистого вывода
        def clean(node):
            result = {"title": node["title"], "type": node["type"]}
            if "url" in node:
                result["url"] = node["url"]
            if "description" in node:
                result["description"] = node["description"]
            if "dateAdded" in node:
                result["dateAdded"] = node["dateAdded"]
            if node["children"]:
                result["children"] = [clean(c) for c in node["children"]]
            return result

        return [clean(n) for n in root_children]

    finally:
        os.unlink(tmp.name)


def main():
    print("=" * 50)
    print("  Firefox Bookmarks Exporter")
    print("=" * 50)
    print()

    profiles = find_firefox_profiles()

    if not profiles:
        print("[!] Профили Firefox не найдены.")
        print()
        print("Убедись что Firefox установлен и у тебя есть профиль.")
        print("Или укажи путь к профилю вручную:")
        print("  python3 export-bookmarks.py /path/to/firefox/profile")
        sys.exit(1)

    # Если передан аргумент — используем его как путь
    if len(sys.argv) > 1:
        profile = Path(sys.argv[1])
        if not profile.exists():
            print(f"[!] Путь не найден: {profile}")
            sys.exit(1)
        profiles = [profile]

    print(f"Найдено профилей: {len(profiles)}")
    print()

    all_bookmarks = []
    for i, profile in enumerate(profiles):
        print(f"[{i+1}] Профиль: {profile.name}")
        bookmarks = read_bookmarks(profile)
        if bookmarks:
            all_bookmarks.extend(bookmarks)
            count = sum(1 for b in _flatten(bookmarks) if b.get("type") == "bookmark")
            print(f"    Закладок: {count}")
        print()

    if not all_bookmarks:
        print("[!] Закладки не найдены.")
        sys.exit(1)

    # Сохраняем
    output_path = Path(__file__).parent / "bookmarks.json"
    data = {
        "exportDate": datetime.now().isoformat(),
        "source": "Firefox",
        "bookmarks": all_bookmarks,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    total = sum(1 for b in _flatten(all_bookmarks) if b.get("type") == "bookmark")
    print(f"Готово! Сохранено {total} закладок в bookmarks.json")
    print(f"Путь: {output_path}")
    print()
    print("Теперь закоммить bookmarks.json в репозиторий:")
    print("  git add bookmarks.json && git commit -m 'add bookmarks' && git push")


def _flatten(nodes):
    """Рекурсивно обходит дерево закладок."""
    for node in nodes:
        yield node
        if "children" in node:
            yield from _flatten(node["children"])


if __name__ == "__main__":
    main()
