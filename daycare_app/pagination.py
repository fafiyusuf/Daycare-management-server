from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import NotFound  # added

class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination for the application.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    # Gracefully handle out-of-range pages instead of raising 404
    def paginate_queryset(self, queryset, request, view=None):
        try:
            return super().paginate_queryset(queryset, request, view)
        except NotFound:
            page_size = self.get_page_size(request)
            if page_size is None:
                return None

            paginator = self.django_paginator_class(queryset, page_size)

            if paginator.count == 0:
                # Emulate an empty page to keep response shape consistent
                class _EmptyPage:
                    def __init__(self, paginator):
                        self.paginator = paginator
                        self.object_list = []
                    def has_next(self): return False
                    def has_previous(self): return False
                    def next_page_number(self): return None
                    def previous_page_number(self): return None
                    @property
                    def number(self): return 1
                    def __iter__(self): return iter(self.object_list)

                self.page = _EmptyPage(paginator)
                self.request = request
                return []

            # Clamp to last available page
            self.page = paginator.page(paginator.num_pages)
            self.request = request
            return list(self.page)
