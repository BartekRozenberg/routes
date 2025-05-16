from django.contrib import admin
from .models import Route, Point, BackgroundImage, GameBoard, Path

@admin.register(GameBoard)
class GameBoardAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'rows', 'cols')  # Pola wyświetlane w liście
    search_fields = ('name', 'user__username')  # Pola, po których można wyszukiwać
    list_filter = ('user',)  # Filtry po użytkowniku
    ordering = ('name',)  # Domyślne sortowanie

@admin.register(Point)
class PointAdmin(admin.ModelAdmin):
    list_display = ('route', 'x', 'y', 'order')  # Pola wyświetlane w liście
    search_fields = ('route__name',)  # Wyszukiwanie po nazwie trasy
    list_filter = ('route',)  # Filtry po trasie
    ordering = ('route', 'order')  # Sortowanie po trasie i kolejności

@admin.register(Path)
class PathAdmin(admin.ModelAdmin):
    list_display = ('name', 'board', 'user', 'created_at')  # Dodano pole `name`
    search_fields = ('name', 'board__name', 'user__username')  # Dodano wyszukiwanie po nazwie
    list_filter = ('board', 'user')  # Filtry po planszy i użytkowniku
    ordering = ('created_at',)  # Domyślne sortowanie po dacie utworzenia

# Rejestracja istniejących modeli
admin.site.register(Route)
admin.site.register(BackgroundImage)