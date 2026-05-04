import React, { useState } from 'react';
import { 
  Box, SimpleGrid, FormControl, FormLabel, Select, Input, HStack, Button 
} from '@chakra-ui/react';
import { Send, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { PageHeader, FormCard, PageFooter, BRAND, inputStyle, selectStyle, labelStyle } from '../components/ui';
import axios from 'axios';

const AddRole = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    status: 'active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`${apiUrl}/roles`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        toast({ title: 'Success', description: 'New role created.', status: 'success' });
        navigate('/roles/list');
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box pb="10">
      <PageHeader title="Add Role Record" breadcrumb="Add Role Record" />
      <form onSubmit={handleSubmit}>
        <FormCard headerTitle="New Role Details" backTo="/roles/list">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="5" mb="8">
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Role Name</FormLabel>
              <Input 
                name="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="Enter role name" 
                {...inputStyle} 
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Status</FormLabel>
              <Select 
                name="status" 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})} 
                {...selectStyle}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormControl>
          </SimpleGrid>

          <HStack justify="flex-end" spacing="3" pt="4" borderTop="1px solid #f1f5f9">
            <Button leftIcon={<RotateCcw size={14} />} variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" size="sm" _hover={{ borderColor: BRAND, color: BRAND }} onClick={() => setFormData({ name: '', status: 'active' })}>Reset Form</Button>
            <Button type="submit" isLoading={isLoading} leftIcon={<Send size={14} />} bg={BRAND} color="white" borderRadius="lg" size="sm" px="6" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Create Role</Button>
          </HStack>
        </FormCard>
      </form>
      <PageFooter />
    </Box>
  );
};

export default AddRole;
