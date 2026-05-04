import React, { useState, useEffect } from 'react';
import { 
  Box, VStack, HStack, Text, Icon, FormControl, FormLabel, Input, SimpleGrid, 
  Image, Flex, Button, Divider, useToast, Spinner 
} from '@chakra-ui/react';
import { User, Lock, Save, RotateCcw, Camera } from 'lucide-react';
import { PageHeader, PageFooter, BRAND, ACCENT, inputStyle, labelStyle } from '../components/ui';
import axios from 'axios';

const SectionHeader = ({ icon, title }) => (
  <HStack spacing="3" mb="5">
    <Flex w="32px" h="32px" borderRadius="lg" bg="#e6eeff" align="center" justify="center" flexShrink={0}>
      <Icon as={icon} boxSize={4} color={BRAND} />
    </Flex>
    <Text fontSize="sm" fontWeight="700" color="#1e293b">{title}</Text>
  </HStack>
);

const Profile = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePic: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;
  const apiBase = apiUrl.replace('/api', '');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/admin/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setProfileData({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          profilePic: response.data.profilePic
        });
        setPreviewUrl(response.data.profilePic ? `${apiBase}/${response.data.profilePic}` : '');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch profile', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      formData.append('phone', profileData.phone);
      if (newProfilePic) formData.append('profilePic', newProfilePic);

      const response = await axios.put(`${apiUrl}/admin/profile`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast({ title: 'Success', description: 'Profile updated successfully', status: 'success' });
        // Update local storage if needed or refresh
        if (response.data.token) localStorage.setItem('adminToken', response.data.token);
        fetchProfile();
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Update failed', status: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast({ title: 'Error', description: 'Passwords do not match', status: 'error' });
    }
    
    setIsChangingPass(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`${apiUrl}/admin/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast({ title: 'Success', description: 'Password changed successfully', status: 'success' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Password change failed', status: 'error' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  if (isLoading) return <Flex h="80vh" align="center" justify="center"><Spinner size="xl" color={BRAND} thickness="4px" /></Flex>;

  return (
    <Box pb="10">
      <PageHeader title="Update Profile" breadcrumb="Update Profile" />

      <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)" overflow="hidden">
        <Box h="4px" bg={`linear-gradient(90deg, ${BRAND}, ${ACCENT})`} />

        <Box p={{ base: '5', md: '8' }}>
          <VStack align="stretch" spacing="8">
            {/* Profile Section */}
            <form onSubmit={handleProfileUpdate}>
              <Box>
                <SectionHeader icon={User} title="Basic Information" />
                <SimpleGrid columns={{ base: 1, md: 2 }} spacingX="8" spacingY="5">
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Full Name</FormLabel>
                    <Input 
                      value={profileData.name} 
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                      placeholder="Enter full name" 
                      {...inputStyle} 
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Email Address</FormLabel>
                    <Input 
                      type="email"
                      value={profileData.email} 
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})} 
                      placeholder="Enter email" 
                      {...inputStyle} 
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Phone No</FormLabel>
                    <Input 
                      value={profileData.phone} 
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})} 
                      placeholder="Enter phone number" 
                      {...inputStyle} 
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel {...labelStyle}>Profile Picture</FormLabel>
                    <HStack spacing="4" align="center">
                      <Box 
                        position="relative" 
                        w="80px" 
                        h="80px" 
                        borderRadius="full" 
                        overflow="hidden" 
                        border={`3px solid ${BRAND}30`}
                        boxShadow="0 2px 8px rgba(0,74,173,0.1)"
                      >
                        <Image 
                          src={previewUrl || 'https://via.placeholder.com/150'} 
                          alt="profile" 
                          objectFit="cover" 
                          w="full" 
                          h="full" 
                        />
                        <Flex 
                          position="absolute" 
                          bottom="0" 
                          w="full" 
                          h="30%" 
                          bg="blackAlpha.600" 
                          align="center" 
                          justify="center"
                          cursor="pointer"
                          onClick={() => document.getElementById('profile-upload').click()}
                        >
                          <Icon as={Camera} color="white" boxSize={3} />
                        </Flex>
                      </Box>
                      <VStack align="start" spacing="1">
                        <Button 
                          size="xs" 
                          variant="outline" 
                          onClick={() => document.getElementById('profile-upload').click()}
                        >
                          Choose File
                        </Button>
                        <Text fontSize="10px" color="#64748b">JPG, PNG or GIF. Max 1MB</Text>
                      </VStack>
                      <Input 
                        id="profile-upload" 
                        type="file" 
                        display="none" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </HStack>
                  </FormControl>
                </SimpleGrid>
                
                <Flex justify="flex-end" mt="6">
                  <Button 
                    type="submit"
                    isLoading={isUpdating} 
                    leftIcon={<Save size={14} />} 
                    bg={BRAND} 
                    color="white" 
                    borderRadius="lg" 
                    size="sm" 
                    px="8" 
                    _hover={{ bg: '#003d91' }} 
                    boxShadow={`0 4px 12px ${BRAND}30`}
                  >
                    Save Changes
                  </Button>
                </Flex>
              </Box>
            </form>

            <Divider borderColor="#f1f5f9" />

            {/* Password Section */}
            <form onSubmit={handlePasswordChange}>
              <Box>
                <SectionHeader icon={Lock} title="Security & Password" />
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="5">
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Current Password</FormLabel>
                    <Input 
                      type="password" 
                      value={passwordData.currentPassword} 
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                      placeholder="••••••••" 
                      {...inputStyle} 
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>New Password</FormLabel>
                    <Input 
                      type="password" 
                      value={passwordData.newPassword} 
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                      placeholder="Enter new password" 
                      {...inputStyle} 
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel {...labelStyle}>Confirm New Password</FormLabel>
                    <Input 
                      type="password" 
                      value={passwordData.confirmPassword} 
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                      placeholder="Confirm new password" 
                      {...inputStyle} 
                    />
                  </FormControl>
                </SimpleGrid>

                <Flex justify="flex-end" mt="6">
                  <Button 
                    variant="outline" 
                    borderColor="#dde6f5" 
                    color="#64748b" 
                    borderRadius="lg" 
                    size="sm" 
                    mr="3"
                    onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                  >
                    Reset
                  </Button>
                  <Button 
                    type="submit"
                    isLoading={isChangingPass} 
                    bg="#1e293b" 
                    color="white" 
                    borderRadius="lg" 
                    size="sm" 
                    px="8" 
                    _hover={{ bg: '#0f172a' }}
                  >
                    Update Password
                  </Button>
                </Flex>
              </Box>
            </form>
          </VStack>
        </Box>
      </Box>
      <PageFooter />
    </Box>
  );
};

export default Profile;
