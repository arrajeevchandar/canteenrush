from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    username: str

class UserCreate(UserBase):
    password: str
    role: str # student, vendor

class User(UserBase):
    id: int
    role: str
    class Config:
        orm_mode = True

class MenuItemBase(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    prep_time_estimate: int # minutes

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    prep_time_estimate: Optional[int] = None
    is_available: Optional[bool] = None

class MenuItem(MenuItemBase):
    id: int
    vendor_id: int
    vendor_name: Optional[str] = None
    is_available: bool
    # To show vendor name, you might need a separate field or a nested Owner schema
    # simpler to just fetch it or include it if we do a join
    
    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    items: List[int] # List of menu_item_ids
    vendor_id: int

class OrderCreate(OrderBase):
    pass

class OrderStatusUpdate(BaseModel):
    status: str

class OrderItem(BaseModel):
    menu_item_id: int
    quantity: int
    menu_item: MenuItem  # Nested schema to show item details
    
    class Config:
        orm_mode = True

class Order(BaseModel):
    id: int
    user_id: int
    status: str
    total_price: float
    token_number: int
    queue_position: Optional[int] = None
    created_at: datetime
    predicted_pickup_time: datetime
    items: List[OrderItem] = [] # Include items in the response
    
    class Config:
        orm_mode = True
