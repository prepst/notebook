import requests
import json
import sys
from datetime import datetime
import websocket
import threading
import time

class TldrawAPITester:
    def __init__(self, base_url="https://teamcanvas-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.ws_messages = []
        self.ws_connected = False
        self.ws_error = None

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}")
                except:
                    pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")

            return success, response.json() if response.status_code == 200 else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_websocket(self, room_id="default", duration=5):
        """Test WebSocket connection"""
        self.tests_run += 1
        print(f"\n🔍 Testing WebSocket Connection to room '{room_id}'...")
        
        ws_url = f"{self.base_url.replace('https', 'wss')}/api/ws/rooms/{room_id}"
        
        def on_message(ws, message):
            try:
                msg = json.loads(message)
                self.ws_messages.append(msg)
                print(f"   📨 Received: {msg.get('type', 'unknown')}")
            except Exception as e:
                print(f"   ⚠️  Error parsing message: {e}")

        def on_error(ws, error):
            self.ws_error = error
            print(f"   ❌ WebSocket Error: {error}")

        def on_close(ws, close_status_code, close_msg):
            print(f"   🔌 WebSocket Closed: {close_status_code}")

        def on_open(ws):
            self.ws_connected = True
            print(f"   ✅ WebSocket Connected")
            
            # Send a test update message
            test_message = {
                "type": "update",
                "changes": {
                    "test_id": {
                        "id": "test_id",
                        "type": "shape",
                        "x": 100,
                        "y": 100
                    }
                },
                "timestamp": datetime.now().isoformat()
            }
            ws.send(json.dumps(test_message))
            print(f"   📤 Sent test update message")

        try:
            ws = websocket.WebSocketApp(
                ws_url,
                on_open=on_open,
                on_message=on_message,
                on_error=on_error,
                on_close=on_close
            )
            
            # Run WebSocket in a separate thread
            ws_thread = threading.Thread(target=ws.run_forever)
            ws_thread.daemon = True
            ws_thread.start()
            
            # Wait for connection and messages
            time.sleep(duration)
            ws.close()
            
            # Check results
            if self.ws_connected and len(self.ws_messages) > 0:
                self.tests_passed += 1
                print(f"✅ WebSocket test passed - Received {len(self.ws_messages)} messages")
                return True
            else:
                print(f"❌ WebSocket test failed - Connected: {self.ws_connected}, Messages: {len(self.ws_messages)}")
                if self.ws_error:
                    print(f"   Error: {self.ws_error}")
                return False
                
        except Exception as e:
            print(f"❌ WebSocket test failed - Error: {str(e)}")
            return False

def main():
    print("=" * 60)
    print("🧪 TLDRAW MULTIPLAYER CANVAS - BACKEND API TESTS")
    print("=" * 60)
    
    tester = TldrawAPITester()
    
    # Test 1: Health Check
    tester.run_test(
        "Health Check",
        "GET",
        "api/health",
        200
    )
    
    # Test 2: Root Endpoint
    tester.run_test(
        "Root Endpoint",
        "GET",
        "",
        200
    )
    
    # Test 3: Get Snapshot (should create default if not exists)
    success, snapshot_data = tester.run_test(
        "Get Snapshot for 'default' room",
        "GET",
        "api/sync/rooms/default/snapshot",
        200
    )
    
    # Test 4: Apply/Save Snapshot
    if success:
        test_snapshot = {
            "snapshot": {
                "store": {
                    "test_shape_1": {
                        "id": "test_shape_1",
                        "type": "geo",
                        "x": 100,
                        "y": 100,
                        "props": {
                            "w": 200,
                            "h": 100,
                            "geo": "rectangle"
                        }
                    }
                },
                "schema": {
                    "schemaVersion": 2,
                    "sequences": {}
                }
            }
        }
        
        tester.run_test(
            "Apply/Save Snapshot",
            "POST",
            "api/sync/rooms/default/apply",
            200,
            data=test_snapshot
        )
        
        # Test 5: Verify snapshot was saved
        success2, new_snapshot = tester.run_test(
            "Verify Snapshot Persistence",
            "GET",
            "api/sync/rooms/default/snapshot",
            200
        )
        
        if success2:
            if "test_shape_1" in str(new_snapshot):
                print("   ✅ Snapshot persistence verified")
            else:
                print("   ⚠️  Snapshot may not have persisted correctly")
    
    # Test 6: WebSocket Connection
    tester.test_websocket("default", duration=5)
    
    # Print Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    print("=" * 60)
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
