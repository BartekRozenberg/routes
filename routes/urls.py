from django.urls import path
from django.views.generic.base import RedirectView
from . import views
from rest_framework import permissions
from django.contrib.auth import views as auth_views
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.authtoken.views import obtain_auth_token
from django.conf.urls import include

schema_view = get_schema_view(
    openapi.Info(
      title="Route Editor API",
      default_version='v1',
    ),
    public=False,
    authentication_classes=[SessionAuthentication, BasicAuthentication],
)

urlpatterns = [
    path('', views.index, name='index'),
    path('routes/', views.route_list, name='route_list'),
    path('routes/create_board/', views.create_or_edit_board, name='create_or_edit_board'),
    path('routes/edit_board/<int:board_id>/', views.create_or_edit_board, name='edit_board'),
    path('routes/create_route/', views.create_route, name='create_route'),
    path('routes/<int:route_id>/', views.route_detail, name='route_detail'),
    path('routes/<int:route_id>/delete_point/<int:point_id>/', views.delete_point, name='delete_point'),
    path('routes/<int:board_id>/delete_board/', views.delete_board, name='delete_board'),  # Usuń planszę
    path('routes/<int:route_id>/delete_route/', views.delete_route, name='delete_route'),  # Usuń trasę
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('accounts/login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('accounts/register/', views.register, name='register'),
]