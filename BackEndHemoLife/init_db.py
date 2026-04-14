#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, SessionLocal
from app.models.models import Base, User, Estoque, TipoSanguineo
from app.core.auth.auth import get_password_hash

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Create a session
    db = SessionLocal()

    try:
        # Create default admin user
        admin_email = "admin@hemolife.com"
        admin_password = "admin123"  # Short password for bcrypt compatibility

        existing_user = db.query(User).filter(User.email == admin_email).first()
        if not existing_user:
            hashed_password = get_password_hash(admin_password)
            admin_user = User(
                email=admin_email,
                hashed_password=hashed_password,
                is_active=True
            )
            db.add(admin_user)
            print(f"Created admin user: {admin_email} (password: {admin_password})")

        # Initialize blood inventory for all blood types
        for tipo in TipoSanguineo:
            existing_estoque = db.query(Estoque).filter(Estoque.tipo_sanguineo == tipo).first()
            if not existing_estoque:
                estoque = Estoque(
                    tipo_sanguineo=tipo,
                    quantidade_ml=0.0
                )
                db.add(estoque)
                print(f"Initialized inventory for blood type: {tipo.value}")

        db.commit()
        print("Database initialized successfully!")

    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()