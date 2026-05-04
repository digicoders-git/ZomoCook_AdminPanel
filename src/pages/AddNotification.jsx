import React, { useState } from 'react';
import { Box, FormControl, FormLabel, Input, Select, Textarea, HStack, Button, SimpleGrid } from '@chakra-ui/react';
import { Send, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { PageHeader, FormCard, PageFooter, BRAND, ACCENT, inputStyle, selectStyle, labelStyle } from '../components/ui';
import axios from 'axios';

const AddNotification = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'all',
    status: 'active'
  });
  const [image, setImage] = useState(null);

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
      data.append('title', formData.title);
      data.append('message', formData.message);
      data.append('target', formData.target);
      data.append('status', formData.status);
      if (image) data.append('image', image);

      const response = await axios.post(`${apiUrl}/notifications`, data, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast({ title: 'Success', description: 'Notification created.', status: 'success' });
        navigate('/notifications/list');
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box pb="10">
      <PageHeader title="Add Notification Record" breadcrumb="Add Notification Record" />
      <form onSubmit={handleSubmit}>
        <FormCard headerTitle="New Notification Details" backTo="/notifications/list">
          <Box display="flex" flexDirection="column" gap="5">
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Notification Title</FormLabel>
              <Input name="title" value={formData.title} onChange={handleChange} placeholder="Enter Title" {...inputStyle} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Short Detail</FormLabel>
              <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Enter Short Detail" {...inputStyle} minH="110px" />
            </FormControl>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing="5">
              <FormControl>
                <FormLabel {...labelStyle}>Attachment Image</FormLabel>
                <Input type="file" p="1" {...inputStyle} onChange={(e) => setImage(e.target.files[0])} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel {...labelStyle}>Target Audience</FormLabel>
                <Select name="target" value={formData.target} onChange={handleChange} {...selectStyle}>
                  <option value="all">All Users</option>
                  <option value="candidates">Only Candidates</option>
                  <option value="customers">Only Customers</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel {...labelStyle}>Status</FormLabel>
                <Select name="status" value={formData.status} onChange={handleChange} {...selectStyle}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormControl>
            </SimpleGrid>
            <HStack justify="flex-end" spacing="3" pt="2">
              <Button leftIcon={<RotateCcw size={14} />} variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" size="sm" _hover={{ borderColor: BRAND, color: BRAND }} onClick={() => setFormData({ title: '', message: '', target: 'all', status: 'active' })}>Reset Form</Button>
              <Button type="submit" isLoading={isLoading} leftIcon={<Send size={14} />} bg={BRAND} color="white" borderRadius="lg" size="sm" px="6" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Create Notification</Button>
            </HStack>
          </Box>
        </FormCard>
      </form>
      <PageFooter />
    </Box>
  );
};

export default AddNotification;
