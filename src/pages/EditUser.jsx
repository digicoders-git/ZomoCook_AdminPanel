import React, { useState, useEffect } from 'react';
import { 
  Box, SimpleGrid, FormControl, FormLabel, Input, Select, HStack, Button, 
  useToast, Spinner, Text, Divider, Flex, Icon
} from '@chakra-ui/react';
import { Save, RotateCcw, List, Upload } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { PageHeader, FormCard, PageFooter, BRAND, ACCENT, inputStyle, selectStyle, labelStyle } from '../components/ui';
import axios from 'axios';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    jobActions: '',
    status: 'Active'
  });
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('adminToken');
        
        // Fetch Roles
        const rolesRes = await axios.get(`${apiUrl}/roles`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (rolesRes.data.success) setRoles(rolesRes.data.roles);

        // Fetch User details
        const userRes = await axios.get(`${apiUrl}/admin/users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.data.success) {
          const user = userRes.data.user;
          setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone,
            password: '', // Password stays empty unless updating
            role: user.role?._id || user.role,
            jobActions: user.jobActions || '',
            status: user.status
          });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch details', status: 'error' });
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'password' && !formData[key]) return; // Don't send empty password
        data.append(key, formData[key]);
      });
      if (profilePic) data.append('profilePic', profilePic);

      const response = await axios.put(`${apiUrl}/admin/users/${id}`, data, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast({ title: 'Success', description: 'User updated successfully.', status: 'success' });
        navigate('/users/list');
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Update failed', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <Flex h="80vh" align="center" justify="center"><Spinner size="xl" color={BRAND} thickness="4px" /></Flex>;

  return (
    <Box pb="10">
      <PageHeader 
        title="Edit User Record" 
        breadcrumb="Edit User Record" 
        actions={[
          <Button 
            key="list" 
            as={Link} 
            to="/users/list" 
            leftIcon={<List size={14} />} 
            size="sm" 
            bg="#f97316" 
            color="white" 
            borderRadius="md" 
            _hover={{ bg: '#ea580c' }}
          >
            List
          </Button>
        ]}
      />
      <form onSubmit={handleSubmit}>
        <FormCard headerTitle={`Edit User: ${formData.name}`}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="6" mb="6">
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Name</FormLabel>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" {...inputStyle} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Email</FormLabel>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter email" {...inputStyle} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Phone No</FormLabel>
              <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" {...inputStyle} />
            </FormControl>
          </SimpleGrid>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="6" mb="6">
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Role</FormLabel>
              <Select name="role" value={formData.role} onChange={handleChange} {...selectStyle} placeholder="Select Role">
                {roles.map(role => (
                  <option key={role._id} value={role._id}>{role.name}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel {...labelStyle}>Update Profile Pic</FormLabel>
              <Input type="file" p="1" {...inputStyle} onChange={(e) => setProfilePic(e.target.files[0])} />
            </FormControl>
            <FormControl>
              <FormLabel {...labelStyle}>New Password (Optional)</FormLabel>
              <Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current" {...inputStyle} />
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="6" mb="8">
            <FormControl>
              <FormLabel {...labelStyle}>Job Actions</FormLabel>
              <Select name="jobActions" value={formData.jobActions} onChange={handleChange} {...selectStyle} placeholder="Select Job Actions">
                <option value="Inactive">Inactive</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Expired">Expired</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Status</FormLabel>
              <Select name="status" value={formData.status} onChange={handleChange} {...selectStyle}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Expired">Expired</option>
              </Select>
            </FormControl>
          </SimpleGrid>

          <HStack justify="flex-end" spacing="3">
            <Button 
              bg="#4a707e" 
              color="white" 
              borderRadius="md" 
              size="sm" 
              px="6"
              _hover={{ bg: '#3a5a66' }} 
              onClick={() => navigate('/users/list')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={isLoading} 
              leftIcon={<Save size={16} />} 
              bg={BRAND} 
              color="white" 
              borderRadius="md" 
              size="sm" 
              px="8" 
              _hover={{ bg: '#ea580c' }}
            >
              Update
            </Button>
          </HStack>
        </FormCard>
      </form>
      <PageFooter />
    </Box>
  );
};

export default EditUser;
