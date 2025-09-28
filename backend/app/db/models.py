from sqlalchemy import Boolean, Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    
    gender = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    height_cm = Column(Float, nullable=True)
    current_weight_kg = Column(Float, nullable=True)
    target_weight_kg = Column(Float, nullable=True)
    goal = Column(String, nullable=True)
    activity_level = Column(String, default='moderate')
    
    bmr = Column(Float, nullable=True)
    tdee = Column(Float, nullable=True)
    target_calories = Column(Float, nullable=True)
    target_protein_g = Column(Float, nullable=True)
    target_carbs_g = Column(Float, nullable=True)
    target_fats_g = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    detection_logs = relationship("DetectionLog", back_populates="user")

class Recipe(Base):
    __tablename__ = "recipes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text)
    instructions = Column(Text)
    prep_time_minutes = Column(Integer)
    cook_time_minutes = Column(Integer)
    servings = Column(Integer, default=1)
    
    calories_per_serving = Column(Float)
    protein_g = Column(Float)
    carbs_g = Column(Float)
    fats_g = Column(Float)
    fiber_g = Column(Float, default=0)
    sugar_g = Column(Float, default=0)
    
    ingredients = Column(Text)
    tags = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DetectionLog(Base):
    __tablename__ = "detection_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    detected_ingredients = Column(Text)
    confidence_scores = Column(Text) 
    image_path = Column(String, nullable=True)
    
    recommended_recipe_ids = Column(Text) 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="detection_logs")