import { useState } from 'react';
import { Box, SimpleGrid, FormControl, FormLabel, Input, Select, Textarea, HStack, Button, Radio, RadioGroup, Stack, Divider, Text, Flex, Icon } from '@chakra-ui/react';
import { Send, RotateCcw, Plus, Upload } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { PageHeader, FormCard, FileUploadField, PageFooter, BRAND, ACCENT, inputStyle, selectStyle, labelStyle } from '../components/ui';

const AddJob = () => {
  const [jobCategory, setJobCategory] = useState('hotel');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: 'Success', description: 'Job record has been added successfully.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
    navigate('/jobs/list');
  };

  return (
    <Box pb="10">
      <PageHeader title="Add Job Record" breadcrumb="Add Job Record"
        actions={[<Button key="back" as={Link} to="/jobs/list" size="sm" bg={BRAND} color="white" borderRadius="lg" _hover={{ bg: '#003d91' }} fontSize="xs" px="4">Back to List</Button>]}
      />

      <form onSubmit={handleSubmit}>
        <FormCard headerTitle="Add Job Record">
          {/* Job Category Radio */}
          <Box mb="6" p="4" bg="#f8faff" borderRadius="lg" border="1px solid #e8edf5">
            <Text fontSize="xs" fontWeight="700" color="#475569" textTransform="uppercase" letterSpacing="0.8px" mb="3">Job Category</Text>
            <RadioGroup onChange={setJobCategory} value={jobCategory}>
              <Stack direction="row" spacing="6">
                {[['hotel', 'Hotel Job'], ['home', 'Home Cook Job'], ['daily', 'Daily Pay Job']].map(([val, label]) => (
                  <Radio key={val} value={val} sx={{ '.chakra-radio__control[data-checked]': { bg: BRAND, borderColor: BRAND } }}>
                    <Text fontSize="sm" color="#475569" fontWeight="500">{label}</Text>
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </Box>

          {/* Text Areas */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="5" mb="6">
            <FormControl isRequired><FormLabel {...labelStyle}>Job Overview</FormLabel><Textarea placeholder="Type job overview here..." {...inputStyle} minH="130px" /></FormControl>
            <FormControl isRequired><FormLabel {...labelStyle}>Key Responsibilities</FormLabel><Textarea placeholder="Type key responsibilities here..." {...inputStyle} minH="130px" /></FormControl>
            <FormControl isRequired><FormLabel {...labelStyle}>Requirements</FormLabel><Textarea placeholder="Type requirements here..." {...inputStyle} minH="130px" /></FormControl>
            <FormControl><FormLabel {...labelStyle}>Benefits</FormLabel><Textarea placeholder="Type benefits here..." {...inputStyle} minH="130px" /></FormControl>
          </SimpleGrid>

          <Divider borderColor="#f1f5f9" mb="6" />

          {/* Detail Fields */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacingX="6" spacingY="5" mb="5">
            <FormControl isRequired><FormLabel {...labelStyle}>Job Title</FormLabel><Input placeholder="Enter Job Title" {...inputStyle} /></FormControl>
            <FormControl isRequired><FormLabel {...labelStyle}>Customer/Client Name</FormLabel><Select {...selectStyle} placeholder="Select Customer/Client"><option>Client A</option><option>Client B</option></Select></FormControl>

            {jobCategory !== 'daily' ? (
              <FormControl><FormLabel {...labelStyle}>Property Category</FormLabel><Select {...selectStyle} placeholder="Select Property Category"><option>5 Star Hotel</option><option>Resort</option><option>Villa/Bungalow</option></Select></FormControl>
            ) : (
              <FormControl isRequired><FormLabel {...labelStyle}>State</FormLabel><Select {...selectStyle} placeholder="Select State"><option>Maharashtra</option><option>Delhi</option></Select></FormControl>
            )}

            {jobCategory !== 'daily' ? (
              <>
                <FormControl isRequired><FormLabel {...labelStyle}>State</FormLabel><Select {...selectStyle} placeholder="Select State"><option>Maharashtra</option><option>Delhi</option></Select></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>City</FormLabel><Select {...selectStyle} placeholder="Select City"><option>Mumbai</option><option>Lucknow</option></Select></FormControl>
              </>
            ) : (
              <>
                <FormControl isRequired><FormLabel {...labelStyle}>City</FormLabel><Select {...selectStyle} placeholder="Select City"><option>Mumbai</option><option>Lucknow</option></Select></FormControl>
                <FormControl isRequired><FormLabel {...labelStyle}>Event</FormLabel><Select {...selectStyle} placeholder="Select Event"><option>Wedding</option><option>Birthday</option><option>Corporate</option></Select></FormControl>
              </>
            )}

            {jobCategory === 'home' && <FormControl isRequired><FormLabel {...labelStyle}>Food Preference</FormLabel><Select {...selectStyle} placeholder="Select Food Preference"><option>Veg Only</option><option>Non-Veg Allowed</option></Select></FormControl>}
            {jobCategory === 'daily' && <FormControl><FormLabel {...labelStyle}>Meal Preference</FormLabel><Input placeholder="Select Meal Preference" {...inputStyle} /></FormControl>}
            {jobCategory === 'daily' && <FormControl isRequired><FormLabel {...labelStyle}>Food Preference</FormLabel><Input placeholder="Select Food Preference" {...inputStyle} /></FormControl>}
            {jobCategory === 'daily' && <FormControl isRequired><FormLabel {...labelStyle}>Serving Time</FormLabel><Select {...selectStyle} placeholder="Select Serving Time"><option>Morning</option><option>Evening</option><option>Night</option></Select></FormControl>}
            {jobCategory !== 'daily' && <FormControl isRequired><FormLabel {...labelStyle}>Basic Facility</FormLabel><Select {...selectStyle} placeholder="Select Basic Facility"><option>Accommodation</option><option>Meals</option></Select></FormControl>}
            {jobCategory !== 'daily' && <FormControl><FormLabel {...labelStyle}>Other Facilities</FormLabel><Select {...selectStyle} placeholder="Select Other Facilities"><option>Medical</option><option>Transport</option></Select></FormControl>}
            {jobCategory === 'home' && <FormControl isRequired><FormLabel {...labelStyle}>Cooking Category</FormLabel><Select {...selectStyle} placeholder="Select Cooking Category"><option>Breakfast</option><option>Lunch</option><option>Dinner</option></Select></FormControl>}
          </SimpleGrid>

          {jobCategory === 'daily' && (
            <FormControl mb="5"><FormLabel {...labelStyle}>Menu Details</FormLabel><Textarea placeholder="Enter Menu Details" {...inputStyle} minH="90px" /></FormControl>
          )}

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacingX="6" spacingY="5" mb="6">
            {jobCategory === 'daily' && <FormControl><FormLabel {...labelStyle}>You Will Get (Benefits)</FormLabel><Input placeholder="Select Benefits" {...inputStyle} /></FormControl>}
            <FormControl><FormLabel {...labelStyle}>Image</FormLabel><FileUploadField /></FormControl>
            <FormControl isRequired><FormLabel {...labelStyle}>Status</FormLabel><Select {...selectStyle} defaultValue="new"><option value="new">New</option><option value="active">Active</option></Select></FormControl>
          </SimpleGrid>

          {/* Job Parameters */}
          <Box p="5" borderRadius="xl" border="1px solid #e8edf5" bg="#f8faff" mb="6">
            <HStack spacing="3" mb="5">
              <Box w="3px" h="16px" bg={BRAND} borderRadius="full" />
              <Text fontSize="sm" fontWeight="700" color="#1e293b">Job Parameters</Text>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacingX="6" spacingY="5">
              <FormControl isRequired><FormLabel {...labelStyle}>Job Type</FormLabel><Select {...selectStyle} placeholder="Select Job Type"><option>Full Time</option><option>Part Time</option></Select></FormControl>
              <FormControl isRequired><FormLabel {...labelStyle}>Job Position</FormLabel><Select {...selectStyle} placeholder="Select Job Position"><option>Chef</option><option>Manager</option></Select></FormControl>
              <FormControl isRequired>
                <FormLabel {...labelStyle}>{jobCategory === 'daily' ? 'Package' : jobCategory === 'home' ? 'No. of Guest' : 'No. of Vacancy'}</FormLabel>
                <Input placeholder={jobCategory === 'daily' ? 'Enter Package' : jobCategory === 'home' ? 'Enter No. of Guest' : 'Enter No. of Vacancy'} {...inputStyle} />
              </FormControl>
              {jobCategory !== 'daily' && <FormControl><FormLabel {...labelStyle}>Allowed Leave</FormLabel><Input placeholder="Enter Allowed Leave" {...inputStyle} /></FormControl>}
              {jobCategory === 'daily' && <FormControl isRequired><FormLabel {...labelStyle}>No. of Guest</FormLabel><Input placeholder="Enter No Of Guest" {...inputStyle} /></FormControl>}
              {jobCategory !== 'daily' ? (
                <>
                  <FormControl isRequired><FormLabel {...labelStyle}>Salary Range</FormLabel><Select {...selectStyle} placeholder="Select Salary Range"><option>₹10,000 - ₹20,000</option><option>₹20,000 - ₹30,000</option></Select></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>Experience Range</FormLabel><Select {...selectStyle} placeholder="Select Experience Range"><option>0 - 2 Years</option><option>2 - 5 Years</option></Select></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>Joining Type</FormLabel><Select {...selectStyle} placeholder="Select Joining Type"><option>Immediate</option><option>1 Month</option></Select></FormControl>
                </>
              ) : (
                <FormControl isRequired><FormLabel {...labelStyle}>Date of Event</FormLabel><Input type="date" {...inputStyle} /></FormControl>
              )}
            </SimpleGrid>
            <Flex justify="flex-end" mt="5">
              <Button leftIcon={<Plus size={14} />} bg={ACCENT} color="white" size="sm" borderRadius="lg" _hover={{ bg: '#c8151c' }}>Add More Parameters</Button>
            </Flex>
          </Box>

          <HStack justify="flex-end" spacing="3">
            <Button leftIcon={<RotateCcw size={14} />} variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" size="sm" _hover={{ borderColor: BRAND, color: BRAND }} onClick={() => navigate('/jobs/list')}>Reset Form</Button>
            <Button type="submit" leftIcon={<Send size={14} />} bg={BRAND} color="white" borderRadius="lg" size="sm" px="6" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Submit Job</Button>
          </HStack>
        </FormCard>
      </form>
      <PageFooter />
    </Box>
  );
};

export default AddJob;
