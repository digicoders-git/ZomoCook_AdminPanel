import { useState } from 'react';
import { Box, SimpleGrid, FormControl, FormLabel, Input, Select, Textarea, HStack, Button } from '@chakra-ui/react';
import { Send, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { PageHeader, FormCard, PageFooter, BRAND, inputStyle, selectStyle, labelStyle } from '../components/ui';
import axios from 'axios';

const AddCustomer = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (profilePic) data.append('profilePic', profilePic);

      const response = await axios.post(`${apiUrl}/customers`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast({ title: 'Success', description: 'Customer record has been added successfully.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
        navigate('/customers/list');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add customer.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box pb="10">
      <PageHeader title="Add Customer/Client Record" breadcrumb="Add Customer/Client Record" />

      <form onSubmit={handleSubmit}>
        <FormCard headerTitle="Add Customer Details" backTo="/customers/list">
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
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Password</FormLabel>
              <Input name="password" value={formData.password} onChange={handleChange} type="password" placeholder="Enter Password" {...inputStyle} />
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
              <FormLabel {...labelStyle}>Profile Pic</FormLabel>
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
              _hover={{ borderColor: BRAND, color: BRAND }} onClick={() => navigate('/customers/list')}>Reset</Button>
            <Button type="submit" isLoading={isLoading} leftIcon={<Send size={15} />} bg={BRAND} color="white" borderRadius="lg" size="sm" px="6"
              _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Submit Details</Button>
          </HStack>
        </FormCard>
      </form>
      <PageFooter />
    </Box>
  );
};

export default AddCustomer;
