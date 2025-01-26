import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Camera, User, Mail, ArrowLeft } from 'lucide-react';

export function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url, username')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setAvatarUrl(data?.avatar_url || null);
          setUsername(data?.username || null);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        setError('Failed to upload image.');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        setError('Failed to update profile.');
        return;
      }

      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Error during avatar update:', error);
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <User className="h-6 w-6 mr-2" />
            Your Profile
          </h2>
          <button
            onClick={handleGoBack}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6 flex items-center justify-center">
          <div className="relative w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="User Avatar" className="object-cover w-full h-full" />
            ) : (
              <User className="h-16 w-16 text-blue-600" />
            )}
            <button
              onClick={handleAvatarClick}
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-20 flex items-center justify-center"
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Email:</span>
          </div>
          <p className="text-gray-900 ml-7">{user?.email}</p>
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Username:</span>
          </div>
          <p className="text-gray-900 ml-7">{username}</p>
        </div>
      </div>
    </div>
  );
}
