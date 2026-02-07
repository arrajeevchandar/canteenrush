from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import MenuItem, User
from app import schemas
from app.core.security import get_current_user  # Need to implement this dependency

router = APIRouter()

@router.get("/", response_model=List[schemas.MenuItem])
def read_menu_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Join MenuItem with User to get vendor name
    results = db.query(MenuItem, User).join(User, MenuItem.vendor_id == User.id).offset(skip).limit(limit).all()
    
    items = []
    for menu_item, user in results:
        item_dict = menu_item.__dict__
        item_dict["vendor_name"] = user.username
        items.append(item_dict)
    return items

@router.post("/", response_model=schemas.MenuItem)
def create_menu_item(item: schemas.MenuItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Only vendors can add menu items")
    
    db_item = MenuItem(**item.dict(), vendor_id=current_user.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
