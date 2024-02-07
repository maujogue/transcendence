from django.contrib import admin
from django.urls import path, include     # <--  ADD THIS LINE

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('singlepage.urls')),   # <--  ADD THIS LINE
]

