from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Order, OrderItem, MenuItem, User
from app import schemas
from datetime import datetime
from app.core.security import get_current_user

router = APIRouter()

import random

@router.post("/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Calculate price and prediction
    total_price = 0.0
    items = []
    
    # Mock prediction for now
    predicted_time = datetime.utcnow() 
    
    # Generate Token
    token_number = random.randint(1000, 9999)
    # Ensure uniqueness loop could be added here but keeping simple for MVP

    db_order = Order(user_id=current_user.id,
                     vendor_id=order.vendor_id, 
                     total_price=total_price, 
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
    return db_order

@router.put("/{order_id}/status", response_model=schemas.Order)
def update_order_status(order_id: int, status_update: schemas.OrderStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    db_order.status = status_update.status
    db.commit()
    db.refresh(db_order)
    db.refresh(db_order)
    return db_order

@router.get("/by-token/{token_number}", response_model=schemas.Order)
def get_order_by_token(token_number: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    order = db.query(Order).filter(Order.token_number == token_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    return order

@router.get("/", response_model=List[schemas.Order])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orders = []
    if current_user.role == "student":
        orders = db.query(Order).filter(Order.user_id == current_user.id).offset(skip).limit(limit).all()
    elif current_user.role == "vendor":
        orders = db.query(Order).offset(skip).limit(limit).all()
    
    # Calculate queue position
    # This is inefficient for large datasets but fine for MVP
    active_orders = db.query(Order).filter(Order.status.in_(["ordered", "preparing"])).order_by(Order.id).all()
    active_ids = [o.id for o in active_orders]

    for order in orders:
        if order.status in ["ordered", "preparing"]:
            if order.id in active_ids:
                order.queue_position = active_ids.index(order.id) + 1
            else:
                order.queue_position = 0
        else:
            order.queue_position = 0
            
    return orders
