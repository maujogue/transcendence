from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
	# path("", views.index, name='index'),
    # path("index", views.index, name='index'),
    # path("homepage", views.homepage, name='homepage'),
	# path("upload", views.image_upload, name="upload"),
	# path("pong", views.pong, name="pong"),
    
    path('', include('multiplayer.urls')),
	path('users/', include('users.urls')),
    path('friends/', include('friends.urls')),
    path('', include('tournaments.urls'))
]

if bool(settings.DEBUG):
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)