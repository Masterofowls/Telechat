import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../hooks/useTheme';

const Settings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="space-y-6">
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Profile</h3>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Username</p>
            <p className="font-medium">{user?.username}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
          <div className="mt-4">
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
