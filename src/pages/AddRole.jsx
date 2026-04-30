import React from 'react';
import { Box, SimpleGrid, FormControl, FormLabel, Select, Input, HStack, Button } from '@chakra-ui/react';
import { Send, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { PageHeader, FormCard, PageFooter, BRAND, inputStyle, selectStyle, labelStyle } from '../components/ui';

const AddRole = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: 'Success', description: 'New role has been created successfully.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
    navigate('/roles/list');
  };

  return (
    <Box pb="10">
      <PageHeader title="Add Role Record" breadcrumb="Add Role Record" />
      <form onSubmit={handleSubmit}>
        <FormCard headerTitle="New Role Details" backTo="/roles/list">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="5" mb="6">
            <FormControl isRequired><FormLabel {...labelStyle}>Role Name</FormLabel><Input placeholder="Enter role name" {...inputStyle} /></FormControl>
            <FormControl isRequired><FormLabel {...labelStyle}>Status</FormLabel><Select {...selectStyle} defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option></Select></FormControl>
          </SimpleGrid>
          <HStack justify="flex-end" spacing="3">
            <Button leftIcon={<RotateCcw size={14} />} variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" size="sm" _hover={{ borderColor: BRAND, color: BRAND }} onClick={() => navigate('/roles/list')}>Reset Form</Button>
            <Button type="submit" leftIcon={<Send size={14} />} bg={BRAND} color="white" borderRadius="lg" size="sm" px="6" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Create Role</Button>
          </HStack>
        </FormCard>
      </form>
      <PageFooter />
    </Box>
  );
};

export default AddRole;
