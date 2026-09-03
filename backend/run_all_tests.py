import sys
import test_admin_flow
import test_address_cart_flow
import test_auth_flow
import test_notification_flow
import test_order_flow
import test_payment_flow
import test_restaurant_food_flow
import test_websocket_flow

TEST_MODULES = [
    ("Milestone 2: Authentication Foundation", test_auth_flow),
    ("Milestone 3: Restaurant & Food Management", test_restaurant_food_flow),
    ("Milestone 4: Address & Cart Management", test_address_cart_flow),
    ("Milestone 5: Orders & Checkout", test_order_flow),
    ("Milestone 6: Razorpay Payment System", test_payment_flow),
    ("Milestone 6: Notification Persistence & Events", test_notification_flow),
    ("Milestone 6: Admin Oversight & Analytics", test_admin_flow),
    ("Milestone 6: WebSockets & Real-Time Sync", test_websocket_flow),
]


def run_all():
    print("=" * 70)
    print("STARTING FULL REGRESSION TEST SUITE FOR ONLINE FOOD ORDERING BACKEND")
    print("=" * 70)

    passed = 0
    failed = 0

    for name, module in TEST_MODULES:
        print(f"\n>> RUNNING: {name} ...")
        try:
            module.run_tests()
            passed += 1
            print(f">> [PASSED] {name}")
        except Exception as e:
            failed += 1
            print(f">> [FAILED] {name}: {e}")

    print("\n" + "=" * 70)
    print(f"FULL REGRESSION SUITE RESULTS: {passed} PASSED, {failed} FAILED")
    print("=" * 70)

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    run_all()
