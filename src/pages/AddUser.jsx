import React, { useState, useEffect } from 'react';
import { 
  Box, SimpleGrid, FormControl, FormLabel, Input, Select, HStack, Button, 
  useToast, Spinner, Text, Divider, Flex, Icon
} from '@chakra-ui/react';
import { Send, RotateCcw, List, Upload, Save } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader, FormCard, PageFooter, BRAND, ACCENT, inputStyle, selectStyle, labelStyle } from '../components/ui';
import axios from 'axios';

const AddUser = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
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
    const fetchRoles = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(`${apiUrl}/roles`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          const staffRoles = (response.data.roles || []).filter(r => 
            !['cook', 'user', 'customer'].includes(r.name.toLowerCase().trim())
          );
          setRoles(staffRoles);
        }
      } catch (error) {
        console.error('Failed to fetch roles');
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) return toast({ title: 'Error', description: 'Please select a role', status: 'error' });
    
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (profilePic) data.append('profilePic', profilePic);

      const response = await axios.post(`${apiUrl}/admin/users`, data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast({ title: 'Success', description: 'New system user created.', status: 'success' });
        navigate('/users/list');
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Creation failed', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box pb="10">
      <PageHeader 
        title="Add User Record" 
        breadcrumb="Add User Record" 
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
        <FormCard headerTitle="Add User Record">
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
              <FormLabel {...labelStyle}>Profile Pic</FormLabel>
              <Input type="file" p="1" {...inputStyle} onChange={(e) => setProfilePic(e.target.files[0])} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Password</FormLabel>
              <Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter Password" {...inputStyle} />
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
              Reset
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
              Submit
            </Button>
          </HStack>
        </FormCard>
      </form>
      <PageFooter />
    </Box>
  );
};

export default AddUser;
