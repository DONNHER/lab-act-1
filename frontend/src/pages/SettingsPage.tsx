// Settings Page
import React, { useState } from 'react';
import { useAuth } from '../contexts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Bell, Shield, Save, Eye, EyeOff, AlertCircle, CheckCircle, X, LogOut } from 'lucide-react';
import { cn } from '../utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Switch } from '../components/ui/Switch';
import { Separator } from '../components/ui/Separator';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  gradeNotifications: z.boolean(),
  enrollmentNotifications: z.boolean(),
  announcementNotifications: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type NotificationFormValues = z.infer<typeof notificationSchema>;

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'security'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      gradeNotifications: true,
      enrollmentNotifications: true,
      announcementNotifications: true,
    },
  });

  const handleProfileSubmit = async (data: ProfileFormValues) => {
    try {
      setGlobalError(null);
      setGlobalSuccess(null);
      // TODO: Implement profile update API call
      // await usersApi.updateProfile(data);
      setGlobalSuccess('Profile updated successfully');
      await refreshUser();
    } catch (error) {
      setGlobalError('Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormValues) => {
    try {
      setGlobalError(null);
      setGlobalSuccess(null);
      // TODO: Implement password change API call
      // await authApi.changePassword(data);
      setGlobalSuccess('Password changed successfully');
      passwordForm.reset();
    } catch (error) {
      setGlobalError('Failed to change password');
    }
  };

  const handleNotificationSubmit = async (data: NotificationFormValues) => {
    try {
      setGlobalError(null);
      setGlobalSuccess(null);
      // TODO: Implement notification preferences API call
      // await usersApi.updateNotifications(data);
      setGlobalSuccess('Notification preferences updated');
    } catch (error) {
      setGlobalError('Failed to update notification preferences');
    }
  };

  const clearMessages = () => {
    setGlobalError(null);
    setGlobalSuccess(null);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
      </div>

      {globalError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{globalError}</p>
          <button onClick={clearMessages} className="ml-auto text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {globalSuccess && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700" role="alert">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{globalSuccess}</p>
          <button onClick={clearMessages} className="ml-auto text-green-500 hover:text-green-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="password">
            <Lock className="w-4 h-4 mr-2" />
            Password
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      {...profileForm.register('name')}
                      placeholder="Enter your name"
                      error={profileForm.formState.errors.name?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...profileForm.register('email')}
                      placeholder="Enter your email"
                      error={profileForm.formState.errors.email?.message}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={user?.role || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">Your role is assigned by the administrator and cannot be changed.</p>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="w-full sm:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...passwordForm.register('currentPassword')}
                      placeholder="Enter current password"
                      error={passwordForm.formState.errors.currentPassword?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      {...passwordForm.register('newPassword')}
                      placeholder="Enter new password"
                      error={passwordForm.formState.errors.newPassword?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">Must be at least 8 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...passwordForm.register('confirmPassword')}
                      placeholder="Confirm new password"
                      error={passwordForm.formState.errors.confirmPassword?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="w-full sm:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={notificationForm.handleSubmit(handleNotificationSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationForm.watch('emailNotifications')}
                      onCheckedChange={(checked) => notificationForm.setValue('emailNotifications', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Grade Notifications</p>
                      <p className="text-sm text-gray-500">Get notified when grades are published</p>
                    </div>
                    <Switch
                      checked={notificationForm.watch('gradeNotifications')}
                      onCheckedChange={(checked) => notificationForm.setValue('gradeNotifications', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Enrollment Notifications</p>
                      <p className="text-sm text-gray-500">Get notified about enrollment updates</p>
                    </div>
                    <Switch
                      checked={notificationForm.watch('enrollmentNotifications')}
                      onCheckedChange={(checked) => notificationForm.setValue('enrollmentNotifications', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Announcement Notifications</p>
                      <p className="text-sm text-gray-500">Get notified about system announcements</p>
                    </div>
                    <Switch
                      checked={notificationForm.watch('announcementNotifications')}
                      onCheckedChange={(checked) => notificationForm.setValue('announcementNotifications', checked)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="w-full sm:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" className="w-auto">
                    Enable 2FA
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Active Sessions</p>
                    <p className="text-sm text-gray-500">View and manage your active sessions</p>
                  </div>
                  <Button variant="outline" className="w-auto">
                    View Sessions
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-red-900">Deactivate Account</p>
                    <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" className="w-auto">
                    Deactivate
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-red-900">Logout</p>
                    <p className="text-sm text-red-700">Sign out of your account</p>
                  </div>
                  <Button variant="destructive" className="w-auto" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;