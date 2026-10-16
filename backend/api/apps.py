import os
import sys
import threading

from django.apps import AppConfig


class ApiConfig(AppConfig):
    name = 'api'

    def ready(self):
        # Warm the response cache once per server process (not for migrate/shell/etc.,
        # and not in the autoreloader's parent process).
        argv = sys.argv
        is_runserver = 'runserver' in argv
        is_wsgi_server = not argv[0].endswith('manage.py') and 'pytest' not in argv[0]
        if (is_runserver and os.environ.get('RUN_MAIN') == 'true') or (is_wsgi_server and not is_runserver):
            from .views import warm_cache
            threading.Thread(target=warm_cache, daemon=True).start()
