import os
import yaml
from ultralytics import YOLO
from pathlib import Path

def load_config(config_path):
    with open(config_path, 'r') as file:
        return yaml.safe_load(file)

def train_model():
    config = load_config('ml/config/detector_config.yml')
    
    data_config = {
        'path': os.path.abspath(config['dataset']['path']),
        'train': config['dataset']['train'],
        'val': config['dataset']['val'],
        'test': config['dataset']['test'],
        'nc': len(config['dataset']['classes']),
        'names': config['dataset']['classes']
    }
    
    os.makedirs('ml/runs', exist_ok=True)
    with open('ml/runs/data.yaml', 'w') as f:
        yaml.dump(data_config, f)
    
    model = YOLO(config['model']['weights'])
    
    results = model.train(
        data='ml/runs/data.yaml',
        epochs=config['training']['epochs'],
        batch=config['training']['batch_size'],
        lr0=config['training']['learning_rate'],
        optimizer=config['training']['optimizer'],
        patience=config['training']['patience'],
        project='ml/runs',
        name='ingredient_detector',
        exist_ok=True,
        save_period=10
    )
    
    model.save('ml/models/ingredient_detector.pt')
    print("Training completed! Model saved to ml/models/ingredient_detector.pt")

if __name__ == "__main__":
    train_model()