import yaml
from ultralytics import YOLO
from pathlib import Path

def load_config(config_path):
    with open(config_path, 'r') as file:
        return yaml.safe_load(file)

def evaluate_model():
    config = load_config('ml/config/detector_config.yml')
    
    model = YOLO('ml/models/ingredient_detector.pt')
    
    data_config = {
        'path': Path(config['dataset']['path']).absolute(),
        'train': config['dataset']['train'],
        'val': config['dataset']['val'],
        'test': config['dataset']['test'],
        'nc': len(config['dataset']['classes']),
        'names': config['dataset']['classes']
    }
    
    with open('ml/runs/test_data.yaml', 'w') as f:
        yaml.dump(data_config, f)
    
    metrics = model.val(data='ml/runs/test_data.yaml', split='test')
    
    print(f"mAP50: {metrics.box.map50}")
    print(f"mAP50-95: {metrics.box.map}")
    print(f"Precision: {metrics.box.mp}")
    print(f"Recall: {metrics.box.mr}")

if __name__ == "__main__":
    evaluate_model()