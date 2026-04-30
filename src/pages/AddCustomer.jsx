import React from 'react';
import { Box, SimpleGrid, FormControl, FormLabel, Input, Select, Textarea, HStack, Button } from '@chakra-ui/react';
import { Send, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { PageHeader, FormCard, FileUploadField, PageFooter, BRAND, ACCENT, inputStyle, selectStyle, labelStyle } from '../components/ui';

const AddCustomer = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: 'Success', description: 'Customer record has been added successfully.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
    navigate('/customers/list');
  };

  return (
    <Box pb="10">
      <PageHeader title="Add Customer/Client Record" breadcrumb="Add Customer/Client Record" />

      <form onSubmit={handleSubmit}>
        <FormCard headerTitle="Add Customer Details" backTo="/customers/list">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacingX="6" spacingY="5">
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Customer/Client Name</FormLabel>
              <Input placeholder="Enter full name" {...inputStyle} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Property Category</FormLabel>
              <Select {...selectStyle} placeholder="Select Property Category">
                <option value="hotel">Hotel</option>
                <option value="resort">Resort</option>
                <option value="villa">Private Villa</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Email ID</FormLabel>
              <Input type="email" placeholder="Enter Email ID" {...inputStyle} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Password</FormLabel>
              <Input type="password" placeholder="Enter Password" {...inputStyle} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Contact Name</FormLabel>
              <Input placeholder="Enter Contact Name" {...inputStyle} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Contact Phone No</FormLabel>
              <Input placeholder="Enter Contact Phone No" {...inputStyle} />
            </FormControl>
            <Box gridColumn={{ md: 'span 3' }}>
              <FormControl isRequired>
                <FormLabel {...labelStyle}>Contact Address</FormLabel>
                <Textarea placeholder="Enter Contact Address" {...inputStyle} rows={3} />
              </FormControl>
            </Box>
            <FormControl>
              <FormLabel {...labelStyle}>Profile Pic</FormLabel>
              <FileUploadField />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Customer Status</FormLabel>
              <Select {...selectStyle} placeholder="Select Status">
                <option value="running">Running</option>
                <option value="closed">Closed</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Account Status</FormLabel>
              <Select {...selectStyle} placeholder="Select Status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormControl>
          </SimpleGrid>

          <HStack justify="flex-end" mt="8" spacing="3">
            <Button leftIcon={<RotateCcw size={15} />} variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" size="sm"
              _hover={{ borderColor: BRAND, color: BRAND }} onClick={() => navigate('/customers/list')}>Reset</Button>
            <Button type="submit" leftIcon={<Send size={15} />} bg={BRAND} color="white" borderRadius="lg" size="sm" px="6"
              _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Submit Details</Button>
          </HStack>
        </FormCard>
      </form>
      <PageFooter />
    </Box>
  );
};

export default AddCustomer;
