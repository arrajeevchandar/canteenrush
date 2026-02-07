from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Order, OrderItem, MenuItem, User
from app import schemas
from datetime import datetime
from app.core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Calculate price and prediction
    total_price = 0.0
    items = []
    
    # Simple token generation (should be more robust in production)
    token_number = int(datetime.utcnow().timestamp() % 10000)
    
    # Mock prediction for now (e.g., current time + 15 mins)
    predicted_time = datetime.utcnow() 
    
    db_order = Order(user_id=current_user.id,
                     vendor_id=order.vendor_id, 
                     total_price=0.0, 
                     predicted_pickup_time=predicted_time,
                     status="ordered",
                     token_number=token_number)
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Add items
    for item_id in order.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
        if menu_item:
           db_item = OrderItem(order_id=db_order.id, menu_item_id=item_id, quantity=1)
           db.add(db_item)
           total_price += menu_item.price
    
    db_order.total_price = total_price
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/", response_model=List[schemas.Order])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "student":
        return db.query(Order).filter(Order.user_id == current_user.id).offset(skip).limit(limit).all()
    elif current_user.role == "vendor":
        return db.query(Order).offset(skip).limit(limit).all()
    return []

@router.put("/{order_id}/status", response_model=schemas.Order)
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Only vendors can update order status")
    
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db_order.status = status
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/token/{token}", response_model=schemas.Order)
def fetch_order_by_token(token: int, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.token_number == token).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order
