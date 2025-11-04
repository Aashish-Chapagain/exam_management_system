from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout

# # Create your views here.
# @login_required(login_url='admin_login')
# def dashboard_home(request):
#     # messages.success(request, "You have successfully logged in.")
#     return render(request, 'dashboard/dashboard.html')


# def logout_view(request):
#     logout(request)
#     return redirect('admin_login')


@login_required

def dashboard_home(request):
    logout(request)
    return render(request, 'dashboard/dashboard.html')