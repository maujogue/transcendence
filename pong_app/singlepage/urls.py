from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    # path("", views.index, name='index'),
	path("", views.image_upload, name="upload"),
    # path("sections/<int:num>", views.section, name='section'),
]

if bool(settings.DEBUG):
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)