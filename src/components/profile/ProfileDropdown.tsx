import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User,
  Settings,
  ChevronDown,
  Camera
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching avatar:', error);
        } else {
          setAvatarUrl(data?.avatar_url || null);
        }
      }
    };

    fetchAvatar();
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('Uploading file:', file.name, 'to:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return;
      }

      console.log('File uploaded successfully');

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return;
      }

      console.log('Profile updated successfully');
      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Error during avatar update:', error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="relative w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="User Avatar" className="object-cover w-full h-full" />
          ) : (
            <User className="h-5 w-5 text-blue-600" />
          )}
          <button
            onClick={handleAvatarClick}
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-20 flex items-center justify-center"
          >
            <Camera className="h-4 w-4 text-white" />
          </button>
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">
            {user?.email?.split('@')[0]}
          </div>
          <div className="text-xs text-gray-500">
            {user?.email}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              role="menuitem"
              onClick={handleProfileClick}
            >
              <User className="mr-2 h-4 w-4" />
              Your Profile
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              role="menuitem"
              onClick={handleSettingsClick}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
