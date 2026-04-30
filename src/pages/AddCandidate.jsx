import { useState } from 'react';
import { Box, SimpleGrid, FormControl, FormLabel, Input, Select, Textarea, HStack, Button, Tabs, TabList, Tab, TabPanels, TabPanel, Icon, Text, VStack } from '@chakra-ui/react';
import { Send, UserPlus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { PageHeader, FormCard, FileUploadField, PageFooter, BRAND, ACCENT, inputStyle, selectStyle, labelStyle } from '../components/ui';

const AddCandidate = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: 'Success', description: 'Candidate record has been added successfully.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
    navigate('/candidates/list');
  };

  const tabs = ['Basic Profile', 'Job Preference', 'Cooking Skills', 'Work Experience', 'Career Highlights', 'Documents Upload', 'Social Media', 'Photo Gallery'];

  return (
    <Box pb="10">
      <PageHeader title="Add Candidate Record" breadcrumb="Add Candidate Record"
        actions={[<Button key="back" as={Link} to="/candidates/list" size="sm" bg={BRAND} color="white" borderRadius="lg" _hover={{ bg: '#003d91' }} fontSize="xs" px="4">Back to List</Button>]}
      />

      <Box bg="white" borderRadius="xl" overflow="hidden" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
        <Box px="5" py="4" borderBottom="1px solid #f1f5f9">
          <HStack spacing="3"><Box w="3px" h="18px" bg={BRAND} borderRadius="full" /><Text fontSize="sm" fontWeight="700" color="#1e293b">Candidate Profile</Text></HStack>
        </Box>

        <Tabs index={activeTab} onChange={setActiveTab} variant="unstyled" p="5">
          <TabList display="flex" flexWrap="wrap" gap="2" mb="6" pb="4" borderBottom="1px solid #f1f5f9">
            {tabs.map((tab, index) => {
              const isEnabled = index <= 1;
              return (
                <Tab key={tab} isDisabled={!isEnabled} fontSize="xs" fontWeight="600" px="4" py="2" borderRadius="lg"
                  color={activeTab === index ? 'white' : (isEnabled ? '#475569' : '#cbd5e1')}
                  bg={activeTab === index ? BRAND : 'transparent'}
                  opacity={isEnabled ? 1 : 0.4}
                  cursor={isEnabled ? 'pointer' : 'not-allowed'}
                  _hover={{ bg: activeTab === index ? '#003d91' : (isEnabled ? '#f0f5ff' : 'transparent'), color: activeTab === index ? 'white' : (isEnabled ? BRAND : '#cbd5e1') }}
                  _disabled={{ opacity: 0.3, cursor: 'not-allowed' }}
                  transition="all 0.18s">
                  {tab}
                </Tab>
              );
            })}
          </TabList>

          <TabPanels>
            {/* Basic Profile */}
            <TabPanel p="0">
              <form onSubmit={handleSubmit}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacingX="6" spacingY="5" mb="5">
                  <FormControl isRequired><FormLabel {...labelStyle}>Name</FormLabel><Input placeholder="Enter full name" {...inputStyle} /></FormControl>
                  <FormControl><FormLabel {...labelStyle}>Email ID (optional)</FormLabel><Input placeholder="Enter Email ID" {...inputStyle} /></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>Phone Number</FormLabel><Input placeholder="Enter Phone Number" {...inputStyle} /></FormControl>
                  <FormControl><FormLabel {...labelStyle}>Alternate Phone No</FormLabel><Input placeholder="Enter alternate phone no" {...inputStyle} /></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>Date of Birth</FormLabel><Input type="date" {...inputStyle} /></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>Age</FormLabel><Input placeholder="Enter age" {...inputStyle} /></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>Gender</FormLabel><Select {...selectStyle} placeholder="Select Gender"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></Select></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>Marital Status</FormLabel><Select {...selectStyle} placeholder="Select Marital Status"><option value="single">Single</option><option value="married">Married</option></Select></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>State</FormLabel><Select {...selectStyle} placeholder="Select State"><option value="up">Uttar Pradesh</option><option value="maharashtra">Maharashtra</option></Select></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>City</FormLabel><Select {...selectStyle} placeholder="Select City"><option value="lucknow">Lucknow</option><option value="mumbai">Mumbai</option></Select></FormControl>
                </SimpleGrid>
                <FormControl mb="5" isRequired><FormLabel {...labelStyle}>Full Address</FormLabel><Textarea placeholder="Enter Address" {...inputStyle} minH="90px" /></FormControl>
                <FormControl mb="5" isRequired><FormLabel {...labelStyle}>Languages Known</FormLabel><Select {...selectStyle} placeholder="Select Languages"><option value="hindi">Hindi</option><option value="english">English</option></Select></FormControl>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacingX="6" spacingY="5" mb="6">
                  <FormControl><FormLabel {...labelStyle}>Profile Image</FormLabel><FileUploadField /></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>KYC Status</FormLabel><Select {...selectStyle} defaultValue="pending"><option value="pending">Pending</option><option value="approved">Approved</option></Select></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>Profile Status</FormLabel><Select {...selectStyle} defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option></Select></FormControl>
                </SimpleGrid>
                <HStack justify="flex-end">
                  <Button type="submit" leftIcon={<Send size={15} />} bg={BRAND} color="white" borderRadius="lg" size="sm" px="6" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Submit Profile</Button>
                </HStack>
              </form>
            </TabPanel>

            {/* Job Preference */}
            <TabPanel p="0">
              <form onSubmit={handleSubmit}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacingX="6" spacingY="5" mb="5">
                  <FormControl isRequired><FormLabel {...labelStyle}>Job Category</FormLabel><Select {...selectStyle} placeholder="Select Job Category"><option value="hotel">Hotel Job</option><option value="home">Home Cook</option></Select></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>Job Type</FormLabel><Select {...selectStyle} placeholder="Select Job Type"><option value="full-time">Full Time</option><option value="part-time">Part Time</option></Select></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>Total Experience</FormLabel><Input placeholder="Enter total experience" {...inputStyle} /></FormControl>
                  <FormControl isRequired><FormLabel {...labelStyle}>Experience Type</FormLabel><Select {...selectStyle} defaultValue="months"><option value="months">Months</option><option value="years">Years</option></Select></FormControl>
                  <FormControl><FormLabel {...labelStyle}>Current Salary (Per Month)</FormLabel><Input placeholder="Enter current salary" {...inputStyle} /></FormControl>
                  <FormControl><FormLabel {...labelStyle}>Expected Salary (Per Month)</FormLabel><Input placeholder="Enter expected salary" {...inputStyle} /></FormControl>
                </SimpleGrid>
                <FormControl mb="5"><FormLabel {...labelStyle}>Preferred Job Cities</FormLabel><Select {...selectStyle} placeholder="Select Job Cities"><option value="mumbai">Mumbai</option><option value="lucknow">Lucknow</option></Select></FormControl>
                <FormControl mb="6"><FormLabel {...labelStyle}>Job Positions</FormLabel><Select {...selectStyle} placeholder="Select Job Positions"><option value="chef">Chef</option><option value="helper">Helper</option></Select></FormControl>
                <HStack justify="flex-end">
                  <Button type="submit" leftIcon={<Send size={15} />} bg={BRAND} color="white" borderRadius="lg" size="sm" px="6" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Submit Preferences</Button>
                </HStack>
              </form>
            </TabPanel>

            {tabs.slice(2).map((tab) => (
              <TabPanel key={tab} p="10" textAlign="center">
                <Icon as={UserPlus} boxSize={10} color="#e2e8f0" mb="3" />
                <Text color="#94a3b8" fontSize="md" fontWeight="600">{tab} — Coming Soon</Text>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>
      <PageFooter />
    </Box>
  );
};

export default AddCandidate;
