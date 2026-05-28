#!/usr/bin/env python3
"""G-HUB Thai ID Native Messaging Host.

Chrome/Edge Native Messaging uses stdin/stdout with a 4-byte little-endian
message length prefix. Do not print to stdout from this process.

Build example:
  pyinstaller --onefile --noconsole --name thai-id-host main.py
"""

from __future__ import annotations

import json
import logging
import struct
import sys
from pathlib import Path
from typing import Any

LOG_DIR = Path("C:/ProgramData/GHUB")
LOG_DIR.mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    filename=str(LOG_DIR / "thai-id-native-host.log"),
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)

try:
    from smartcard.Exceptions import CardConnectionException, NoCardException
    from smartcard.System import readers

    PYSCARD_AVAILABLE = True
except Exception as exc:  # pragma: no cover - depends on Windows host package.
    CardConnectionException = Exception
    NoCardException = Exception
    readers = None
    PYSCARD_AVAILABLE = False
    logging.exception("Unable to import pyscard: %s", exc)


SELECT_THAI_ID = [
    0x00,
    0xA4,
    0x04,
    0x00,
    0x08,
    0xA0,
    0x00,
    0x00,
    0x00,
    0x54,
    0x48,
    0x00,
    0x01,
]


def read_message() -> dict[str, Any] | None:
    raw_length = sys.stdin.buffer.read(4)
    if len(raw_length) != 4:
        return None
    message_length = struct.unpack("<I", raw_length)[0]
    raw_message = sys.stdin.buffer.read(message_length)
    if not raw_message:
        return None
    return json.loads(raw_message.decode("utf-8"))


def send_message(payload: dict[str, Any]) -> None:
    encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    sys.stdout.buffer.write(struct.pack("<I", len(encoded)))
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()


def decode_tis620(data: list[int]) -> str:
    raw = bytes(data).replace(b"\x00", b"").strip()
    for encoding in ("tis-620", "cp874", "utf-8"):
      try:
          return raw.decode(encoding).strip()
      except UnicodeDecodeError:
          continue
    return ""


def split_card_name(value: str) -> dict[str, str]:
    cleaned = " ".join(part for part in value.replace("#", " ").split() if part)
    parts = cleaned.split(" ")
    if len(parts) >= 3:
        return {
            "title": parts[0],
            "firstName": parts[1],
            "lastName": " ".join(parts[2:]),
            "fullName": cleaned,
        }
    if len(parts) == 2:
        return {
            "title": "",
            "firstName": parts[0],
            "lastName": parts[1],
            "fullName": cleaned,
        }
    return {"title": "", "firstName": cleaned, "lastName": "", "fullName": cleaned}


def convert_thai_id_date(value: str) -> str:
    digits = "".join(char for char in value if char.isdigit())
    if len(digits) != 8:
        return value.strip()
    year = int(digits[:4])
    if year > 2400:
        year -= 543
    return f"{year:04d}-{digits[4:6]}-{digits[6:8]}"


def read_bytes(connection: Any, offset: int, length: int) -> list[int]:
    payload: list[int] = []
    current_offset = offset
    remaining = length
    while remaining > 0:
        chunk_length = min(remaining, 0xFF)
        command = [
            0x80,
            0xB0,
            (current_offset >> 8) & 0xFF,
            current_offset & 0xFF,
            chunk_length,
        ]
        data, sw1, sw2 = connection.transmit(command)
        if sw1 != 0x90:
            raise RuntimeError(f"Read failed at 0x{current_offset:04X}: {sw1:02X}{sw2:02X}")
        payload.extend(data)
        current_offset += chunk_length
        remaining -= chunk_length
    return payload


def read_thai_id_card() -> dict[str, Any]:
    if not PYSCARD_AVAILABLE or readers is None:
        return {
            "error": "missing_dependency",
            "message": "pyscard is not installed in the native host.",
        }

    available_readers = readers()
    if not available_readers:
        return {
            "error": "no_reader",
            "message": "No smart card reader found.",
        }

    last_error = ""
    for reader in available_readers:
        connection = None
        try:
            connection = reader.createConnection()
            connection.connect()
            data, sw1, sw2 = connection.transmit(SELECT_THAI_ID)
            if sw1 != 0x90:
                last_error = f"SELECT Thai ID failed on {reader}: {sw1:02X}{sw2:02X}"
                continue

            cid = decode_tis620(read_bytes(connection, 0x0004, 13))
            name_th = split_card_name(decode_tis620(read_bytes(connection, 0x0011, 100)))
            name_en = split_card_name(decode_tis620(read_bytes(connection, 0x0075, 100)))
            birth_date = convert_thai_id_date(decode_tis620(read_bytes(connection, 0x00D9, 8)))
            issue_date = convert_thai_id_date(decode_tis620(read_bytes(connection, 0x0167, 8)))
            expire_date = convert_thai_id_date(decode_tis620(read_bytes(connection, 0x016F, 8)))
            address = decode_tis620(read_bytes(connection, 0x1579, 100)).replace("#", " ").strip()

            return {
                "ok": True,
                "reader": str(reader),
                "cid": cid,
                "citizenId": cid,
                "titleTh": name_th["title"],
                "firstNameTh": name_th["firstName"],
                "lastNameTh": name_th["lastName"],
                "fullNameTh": name_th["fullName"],
                "titleEn": name_en["title"],
                "firstNameEn": name_en["firstName"],
                "lastNameEn": name_en["lastName"],
                "fullName": name_en["fullName"],
                "birthDate": birth_date,
                "cardIssueDate": issue_date,
                "cardExpireDate": expire_date,
                "address": address,
            }
        except NoCardException:
            return {"error": "no_card", "message": "No card found in reader."}
        except CardConnectionException as exc:
            last_error = str(exc)
            logging.exception("Card connection error")
        except Exception as exc:
            last_error = str(exc)
            logging.exception("Unexpected Thai ID read error")
        finally:
            if connection is not None:
                try:
                    connection.disconnect()
                except Exception:
                    pass

    return {
        "error": "failed",
        "message": last_error or "Unable to read Thai ID card.",
    }


def main() -> None:
    logging.info("Thai ID native host started")
    while True:
        message = read_message()
        if message is None:
            break

        command = message.get("command")
        if command == "ping":
            send_message({"ok": True, "status": "ok", "version": "1.0.0"})
        elif command == "read_card":
            send_message(read_thai_id_card())
        else:
            send_message({"error": "unknown_command", "message": f"Unknown command: {command}"})


if __name__ == "__main__":
    main()
