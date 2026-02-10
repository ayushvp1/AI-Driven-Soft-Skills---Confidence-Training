import os
import zipfile

def zip_project(output_filename):
    # Directories to exclude
    exclude_dirs = {'.git', '.venv', 'venv', '__pycache__', 'instance', 'uploads', '.gemini', '.agent', 'dist', '.vscode', '.idea'}
    # Files to exclude
    exclude_files = {'.env', 'AI_Soft_Skills_Project.zip', 'create_zip.py', 'app.db'}
    
    print(f"Creating {output_filename}...")
    
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file in exclude_files:
                    continue
                if file.endswith('.pyc'):
                    continue
                if file.endswith('.DS_Store'):
                    continue
                    
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, '.')
                
                try:
                    zipf.write(file_path, arcname)
                except Exception as e:
                    print(f"Skipping {file_path}: {e}")

if __name__ == "__main__":
    zip_project("AI_Soft_Skills_Project.zip")
    print("Zip created successfully!")
