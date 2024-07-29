# middleware.py

import logging
from django.db import connections
from django.db.utils import OperationalError
from django.http import HttpResponse

logger = logging.getLogger(__name__)

class DatabaseCheckMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        db_conn = connections['default']
        try:
            db_conn.cursor()
        except OperationalError as e:
            logger.error(f"Database connection error: {e}")
            return HttpResponse("Database connection error", status=503)
        
        response = self.get_response(request)
        return response