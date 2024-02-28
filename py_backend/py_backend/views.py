from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.template import loader

# def index(request):
# 	return render(request, "index.html")

def index(request):
    template = loader.get_template('index.html')
    return HttpResponse(template.render())

def homepage(request):
	return render(request, "homepage.html")


def pong(request):
    return render(request, "pong.html")


from django.core.files.storage import FileSystemStorage


def image_upload(request):
    if request.method == "POST" and request.FILES["image_file"]:
        image_file = request.FILES["image_file"]
        fs = FileSystemStorage()
        filename = fs.save(image_file.name, image_file)
        image_url = fs.url(filename)
        print(image_url)
    return render(request, "upload.html")