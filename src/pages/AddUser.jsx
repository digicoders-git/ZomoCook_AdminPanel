import React from 'react';
import { Box, SimpleGrid, FormControl, FormLabel, Input, Select, HStack, Button } from '@chakra-ui/react';
import { Send, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { PageHeader, FormCard, FileUploadField, PageFooter, BRAND, inputStyle, selectStyle, labelStyle } from '../components/ui';

const AddUser = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: 'Success', description: 'New system user has been created successfully.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
    navigate('/users/list');
  };

  return (
    <Box pb="10">
      <PageHeader title="Add System User" breadcrumb="Add User Record" />
      <form onSubmit={handleSubmit}>
        <FormCard headerTitle="New User Details" backTo="/users/list">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="5" mb="5">
            <FormControl isRequired><FormLabel {...labelStyle}>Full Name</FormLabel><Input placeholder="Enter full name" {...inputStyle} /></FormControl>
            <FormControl isRequired><FormLabel {...labelStyle}>Email Address</FormLabel><Input type="email" placeholder="Enter email" {...inputStyle} /></FormControl>
            <FormControl isRequired><FormLabel {...labelStyle}>Phone Number</FormLabel><Input placeholder="Enter phone number" {...inputStyle} /></FormControl>
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="5" mb="5">
            <FormControl isRequired><FormLabel {...labelStyle}>Access Role</FormLabel><Select {...selectStyle} placeholder="Select Role"><option value="admin">Admin</option><option value="telemarketing">Telemarketing</option><option value="sales">Sales</option></Select></FormControl>
            <FormControl><FormLabel {...labelStyle}>Profile Image</FormLabel><FileUploadField /></FormControl>
            <FormControl isRequired><FormLabel {...labelStyle}>Security Password</FormLabel><Input type="password" placeholder="Enter Password" {...inputStyle} /></FormControl>
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="5" mb="6">
            <FormControl><FormLabel {...labelStyle}>Job Permissions</FormLabel><Select {...selectStyle} placeholder="Select Job Actions"><option value="view">View Only</option><option value="edit">Full Access</option></Select></FormControl>
            <FormControl isRequired><FormLabel {...labelStyle}>Account Status</FormLabel><Select {...selectStyle} defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option></Select></FormControl>
          </SimpleGrid>
          <HStack justify="flex-end" spacing="3">
            <Button leftIcon={<RotateCcw size={14} />} variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" size="sm" _hover={{ borderColor: BRAND, color: BRAND }} onClick={() => navigate('/users/list')}>Reset Form</Button>
            <Button type="submit" leftIcon={<Send size={14} />} bg={BRAND} color="white" borderRadius="lg" size="sm" px="6" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Create User</Button>
          </HStack>
        </FormCard>
      </form>
      <PageFooter />
    </Box>
  );
};

export default AddUser;
