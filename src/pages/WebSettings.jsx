import React from 'react';
import { Box, VStack, HStack, Text, Icon, Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Input, SimpleGrid, Image, Flex, Textarea, Button } from '@chakra-ui/react';
import { Globe, MapPin, Share2, Save, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { PageHeader, PageFooter, BRAND, ACCENT, inputStyle, labelStyle } from '../components/ui';

const SectionTitle = ({ children }) => (
  <HStack spacing="3" mb="5">
    <Box w="3px" h="18px" bg={BRAND} borderRadius="full" />
    <Text fontSize="sm" fontWeight="700" color="#1e293b">{children}</Text>
  </HStack>
);

const SaveBtn = ({ label = 'Save Changes' }) => (
  <Flex pt="4">
    <Button leftIcon={<Save size={15} />} bg={BRAND} color="white" size="sm" px="6" borderRadius="lg" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>{label}</Button>
  </Flex>
);

const WebSettings = () => (
  <Box pb="10">
    <PageHeader title="Web Settings" breadcrumb="Web Settings" />

    <Box bg="white" borderRadius="xl" overflow="hidden" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
      <Tabs variant="unstyled">
        <TabList bg="#f8faff" px="4" pt="3" borderBottom="2px solid #e8edf5" gap="1" display="flex">
          {[{ icon: Globe, label: 'General Settings' }, { icon: MapPin, label: 'Address Settings' }, { icon: Share2, label: 'Social Media Settings' }].map(({ icon, label }) => (
            <Tab key={label}
              _selected={{ color: BRAND, bg: 'white', borderBottom: `2px solid ${BRAND}`, mb: '-2px' }}
              borderRadius="lg lg 0 0" px="5" py="3" fontSize="sm" fontWeight="600" color="#64748b"
              display="flex" alignItems="center" gap="2" transition="all 0.18s">
              <Icon as={icon} boxSize={4} />{label}
            </Tab>
          ))}
        </TabList>

        <TabPanels p={{ base: '5', md: '8' }}>
          {/* General Settings */}
          <TabPanel p="0">
            <VStack align="stretch" spacing="6">
              <SectionTitle>Company Details</SectionTitle>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing="5">
                <FormControl><FormLabel {...labelStyle}>Site Name</FormLabel><Input {...inputStyle} defaultValue="ZomoCook" /></FormControl>
                <FormControl><FormLabel {...labelStyle}>Company Email</FormLabel><Input {...inputStyle} defaultValue="info@zomocook.in" /></FormControl>
                <FormControl><FormLabel {...labelStyle}>Contact Number</FormLabel><Input {...inputStyle} defaultValue="+91 8009534847" /></FormControl>
                <SimpleGrid columns={2} spacing="4">
                  <FormControl>
                    <FormLabel {...labelStyle}>Logo</FormLabel>
                    <VStack align="start" spacing="2">
                      <Button size="xs" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" leftIcon={<Upload size={12} />} _hover={{ borderColor: BRAND, color: BRAND }}>Upload</Button>
                      <Image src="https://zomocook.com/public/images/logo.png" h="36px" bg="white" p="1" borderRadius="md" border="1px solid #e8edf5" />
                    </VStack>
                  </FormControl>
                  <FormControl>
                    <FormLabel {...labelStyle}>Favicon</FormLabel>
                    <VStack align="start" spacing="2">
                      <Button size="xs" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" leftIcon={<Upload size={12} />} _hover={{ borderColor: BRAND, color: BRAND }}>Upload</Button>
                      <Box w="32px" h="32px" bg="#f8faff" borderRadius="md" border="1px solid #e8edf5" />
                    </VStack>
                  </FormControl>
                </SimpleGrid>
              </SimpleGrid>
              <SaveBtn />
            </VStack>
          </TabPanel>

          {/* Address Settings */}
          <TabPanel p="0">
            <VStack align="stretch" spacing="6">
              <SectionTitle>Contact & Legal</SectionTitle>
              <FormControl><FormLabel {...labelStyle}>Full Address</FormLabel><Textarea {...inputStyle} defaultValue="Duplex Technologies, Lucknow, Uttar Pradesh, India" minH="90px" /></FormControl>
              <FormControl><FormLabel {...labelStyle}>Copyright Text</FormLabel><Input {...inputStyle} defaultValue="© 2026 ZomoCook. All Rights Reserved." /></FormControl>
              <FormControl><FormLabel {...labelStyle}>Google Map Script</FormLabel><Textarea {...inputStyle} placeholder="Paste your iframe code here..." minH="110px" /></FormControl>
              <SaveBtn label="Update Address" />
            </VStack>
          </TabPanel>

          {/* Social Media Settings */}
          <TabPanel p="0">
            <VStack align="stretch" spacing="6">
              <SectionTitle>Social Media Links</SectionTitle>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing="5">
                <FormControl><FormLabel {...labelStyle}>Facebook URL</FormLabel><Input {...inputStyle} defaultValue="https://www.facebook.com/" /></FormControl>
                <FormControl><FormLabel {...labelStyle}>Instagram URL</FormLabel><Input {...inputStyle} defaultValue="https://instagram.com/" /></FormControl>
                <FormControl><FormLabel {...labelStyle}>Twitter URL</FormLabel><Input {...inputStyle} defaultValue="https://twitter.com/" /></FormControl>
                <FormControl><FormLabel {...labelStyle}>LinkedIn URL</FormLabel><Input {...inputStyle} defaultValue="https://www.linkedin.com/" /></FormControl>
                <FormControl><FormLabel {...labelStyle}>YouTube URL</FormLabel><Input {...inputStyle} defaultValue="https://youtube.com/" /></FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel {...labelStyle}>Important Instruction</FormLabel>
                <Box bg="white" borderRadius="lg" overflow="hidden" border="1.5px solid #dde6f5">
                  <ReactQuill theme="snow" defaultValue="<ul><li>Arrive 15 minutes early</li><li>Wear clean chef uniform and maintain hygiene</li></ul>" />
                </Box>
              </FormControl>
              <FormControl>
                <FormLabel {...labelStyle}>Reschedule Message</FormLabel>
                <Textarea {...inputStyle} defaultValue="If you are unable to attend the demo at the scheduled time, please request a reschedule at least 24 hours in advance." minH="90px" />
              </FormControl>
              <SaveBtn label="Update Settings" />
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
    <PageFooter />
  </Box>
);

export default WebSettings;
