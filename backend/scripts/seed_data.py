import sys
import os
from decimal import Decimal

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from app.config.database import SessionLocal, engine
from app.models.user import User, UserRole
from app.models.restaurant import Restaurant
from app.models.food_item import FoodItem
from app.models.address import Address
from app.security.password import hash_password


def clean_database(db):
    """Safely reset development tables before re-seeding."""
    print("Clearing existing development data...")
    db.execute(text("DELETE FROM notifications"))
    db.execute(text("DELETE FROM payments"))
    db.execute(text("DELETE FROM order_items"))
    db.execute(text("DELETE FROM orders"))
    db.execute(text("DELETE FROM cart_items"))
    db.execute(text("DELETE FROM carts"))
    db.execute(text("DELETE FROM food_items"))
    db.execute(text("DELETE FROM restaurants"))
    db.execute(text("DELETE FROM addresses"))
    db.execute(text("DELETE FROM users"))
    db.commit()
    print("[OK] Tables cleared.")


def seed_database():
    db = SessionLocal()
    try:
        clean_database(db)

        # ---------------------------------------------------------------------
        # 1. USERS (ADMIN, SELLERS, CUSTOMERS)
        # ---------------------------------------------------------------------
        print("\nSeeding Users...")
        default_pwd_hash = hash_password("password123")
        admin_pwd_hash = hash_password("adminpassword123")
        seller_pwd_hash = hash_password("sellerpassword123")
        customer_pwd_hash = hash_password("customerpassword123")

        # Admin
        admin = User(
            name="Platform SuperAdmin",
            email="admin@foodplatform.com",
            password_hash=admin_pwd_hash,
            role=UserRole.ADMIN,
            is_verified=True,
            is_active=True,
        )
        db.add(admin)

        # 10 Sellers (one for each restaurant)
        sellers_data = [
            ("Chef Mario Rossi", "seller.mario@quickbite.com"),
            ("Priya Sharma", "seller.priya@quickbite.com"),
            ("Kabir Khan", "seller.kabir@quickbite.com"),
            ("Anita Rathore", "seller.anita@quickbite.com"),
            ("Vikram Meena", "seller.vikram@quickbite.com"),
            ("Sneha Patel", "seller.sneha@quickbite.com"),
            ("Rohit Verma", "seller.rohit@quickbite.com"),
            ("Arjun Mathur", "seller.arjun@quickbite.com"),
            ("Meera Joshi", "seller.meera@quickbite.com"),
            ("Farhan Qureshi", "seller.farhan@quickbite.com"),
        ]

        sellers = []
        for name, email in sellers_data:
            s = User(
                name=name,
                email=email,
                password_hash=seller_pwd_hash,
                role=UserRole.SELLER,
                is_verified=True,
                is_active=True,
            )
            db.add(s)
            sellers.append(s)

        # 3 Customers
        customer_rahul = User(
            name="Rahul Sharma",
            email="rahul.sharma@example.com",
            password_hash=customer_pwd_hash,
            role=UserRole.USER,
            is_verified=True,
            is_active=True,
        )
        customer_ananya = User(
            name="Ananya Verma",
            email="ananya.verma@example.com",
            password_hash=customer_pwd_hash,
            role=UserRole.USER,
            is_verified=True,
            is_active=True,
        )
        customer_deepak = User(
            name="Deepak Gupta",
            email="deepak.gupta@example.com",
            password_hash=customer_pwd_hash,
            role=UserRole.USER,
            is_verified=True,
            is_active=True,
        )
        db.add_all([customer_rahul, customer_ananya, customer_deepak])
        db.commit()

        print(f"[OK] Seeded 1 Admin, {len(sellers)} Sellers, and 3 Customers.")

        # ---------------------------------------------------------------------
        # 2. CUSTOMER ADDRESSES
        # ---------------------------------------------------------------------
        print("\nSeeding Delivery Addresses...")
        addr1 = Address(
            user_id=customer_rahul.id,
            label="Home",
            address_line="Flat 402, Royal Palms, Malviya Nagar",
            city="Jaipur",
            state="Rajasthan",
            pincode="302017",
            latitude=26.8549,
            longitude=75.8243,
            is_default=True,
        )
        addr2 = Address(
            user_id=customer_rahul.id,
            label="Office",
            address_line="Tower B, World Trade Park, JLN Marg",
            city="Jaipur",
            state="Rajasthan",
            pincode="302017",
            latitude=26.8532,
            longitude=75.8052,
            is_default=False,
        )
        addr3 = Address(
            user_id=customer_ananya.id,
            label="Home",
            address_line="12, Sardar Patel Marg, C-Scheme",
            city="Jaipur",
            state="Rajasthan",
            pincode="302001",
            latitude=26.9124,
            longitude=75.8016,
            is_default=True,
        )
        db.add_all([addr1, addr2, addr3])
        db.commit()
        print("[OK] Seeded customer delivery addresses.")

        # ---------------------------------------------------------------------
        # 3. RESTAURANTS & FOOD ITEMS
        # ---------------------------------------------------------------------
        print("\nSeeding Restaurants and Menus...")

        restaurants_payload = [
            {
                "seller_idx": 0,
                "name": "The Pizza House",
                "description": "Authentic stone-baked artisanal pizzas, garlic bread, and classic Italian pasta.",
                "address": "45 C-Scheme, Ashok Nagar, Jaipur",
                "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
                "is_verified": True,
                "is_open": True,
                "foods": [
                    {
                        "name": "Margherita Classic Pizza",
                        "category": "Pizza",
                        "price": Decimal("249.00"),
                        "description": "San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil, and olive oil.",
                        "image_url": "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Paneer Tikka Woodfired Pizza",
                        "category": "Pizza",
                        "price": Decimal("329.00"),
                        "description": "Tandoori spiced paneer cubes, crisp bell peppers, red onions, and gooey mozzarella.",
                        "image_url": "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Farmhouse Veggie Overload",
                        "category": "Pizza",
                        "price": Decimal("299.00"),
                        "description": "Loaded with mushrooms, sweet corn, black olives, jalapenos, and tomatoes.",
                        "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Cheesy Stuffed Garlic Bread",
                        "category": "Sides",
                        "price": Decimal("149.00"),
                        "description": "Freshly baked garlic baguette stuffed with melted mozzarella and herbs.",
                        "image_url": "https://images.unsplash.com/photo-1619895092538-128341789043?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Creamy Alfredo Pasta",
                        "category": "Pasta",
                        "price": Decimal("229.00"),
                        "description": "Penne tossed in rich parmesan white sauce with sauteed broccoli and herbs.",
                        "image_url": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Choco Lava Cake",
                        "category": "Dessert",
                        "price": Decimal("119.00"),
                        "description": "Warm chocolate cake with a molten chocolate fudge center.",
                        "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                ],
            },
            {
                "seller_idx": 1,
                "name": "Urban Tandoor",
                "description": "Rich North Indian curries, tandoori breads, and royal charcoal-grilled delicacies.",
                "address": "Plot 18, Calgiri Marg, Malviya Nagar, Jaipur",
                "image_url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
                "is_verified": True,
                "is_open": True,
                "foods": [
                    {
                        "name": "Paneer Butter Masala",
                        "category": "Curry",
                        "price": Decimal("279.00"),
                        "description": "Cottage cheese simmered in a velvety tomato, cashew, and butter gravy.",
                        "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Dal Makhani Amritsari",
                        "category": "Curry",
                        "price": Decimal("239.00"),
                        "description": "Slow-cooked black lentils simmered overnight with cream, butter, and spices.",
                        "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Butter Naan (2 Pcs)",
                        "category": "Breads",
                        "price": Decimal("79.00"),
                        "description": "Soft leavened clay oven bread brushed generously with pure butter.",
                        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Tandoori Garlic Roti",
                        "category": "Breads",
                        "price": Decimal("59.00"),
                        "description": "Crisp whole-wheat flatbread topped with toasted garlic and coriander.",
                        "image_url": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Jeera Rice Bowl",
                        "category": "Rice",
                        "price": Decimal("139.00"),
                        "description": "Long-grain basmati rice tempered with aromatic roasted cumin seeds and ghee.",
                        "image_url": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Gulab Jamun (2 Pcs)",
                        "category": "Dessert",
                        "price": Decimal("89.00"),
                        "description": "Warm golden milk-solid dumplings soaked in fragrant cardamom syrup.",
                        "image_url": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                ],
            },
            {
                "seller_idx": 2,
                "name": "Burger Junction",
                "description": "Gourmet smash burgers, loaded peri-peri fries, and thick American milkshakes.",
                "address": "Queens Road, Vaishali Nagar, Jaipur",
                "image_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80",
                "is_verified": True,
                "is_open": True,
                "foods": [
                    {
                        "name": "Crispy Paneer Supreme Burger",
                        "category": "Burger",
                        "price": Decimal("179.00"),
                        "description": "Crispy fried spiced paneer patty with chipotle mayo, fresh lettuce, and tomatoes.",
                        "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Double Cheese Aloo Tikki Burger",
                        "category": "Burger",
                        "price": Decimal("129.00"),
                        "description": "Spiced golden potato patty layered with cheddar cheese slice and herb mayo.",
                        "image_url": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Peri Peri Crinkle Fries",
                        "category": "Sides",
                        "price": Decimal("109.00"),
                        "description": "Golden crispy potato fries tossed in zesty African peri peri seasoning.",
                        "image_url": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Cheesy Nachos Platter",
                        "category": "Sides",
                        "price": Decimal("159.00"),
                        "description": "Tortilla chips loaded with warm cheese sauce, salsa, and jalapenos.",
                        "image_url": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Belgian Chocolate Milkshake",
                        "category": "Beverages",
                        "price": Decimal("149.00"),
                        "description": "Thick milkshake blended with rich Belgian cocoa and dark chocolate chips.",
                        "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                ],
            },
            {
                "seller_idx": 3,
                "name": "Royal Biryani Bazaar",
                "description": "Fragrant dum biryanis, aromatic kebabs, and traditional Mughlai feast.",
                "address": "MI Road, Near Panch Batti, Jaipur",
                "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
                "is_verified": True,
                "is_open": True,
                "foods": [
                    {
                        "name": "Royal Veg Dum Biryani Handi",
                        "category": "Biryani",
                        "price": Decimal("269.00"),
                        "description": "Seasonal garden vegetables and paneer slow-cooked with basmati rice in a sealed handi.",
                        "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Paneer Tikka Biryani",
                        "category": "Biryani",
                        "price": Decimal("299.00"),
                        "description": "Charcoal-smoked tandoori paneer layered with saffron-infused basmati rice.",
                        "image_url": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Hara Bhara Kebab (6 Pcs)",
                        "category": "Starters",
                        "price": Decimal("189.00"),
                        "description": "Pan-seared spinach and green pea patties filled with spiced cottage cheese.",
                        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Burani Garlic Raita",
                        "category": "Sides",
                        "price": Decimal("69.00"),
                        "description": "Thick curd whisked with roasted garlic, roasted cumin, and black salt.",
                        "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Shahi Phirni",
                        "category": "Dessert",
                        "price": Decimal("99.00"),
                        "description": "Traditional slow-cooked ground rice pudding flavored with saffron and pistachios in clay matka.",
                        "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                ],
            },
            {
                "seller_idx": 4,
                "name": "Dosa Corner & South Street",
                "description": "Crisp golden dosas, fluffy idlis, vada sambar, and authentic filter coffee.",
                "address": "Lane 4, Raja Park, Jaipur",
                "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80",
                "is_verified": True,
                "is_open": True,
                "foods": [
                    {
                        "name": "Mysore Masala Dosa",
                        "category": "Dosa",
                        "price": Decimal("169.00"),
                        "description": "Crisp crepe smeared with spicy red chutney and filled with seasoned potato masala.",
                        "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Butter Ghee Roast Dosa",
                        "category": "Dosa",
                        "price": Decimal("189.00"),
                        "description": "Paper-thin crepe roasted with aromatic desi ghee, served with coconut chutney and sambar.",
                        "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Steamed Idli & Medu Vada Combo",
                        "category": "South Indian",
                        "price": Decimal("129.00"),
                        "description": "Two melt-in-mouth steamed idlis and one crispy lentil donut with piping hot sambar.",
                        "image_url": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Onion Uttapam",
                        "category": "South Indian",
                        "price": Decimal("149.00"),
                        "description": "Thick fermented rice pancake topped with caramelized onions and green chilies.",
                        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Traditional South Filter Coffee",
                        "category": "Beverages",
                        "price": Decimal("59.00"),
                        "description": "Authentic freshly brewed chicory coffee frothed in traditional brass tumbler.",
                        "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                ],
            },
            {
                "seller_idx": 5,
                "name": "Dragon Wok Pan-Asian",
                "description": "Wok-tossed noodles, spicy momos, fried rice, and savory Manchurian bowls.",
                "address": "Near Gandhi Nagar Station, Tonk Road, Jaipur",
                "image_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80",
                "is_verified": True,
                "is_open": True,
                "foods": [
                    {
                        "name": "Chilli Garlic Hakka Noodles",
                        "category": "Noodles",
                        "price": Decimal("189.00"),
                        "description": "Wok-tossed wheat noodles with crunchy peppers, spring onion, and smoky red chili garlic paste.",
                        "image_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Steamed Veg Himalayan Momos (8 Pcs)",
                        "category": "Momos",
                        "price": Decimal("139.00"),
                        "description": "Handmade dumplings stuffed with minced vegetables and herbs, served with fiery tomato dip.",
                        "image_url": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Crispy Veg Spring Rolls",
                        "category": "Starters",
                        "price": Decimal("149.00"),
                        "description": "Golden fried rolls filled with cabbage, carrots, and glass noodles with sweet chili dip.",
                        "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Veg Manchurian in Gravy",
                        "category": "Mains",
                        "price": Decimal("199.00"),
                        "description": "Crispy vegetable balls tossed in savory soy, ginger, and garlic sauce.",
                        "image_url": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Schezwan Fried Rice",
                        "category": "Rice",
                        "price": Decimal("179.00"),
                        "description": "Spicy stir-fried basmati rice with scallions, carrots, and authentic Schezwan peppers.",
                        "image_url": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                ],
            },
            {
                "seller_idx": 6,
                "name": "Green Bowl Organics",
                "description": "Nutrient-rich salads, superfood quinoa bowls, cold-pressed juices, and healthy wraps.",
                "address": "Sector 3, Mansarovar, Jaipur",
                "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
                "is_verified": True,
                "is_open": True,
                "foods": [
                    {
                        "name": "Avocado & Quinoa Power Bowl",
                        "category": "Salad",
                        "price": Decimal("269.00"),
                        "description": "Organic red quinoa, fresh Hass avocado, cherry tomatoes, baby spinach, and lemon tahini dressing.",
                        "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Mediterranean Hummus & Falafel Wrap",
                        "category": "Wraps",
                        "price": Decimal("199.00"),
                        "description": "Baked chickpea falafels with velvety garlic hummus, pickled cucumbers in whole-wheat tortilla.",
                        "image_url": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Greek Feta & Walnut Salad",
                        "category": "Salad",
                        "price": Decimal("229.00"),
                        "description": "Crunchy cucumbers, Kalamata olives, diced feta cheese, walnuts, and extra virgin olive oil.",
                        "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Green Detox Cold-Pressed Juice",
                        "category": "Juices",
                        "price": Decimal("129.00"),
                        "description": "Fresh cold-pressed cucumber, green apple, celery, mint, and ginger.",
                        "image_url": "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                ],
            },
            {
                "seller_idx": 7,
                "name": "Sweet Tooth Artisan Bakery",
                "description": "Freshly baked cheesecakes, tiramisu, sourdough breads, and artisanal pastries.",
                "address": "Station Road, Bani Park, Jaipur",
                "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
                "is_verified": True,
                "is_open": False,  # Verified but currently closed for order acceptance test
                "foods": [
                    {
                        "name": "New York Baked Cheesecake",
                        "category": "Cakes",
                        "price": Decimal("219.00"),
                        "description": "Classic dense and creamy cheesecake on a buttery graham cracker crust with blueberry compote.",
                        "image_url": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Classic Italian Tiramisu Cup",
                        "category": "Desserts",
                        "price": Decimal("189.00"),
                        "description": "Espresso-soaked savoiardi ladyfingers layered with rich mascarpone cream and cocoa dusting.",
                        "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Belgian Dark Chocolate Fudge Brownie",
                        "category": "Brownies",
                        "price": Decimal("129.00"),
                        "description": "Fudgy, gooey dark chocolate brownie loaded with roasted walnuts.",
                        "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Red Velvet Cupcake (2 Pcs)",
                        "category": "Cupcakes",
                        "price": Decimal("149.00"),
                        "description": "Moist cocoa buttermilk cupcakes crowned with smooth cream cheese swirl.",
                        "image_url": "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                ],
            },
            {
                "seller_idx": 8,
                "name": "Jaipur Chai & Street Bites",
                "description": "Kulhad masala chai, pyaaz kachori, samosas, and savory evening teatime snacks.",
                "address": "Bapu Nagar, Near JLN Marg, Jaipur",
                "image_url": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80",
                "is_verified": True,
                "is_open": True,
                "foods": [
                    {
                        "name": "Special Kulhad Masala Chai (2 Cups)",
                        "category": "Tea",
                        "price": Decimal("69.00"),
                        "description": "Cardamom and ginger infused milk tea served piping hot in traditional terracotta cups.",
                        "image_url": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Jaipuri Pyaaz Kachori (2 Pcs)",
                        "category": "Snacks",
                        "price": Decimal("79.00"),
                        "description": "Flaky golden pastry puffed and stuffed with spicy caramelized onion masala with tamarind chutney.",
                        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Paneer Bread Pakoda (2 Pcs)",
                        "category": "Snacks",
                        "price": Decimal("89.00"),
                        "description": "Spiced cottage cheese stuffed bread fritters coated in gram flour batter and deep fried.",
                        "image_url": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Bun Maska with Jam",
                        "category": "Snacks",
                        "price": Decimal("59.00"),
                        "description": "Toasted soft bakery bun slathered with salted butter and mixed fruit jam.",
                        "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                ],
            },
            {
                "seller_idx": 9,
                "name": "Haveli Spice Kitchen",
                "description": "Authentic Rajasthani dal baati churma, gatte ki sabzi, and heritage delicacies.",
                "address": "Amer Fort Road, Jaipur",
                "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80",
                "is_verified": False,  # Pending / Unverified test case
                "is_open": False,
                "foods": [
                    {
                        "name": "Royal Dal Baati Churma Thali",
                        "category": "Thali",
                        "price": Decimal("349.00"),
                        "description": "Crispy wheat baatis dipped in pure desi ghee, served with panchmel dal, sweet churma, and garlic chutney.",
                        "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Rajasthani Gatte Ki Sabzi",
                        "category": "Curry",
                        "price": Decimal("219.00"),
                        "description": "Steamed gram flour dumplings simmered in a spiced yogurt-based curry.",
                        "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                    {
                        "name": "Ker Sangri Heritage Special",
                        "category": "Curry",
                        "price": Decimal("299.00"),
                        "description": "Traditional desert bean and dried berry delicacy cooked with dry red chilies and amchur.",
                        "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
                        "is_available": True,
                    },
                ],
            },
        ]

        total_food_count = 0
        for rest_info in restaurants_payload:
            seller_obj = sellers[rest_info["seller_idx"]]
            r = Restaurant(
                seller_id=seller_obj.id,
                name=rest_info["name"],
                description=rest_info["description"],
                address=rest_info["address"],
                image_url=rest_info["image_url"],
                is_verified=rest_info["is_verified"],
                is_open=rest_info["is_open"],
            )
            db.add(r)
            db.flush()

            for food_data in rest_info["foods"]:
                f = FoodItem(
                    restaurant_id=r.id,
                    name=food_data["name"],
                    category=food_data["category"],
                    price=food_data["price"],
                    description=food_data["description"],
                    image_url=food_data["image_url"],
                    is_available=food_data["is_available"],
                )
                db.add(f)
                total_food_count += 1

        db.commit()
        print(f"[OK] Seeded {len(restaurants_payload)} Restaurants and {total_food_count} Food Items.")

        print("\n=======================================================")
        print("DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("=======================================================")
        print(f"Total Users:        {1 + len(sellers) + 3}")
        print(f"  - Admin:          admin@foodplatform.com (password: adminpassword123)")
        print(f"  - Sellers (10):   seller.mario@quickbite.com ... (password: sellerpassword123)")
        print(f"  - Customers (3):  rahul.sharma@example.com ... (password: customerpassword123)")
        print(f"Total Restaurants:  {len(restaurants_payload)} (8 open/verified, 1 closed/verified, 1 unverified)")
        print(f"Total Food Items:   {total_food_count}")
        print("=======================================================\n")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error while seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
