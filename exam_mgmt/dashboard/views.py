from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages


# def admin_login(request):
#     if request.method == "POST":
#         username = request.POST('username')
#         password = request.POST('password')

#         user = authenticate(request, username=username, password=password)

#         if user is not None:
#             login(request, user)
#             messages.success(request, "You have successfully logged in.")
#             return redirect('dashboard_home')
#         else:
#             messages.error(request, "Invalid username or password.")
#             return redirect('admin_login')

#     return render(request, 'dashboard/admin_login.html')

@login_required
def dashboard_home(request):
    messages.success(request,"Successfully logged in")
    return render(request, 'dashboard/dashboard.html')



def logout_view(request):
    logout(request)
    messages.success(request, "You have been logged out successfully.")
    return redirect('admin_login')



