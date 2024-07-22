from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', include('multiplayer.urls')),
	path('users/', include('users.urls')),
    path('friends/', include('friends.urls')),
    path('stats/', include('stats.urls')),
    path('tournament/', include('tournaments.urls')),
    path('auth42/', include('auth42.urls'))
]

if bool(settings.DEBUG):
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)