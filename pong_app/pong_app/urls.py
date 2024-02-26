from django.contrib import admin
from django.urls import path, include     # <--  ADD THIS LINE

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path('', include('multiplayer.urls')),
	path('auth/', include("users.urls")),  # <--  ADD THIS LINE
]

