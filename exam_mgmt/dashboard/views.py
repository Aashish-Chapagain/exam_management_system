from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
# Create your views here.
@login_required(login_url='/login/')
def dashboard_home(request):
    return render(request, 'dashboard/dashboard.html')


def logout_view(request):
    logout(request)
    return redirect('/login/')