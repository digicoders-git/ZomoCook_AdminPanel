import React from 'react';
import { Box, FormControl, FormLabel, Input, Select, Textarea, HStack, Button, SimpleGrid } from '@chakra-ui/react';
import { Send, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { PageHeader, FormCard, FileUploadField, PageFooter, BRAND, ACCENT, inputStyle, selectStyle, labelStyle } from '../components/ui';

const AddNotification = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: 'Success', description: 'Notification has been created successfully.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
    navigate('/notifications/list');
  };

  return (
    <Box pb="10">
      <PageHeader title="Add Notification Record" breadcrumb="Add Notification Record" />
      <form onSubmit={handleSubmit}>
        <FormCard headerTitle="New Notification Details" backTo="/notifications/list">
          <Box display="flex" flexDirection="column" gap="5">
            <FormControl isRequired><FormLabel {...labelStyle}>Notification Title</FormLabel><Input placeholder="Enter Title" {...inputStyle} /></FormControl>
            <FormControl isRequired><FormLabel {...labelStyle}>Short Detail</FormLabel><Textarea placeholder="Enter Short Detail" {...inputStyle} minH="110px" /></FormControl>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="5">
              <FormControl><FormLabel {...labelStyle}>Attachment Image</FormLabel><FileUploadField /></FormControl>
              <FormControl isRequired><FormLabel {...labelStyle}>Status</FormLabel><Select {...selectStyle} defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option></Select></FormControl>
            </SimpleGrid>
            <HStack justify="flex-end" spacing="3" pt="2">
              <Button leftIcon={<RotateCcw size={14} />} variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" size="sm" _hover={{ borderColor: BRAND, color: BRAND }} onClick={() => navigate('/notifications/list')}>Reset Form</Button>
              <Button type="submit" leftIcon={<Send size={14} />} bg={BRAND} color="white" borderRadius="lg" size="sm" px="6" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Create Notification</Button>
            </HStack>
          </Box>
        </FormCard>
      </form>
      <PageFooter />
    </Box>
  );
};

export default AddNotification;
