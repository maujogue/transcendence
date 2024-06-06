import os
import fileinput
import subprocess

def modify_file():
    file_path = 'py_backend/users/models.py'
    search_text = 'email_is_verified = models.BooleanField(default=False)'
    replace_text = 'email_is_verified = models.BooleanField(default=True)'
    modified = False

    # Check if the file already contains the replace_text
    with open(file_path, 'r') as file:
        file_content = file.read()
        if replace_text in file_content:
            print("The field is already set to True. No changes made.")
            return modified

    with fileinput.FileInput(file_path, inplace=True) as file:
        for line in file:
            if search_text in line:
                modified = True
            print(line.replace(search_text, replace_text), end='')
    
    return modified

def run_docker_command(command):
    try:
        subprocess.run(['docker', 'compose', 'exec', 'django_backend', 'bash', '-c', command], check=True, cwd='docker')
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while running the command: {e}")

def make_migrations():
    run_docker_command('python manage.py makemigrations')
    run_docker_command('python manage.py migrate')

def make_prod_re():
    try:
        subprocess.run(['make', 'prod_re'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while running make prod_re: {e}")

if __name__ == "__main__":
    modified = modify_file()
    if modified:
        make_migrations()
        make_prod_re()
