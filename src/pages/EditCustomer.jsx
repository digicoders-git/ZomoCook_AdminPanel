import React, { useState, useEffect } from 'react';
import { Box, SimpleGrid, FormControl, FormLabel, Input, Select, Textarea, HStack, Button, Spinner, Center } from '@chakra-ui/react';
import { Send, RotateCcw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { PageHeader, FormCard, PageFooter, BRAND, ACCENT, inputStyle, selectStyle, labelStyle } from '../components/ui';
import axios from 'axios';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    propertyCategory: '',
    email: '',
    password: '',
    contactName: '',
    contactPhone: '',
    contactAddress: '',
    customerStatus: 'running',
    accountStatus: 'active',
  });
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(`${apiUrl}/customers/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          const { password, ...rest } = response.data.customer;
          setFormData({ ...rest, password: '' }); // Don't show hashed password
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch customer data.', status: 'error', duration: 3000, position: 'top-right' });
        navigate('/customers/list');
      } finally {
        setIsFetching(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
    }
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

      const response = await axios.put(`${apiUrl}/customers/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast({ title: 'Success', description: 'Customer record updated successfully.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
        navigate('/customers/list');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update customer.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Center h="60vh">
        <Spinner size="xl" color={BRAND} thickness="4px" />
      </Center>
    );
  }

  return (
    <Box pb="10">
      <PageHeader title="Edit Customer/Client Record" breadcrumb="Edit Customer/Client Record" />

      <form onSubmit={handleSubmit}>
        <FormCard headerTitle="Edit Customer Details" backTo="/customers/list">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacingX="6" spacingY="5">
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Customer/Client Name</FormLabel>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" {...inputStyle} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Property Category</FormLabel>
              <Select name="propertyCategory" value={formData.propertyCategory} onChange={handleChange} {...selectStyle} placeholder="Select Property Category">
                <option value="hotel">Hotel</option>
                <option value="resort">Resort</option>
                <option value="villa">Private Villa</option>
                <option value="canteen">Canteen</option>
                <option value="restaurant">Restaurant</option>
                <option value="home">Home</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Email ID</FormLabel>
              <Input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Enter Email ID" {...inputStyle} />
            </FormControl>
            <FormControl>
              <FormLabel {...labelStyle}>Password (Leave blank to keep current)</FormLabel>
              <Input name="password" value={formData.password} onChange={handleChange} type="password" placeholder="Enter New Password" {...inputStyle} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Contact Name</FormLabel>
              <Input name="contactName" value={formData.contactName} onChange={handleChange} placeholder="Enter Contact Name" {...inputStyle} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Contact Phone No</FormLabel>
              <Input name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="Enter Contact Phone No" {...inputStyle} />
            </FormControl>
            <Box gridColumn={{ md: 'span 3' }}>
              <FormControl isRequired>
                <FormLabel {...labelStyle}>Contact Address</FormLabel>
                <Textarea name="contactAddress" value={formData.contactAddress} onChange={handleChange} placeholder="Enter Contact Address" {...inputStyle} rows={3} />
              </FormControl>
            </Box>
            <FormControl>
              <FormLabel {...labelStyle}>Update Profile Pic</FormLabel>
              <Input type="file" onChange={handleFileChange} p="1" {...inputStyle} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Customer Status</FormLabel>
              <Select name="customerStatus" value={formData.customerStatus} onChange={handleChange} {...selectStyle} placeholder="Select Status">
                <option value="running">Running</option>
                <option value="closed">Closed</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Account Status</FormLabel>
              <Select name="accountStatus" value={formData.accountStatus} onChange={handleChange} {...selectStyle} placeholder="Select Status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormControl>
          </SimpleGrid>

          <HStack justify="flex-end" mt="8" spacing="3">
            <Button leftIcon={<RotateCcw size={15} />} variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" size="sm"
              _hover={{ borderColor: BRAND, color: BRAND }} onClick={() => navigate('/customers/list')}>Cancel</Button>
            <Button type="submit" isLoading={isLoading} leftIcon={<Send size={15} />} bg={BRAND} color="white" borderRadius="lg" size="sm" px="6"
              _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Update Details</Button>
          </HStack>
        </FormCard>
      </form>
      <PageFooter />
    </Box>
  );
};

export default EditCustomer;
