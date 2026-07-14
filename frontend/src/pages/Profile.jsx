import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { BsPersonCircle } from 'react-icons/bs';
import Input from '../components/Input';
import Button from '../components/Button';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
    }
  });

  const onSubmit = async (data) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-primary-600 h-32 w-full"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-8 flex justify-between items-end">
            <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
              ) : (
                <BsPersonCircle className="h-full w-full text-gray-400" />
              )}
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 border-r border-gray-200 dark:border-gray-700 pr-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.fullName}</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className={`h-2 w-2 rounded-full mr-2 ${user?.isVerified ? 'bg-primary-600' : 'bg-yellow-500'}`}></span>
                  {user?.isVerified ? 'Email Verified' : 'Email Unverified'}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Details</h3>
                  <Input
                    label="Full Name"
                    type="text"
                    {...register('fullName', { required: 'Name is required' })}
                    error={errors.fullName}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' }
                    })}
                    error={errors.email}
                  />
                  <div className="flex gap-4 pt-4">
                    <Button type="submit" variant="primary">Save Changes</Button>
                    <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                      <p className="font-mono text-sm mt-1 text-gray-900 dark:text-gray-100">{user?._id}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
