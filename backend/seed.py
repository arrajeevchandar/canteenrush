from app.core.database import SessionLocal, engine
from app.models.models import Base, MenuItem

def seed_data():
    db = SessionLocal()
    
    # Check if data exists
    if db.query(MenuItem).count() > 0:
        print("Data already exists.")
        return

    items = [
        MenuItem(name="Veg Burger", price=50.0, description="Classic veg burger", prep_time_estimate=10, vendor_id=1),
        MenuItem(name="Chicken Sandwich", price=80.0, description="Grilled chicken sandwich", prep_time_estimate=15, vendor_id=1),
        MenuItem(name="Masala Dosa", price=60.0, description="Crispy dosa with potato filling", prep_time_estimate=12, vendor_id=2),
        MenuItem(name="Coffee", price=20.0, description="Hot brewed coffee", prep_time_estimate=5, vendor_id=1),
        MenuItem(name="Fried Rice", price=90.0, description="Veg fried rice", prep_time_estimate=10, vendor_id=2),
    ]

    for item in items:
        db.add(item)
    
    db.commit()
    print("Seeded menu items.")
    db.close()

if __name__ == "__main__":
    seed_data()
