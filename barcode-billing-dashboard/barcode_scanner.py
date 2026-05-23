#!/usr/bin/env python3
"""
========================================================================
Enterprise Barcode Reader & High-Speed Emitter HUD
Compatible with Python 3.x, OpenCV, PyZbar, and MySQL Connector
========================================================================
This script scans barcodes via your webcam, performs ultra-fast lookups,
renders a premium head-up display (HUD) overlay directly on the frame,
and fires instant rest sync payloads to the web billing terminal.
"""

import cv2
import time
import requests
import json
import sys

# Color codes for terminal logging
C_GREEN = "\033[92m"
C_PURPLE = "\033[95m"
C_CYAN = "\033[96m"
C_YELLOW = "\033[93m"
C_RED = "\033[91m"
C_RESET = "\033[0m"

# Try loading DB client
try:
    import mysql.connector
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False
    print(f"{C_YELLOW}[!] mysql-connector-python not found locally. DB lookups will fallback to REST API.{C_RESET}")

# Try loading scanner library pyzbar
try:
    from pyzbar import pyzbar
    PYZBAR_AVAILABLE = True
except ImportError:
    PYZBAR_AVAILABLE = False
    print(f"{C_RED}[✕] pyzbar is not installed. Webcam decoding represents simulated mocks.{C_RESET}")
    print("Run: pip install opencv-python pyzbar requests mysql-connector-python")

# ==================== CONFIGURATION ====================
API_HOST = "http://localhost:3000"
SCAN_API_URL = f"{API_HOST}/api/scan"

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "password",
    "database": "billing_system"
}

COOLDOWN_SECONDS = 3.0 # Prevents rapid repeat scans of the same item
# =======================================================

# 1. In-Memory Local Products Catalog (Fallback Lookup)
LOCAL_PRODUCTS_FALLBACK = {
    "123456789012": {
        "product_name": 'XPS Elite Ultra 15" Laptop',
        "price": 1299.99,
        "stock_quantity": 45
    },
    "987654321098": {
        "product_name": "Acoustix Aura ANC Wireless Headphones",
        "price": 249.50,
        "stock_quantity": 120
    },
    "456789012345": {
        "product_name": "Horizon Active Smartwatch Gen 5",
        "price": 189.00,
        "stock_quantity": 85
    },
    "748291036481": {
        "product_name": "Apex Pro Mechanical Keyboard SDK",
        "price": 145.00,
        "stock_quantity": 30
    },
    "395726104829": {
        "product_name": "Viper Mini Ergonomic Mouse v3",
        "price": 69.99,
        "stock_quantity": 150
    }
}


class VeritasBarcodeScanner:
    def __init__(self, camera_index=0, api_url=SCAN_API_URL):
        self.camera_index = camera_index
        self.api_url = api_url
        self.scanned_items_cooldown = {} # {barcode: timestamp}
        self.db_conn = None
        self.use_db = MYSQL_AVAILABLE
        
        # HUD active Overlay State (lasts for 3.5 seconds)
        self.hud_visible = False
        self.hud_status = "SUCCESS"  # SUCCESS or UNKNOWN
        self.hud_barcode = ""
        self.hud_product = None
        self.hud_trigger_time = 0.0

        print(f"\n{C_PURPLE}===================================================={C_RESET}")
        print(f"{C_PURPLE}   VERITAS BARCODE SCAN HUD CONTROLS INITIALIZING    {C_RESET}")
        print(f"{C_PURPLE}===================================================={C_RESET}")

        if self.use_db:
            try:
                self.db_conn = mysql.connector.connect(**DB_CONFIG)
                print(f"{C_GREEN}[✓] Tied MySQL connection successfully.{C_RESET}")
            except Exception as e:
                print(f"{C_YELLOW}[!] MySQL connection bypassed: {e}. Defaulting to REST API.{C_RESET}")
                self.use_db = False

    def lookup_product(self, barcode):
        """Perform high-speed 3-tier lookup: MySQL -> REST API -> In-Memory Fallback"""
        
        # Tier 1: Local MySQL
        if self.use_db and self.db_conn:
            try:
                if not self.db_conn.is_connected():
                    self.db_conn.reconnect()
                cursor = self.db_conn.cursor(dictionary=True)
                cursor.execute("SELECT product_name, price, stock_quantity FROM products WHERE barcode_value = %s", (barcode,))
                match = cursor.fetchone()
                cursor.close()
                if match:
                    match["price"] = float(match["price"])
                    match["stock_quantity"] = int(match["stock_quantity"])
                    return match
            except Exception as ex:
                print(f"[!] DB Lookup error: {ex}")

        # Tier 2: Dashboard REST Endpoint
        try:
            payload = {"barcode": barcode, "source": "Physical Webcam HUD"}
            resp = requests.post(self.api_url, json=payload, timeout=1.5)
            if resp.status_code == 200:
                body = resp.json()
                if body.get("success") and body.get("product"):
                    prod = body["product"]
                    return {
                        "product_name": prod["product_name"],
                        "price": float(prod["price"]),
                        "stock_quantity": int(prod["stock_quantity"])
                    }
        except Exception:
            pass # Silent bypass to third tier

        # Tier 3: Local In-Memory Fallback
        if barcode in LOCAL_PRODUCTS_FALLBACK:
            return LOCAL_PRODUCTS_FALLBACK[barcode]

        return None

    def emit_barcode_to_dashboard(self, barcode):
        """Transmit scan pulse to live web system"""
        try:
            payload = {"barcode": barcode, "source": "Webcam Scan HUD"}
            resp = requests.post(self.api_url, json=payload, timeout=1.5)
            if resp.status_code == 200:
                print(f"[{C_GREEN}✓{C_RESET}] Emitted to Dashboard: SKU {barcode}")
                return True
        except Exception as err:
            print(f"[{C_RED}✕{C_RESET}] Direct API emission failed: Register is likely offline")
        return False

    def draw_glowing_hud_overlay(self, frame, barcode, status, product_details):
        """Draws a premium styled semi-transparent product info card on the image stream"""
        x, y = 20, 20
        w, h = 420, 160
        
        # 1. Overlay container
        overlay = frame.copy()
        cv2.rectangle(overlay, (x, y), (x + w, y + h), (18, 18, 20), -1)
        
        # Theme accent based on identification
        if status == "SUCCESS":
            color = (0, 230, 0) # Green accent
            header = "VERITAS SYSTEM - SKU IDENTIFIED"
        else:
            color = (50, 50, 240) # Red accent
            header = "VERITAS SYSTEM - UNKNOWN BARCODE"
            
        cv2.rectangle(overlay, (x, y), (x + w, y + h), color, 2)
        cv2.line(overlay, (x + 15, y + 40), (x + w - 15, y + 40), (80, 80, 80), 1)
        
        # Alpha blend transparency
        alpha = 0.85
        cv2.addWeighted(overlay, alpha, frame, 1.0 - alpha, 0, frame)
        
        # 2. Text layout parameters
        cv2.putText(frame, header, (x + 18, y + 28), cv2.FONT_HERSHEY_DUPLEX, 0.44, color, 1, cv2.LINE_AA)
        
        font = cv2.FONT_HERSHEY_SIMPLEX
        if status == "SUCCESS" and product_details:
            name = product_details.get("product_name", "UNKNOWN")
            price = product_details.get("price", 0.0)
            stock = product_details.get("stock_quantity", 0)
            
            cv2.putText(frame, f"ITEM:  {name.upper()}", (x + 18, y + 65), font, 0.48, (244, 244, 245), 1, cv2.LINE_AA)
            cv2.putText(frame, f"PRICE: ${price:.2f}", (x + 18, y + 95), font, 0.50, color, 1, cv2.LINE_AA)
            cv2.putText(frame, f"STOCK: {stock} items on hand", (x + 18, y + 125), font, 0.45, (230, 180, 0), 1, cv2.LINE_AA)
        else:
            cv2.putText(frame, f"CODE:  {barcode}", (x + 18, y + 65), font, 0.48, (244, 244, 245), 1, cv2.LINE_AA)
            cv2.putText(frame, "REASON:  Catalog registration code is vacant.", (x + 18, y + 92), font, 0.45, (120, 120, 250), 1, cv2.LINE_AA)
            cv2.putText(frame, "ACTION:  Register quick wizard on dashboard.", (x + 18, y + 118), font, 0.42, (200, 200, 200), 1, cv2.LINE_AA)

        # Footer pulse
        cv2.circle(frame, (x + 22, y + 145), 3, (0, 215, 230), -1)
        cv2.putText(frame, "REAL-TIME BILLING SYNCED TERMINAL", (x + 32, y + 148), font, 0.35, (140, 140, 140), 1, cv2.LINE_AA)

    def run_scanner(self):
        if not PYZBAR_AVAILABLE:
            print(f"{C_RED}[✕] Pyzbar scanner failed to load. Initiating keyboard simulated scanner feed.{C_RESET}")
            self.run_keyboard_simulator()
            return

        cap = cv2.VideoCapture(self.camera_index)
        if not cap.isOpened():
            print(f"{C_YELLOW}[!] Camera index {self.camera_index} unavailable. Scanning backups...{C_RESET}")
            for idx in [1, 2, -1]:
                cap = cv2.VideoCapture(idx)
                if cap.isOpened():
                    self.camera_index = idx
                    break
            
            if not cap.isOpened():
                print(f"{C_RED}[✕] Webcam hardware was not found. Bypassing stream to simulation mode.{C_RESET}")
                self.run_keyboard_simulator()
                return

        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        print(f"\n{C_GREEN}[✓] LIVE WEBCAM SCANNER ACTIVE (Camera Index: {self.camera_index}){C_RESET}")
        print(f"{C_CYAN}[✦] Point a barcode at the camera. Complete details will render instantly.{C_RESET}")
        print(f"[!] Hit [ESC] to terminate python program.\n")

        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    time.sleep(0.05)
                    continue

                # Query decoded barcodes
                barcodes = pyzbar.decode(frame)
                current_time = time.time()

                for barcode in barcodes:
                    barcode_data = barcode.data.decode("utf-8")
                    
                    # Prevent instant repeat triggers
                    last_scanned = self.scanned_items_cooldown.get(barcode_data, 0)
                    if current_time - last_scanned < COOLDOWN_SECONDS:
                        continue
                        
                    self.scanned_items_cooldown[barcode_data] = current_time
                    
                    # Fast lookup values
                    prod_data = self.lookup_product(barcode_data)
                    
                    # Trigger Overlay UI State
                    self.hud_visible = True
                    self.hud_barcode = barcode_data
                    self.hud_trigger_time = current_time
                    
                    if prod_data:
                        self.hud_status = "SUCCESS"
                        self.hud_product = prod_data
                        print(f"\n{C_GREEN}[⚡] SCAN DETECTED: {prod_data['product_name']} | Price: ${prod_data['price']}{C_RESET}")
                    else:
                        self.hud_status = "UNKNOWN"
                        self.hud_product = None
                        print(f"\n{C_YELLOW}[⚡] UNKNOWN BARCODE scanned: {barcode_data}{C_RESET}")
                        
                    # Emit to remote client portal
                    self.emit_barcode_to_dashboard(barcode_data)

                # Show overlay if timeout has not elapsed (3.5 seconds)
                if self.hud_visible:
                    if current_time - self.hud_trigger_time > 4.0:
                        self.hud_visible = False
                    else:
                        self.draw_glowing_hud_overlay(frame, self.hud_barcode, self.hud_status, self.hud_product)

                # Render output preview
                cv2.imshow("Veritas Barcode Scanner HUD Feed", frame)

                key = cv2.waitKey(1) & 0xFF
                if key == 27:
                    break

        except KeyboardInterrupt:
            print(f"\n[!] Terminated.")
        finally:
            cap.release()
            cv2.destroyAllWindows()
            if self.db_conn and self.db_conn.is_connected():
                self.db_conn.close()

    def run_keyboard_simulator(self):
        """Simulation mode to let you type barcodes into CLI and see HUD logs and dashboards sync instantly"""
        print(f"\n{C_PURPLE}=== VERITAS VIRTUAL TERMINAL ACTIVE ==={C_RESET}")
        print("Type a barcode/SKU and press [ENTER] to simulate camera decoding.")
        print("Try these codes: 123456789012, 987654321098, 456789012345, or a custom one!")
        print("Type 'exit' to quit.\n")

        try:
            while True:
                user_input = input("Simulated Barcode Scanner > ").strip()
                if not user_input:
                    continue
                if user_input.lower() == 'exit':
                    break
                    
                prod_data = self.lookup_product(user_input)
                
                print("-" * 50)
                if prod_data:
                    print(f"[{C_GREEN}SUCCESS{C_RESET}] MATCH DETECTED IN FRACTION OF A SECOND:")
                    print(f"  Item Name: {prod_data['product_name']}")
                    print(f"  Unit Cost: ${prod_data['price']:.2f}")
                    print(f"  In Stock:  {prod_data['stock_quantity']} units")
                else:
                    print(f"[{C_RED}UNKNOWN{C_RESET}] SKU CODE NOT LISTED: {user_input}")
                    print("  Wizard quick-register modal opened on web dashboard.")
                
                # Emit to dashboard
                self.emit_barcode_to_dashboard(user_input)
                print("-" * 50 + "\n")

        except KeyboardInterrupt:
            print("\nProgram finished.")


if __name__ == "__main__":
    camera_idx = 0
    if len(sys.argv) > 1:
        try:
            camera_idx = int(sys.argv[1])
        except ValueError:
            pass

    scanner = VeritasBarcodeScanner(camera_index=camera_idx)
    scanner.run_scanner()
