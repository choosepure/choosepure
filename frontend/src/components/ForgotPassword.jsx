import React, { useState } from 'react';
import { X, Mail, Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { passwordResetAPI } from '../services/api';
import { toast } from '../hooks/use-toast';

const ForgotPassword = ({ onClose, onBackToLogin }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Step 1: Request Reset Code
  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await passwordResetAPI.requestReset(email);
      
      // Store the token for demo purposes (in production, this comes via email)
      if (response.data.reset_token) {
        setResetToken(response.data.reset_token);
      }
      
      toast({
        title: 'Code Sent!',
        description: 'Check your email for the 6-digit reset code',
      });
      
      setStep(2);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to send reset code',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter the 6-digit code',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await passwordResetAPI.verifyToken(email, otp);
      
      toast({
        title: 'Code Verified!',
        description: 'Now set your new password',
      });
      
      setStep(3);
    } catch (error) {
      toast({
        title: 'Invalid Code',
        description: error.response?.data?.detail || 'The code is invalid or expired',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await passwordResetAPI.resetPassword(email, otp, newPassword);
      
      toast({
        title: 'Success!',
        description: 'Your password has been reset',
      });
      
      setStep(4);
      
      // Auto close and return to login after 2 seconds
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to reset password',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {step > 1 && step < 4 && (
              <button
                onClick={() => setStep(step - 1)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 1 && 'Forgot Password'}
              {step === 2 && 'Enter Reset Code'}
              {step === 3 && 'New Password'}
              {step === 4 && 'Success!'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Mail className="text-green-600" size={32} />
              </div>
              <p className="text-gray-600">
                Enter your email address and we'll send you a code to reset your password
              </p>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            {resetToken && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <p className="font-semibold text-yellow-800 mb-1">Demo Mode:</p>
                <p className="text-yellow-700">Your reset code is: <span className="font-mono font-bold">{resetToken}</span></p>
                <p className="text-yellow-600 text-xs mt-1">In production, this would be sent via email</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Code'
              )}
            </Button>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>
            </div>

            <div>
              <Label htmlFor="otp">Reset Code</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            <button
              type="button"
              onClick={handleRequestReset}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
            >
              Resend Code
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Lock className="text-green-600" size={32} />
              </div>
              <p className="text-gray-600">
                Create a strong password for your account
              </p>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h3>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            <Button
              onClick={onBackToLogin}
              className="bg-green-600 hover:bg-green-700"
            >
              Go to Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
