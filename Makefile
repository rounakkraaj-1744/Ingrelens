.PHONY: up frontend backend

up:
	@echo "Starting frontend and backend together..."
	@$(MAKE) -j2 frontend backend

frontend:
	@echo "Starting frontend..."
	cd frontend && npm start

backend:
	@echo "Starting backend..."
	cd backend && venv/bin/uvicorn app.main:app --reload
