from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from . import views
from django.views.generic.base import TemplateView

urlpatterns = [
    # path('/*', redirect_view)
    # re_path(r'^.*$', TemplateView.as_view(template_name='tests/index.html'), name='index'),
    path("", views.index, name='index'),
    path("index", views.index, name='index'),
    path("homepage", views.homepage, name='homepage'),
	path("upload", views.image_upload, name="upload"),
	path("pong", views.pong, name="pong"),
    # path("sections/<int:num>", views.section, name='section'),
]

if bool(settings.DEBUG):
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)