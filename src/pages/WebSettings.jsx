import { useState, useEffect, useRef } from 'react';
import { Box, VStack, HStack, Text, Icon, Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Input, SimpleGrid, Image, Flex, Textarea, Button, useToast, Spinner } from '@chakra-ui/react';
import { Globe, MapPin, Share2, Save, Upload } from 'lucide-react';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { PageHeader, PageFooter, BRAND, inputStyle, labelStyle } from '../components/ui';

const SectionTitle = ({ children }) => (
  <HStack spacing="3" mb="5">
    <Box w="3px" h="18px" bg={BRAND} borderRadius="full" />
    <Text fontSize="sm" fontWeight="700" color="#1e293b">{children}</Text>
  </HStack>
);

const WebSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: '',
    companyEmail: '',
    contactNumber: '',
    fullAddress: '',
    copyrightText: '',
    googleMapScript: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    youtubeUrl: '',
    importantInstruction: '',
    rescheduleMessage: '',
    logo: null,
    favicon: null
  });

  const [previews, setPreviews] = useState({
    logo: null,
    favicon: null
  });

  const logoInputRef = useRef();
  const faviconInputRef = useRef();
  const toast = useToast();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.get(`${API_BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setSettings({
          ...data.settings,
          logo: null, // We handle files separately
          favicon: null
        });
        const serverBaseUrl = API_BASE_URL.replace('/api', '');
        setPreviews({
          logo: data.settings.logo ? `${serverBaseUrl}/${data.settings.logo.replace(/\\/g, '/')}` : null,
          favicon: data.settings.favicon ? `${serverBaseUrl}/${data.settings.favicon.replace(/\\/g, '/')}` : null
        });
      }
    } catch (error) {
      toast({
        title: 'Error fetching settings',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (content) => {
    setSettings(prev => ({ ...prev, importantInstruction: content }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setSettings(prev => ({ ...prev, [type]: file }));
      setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      
      // Append all fields
      Object.keys(settings).forEach(key => {
        if (settings[key] !== null) {
          formData.append(key, settings[key]);
        }
      });

      const { data } = await axios.put(`${API_BASE_URL}/settings`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        toast({
          title: 'Settings updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchSettings();
      }
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Flex h="80vh" align="center" justify="center">
        <Spinner size="xl" color={BRAND} thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box pb="10">
      <PageHeader title="Web Settings" breadcrumb="Web Settings" />

      <Box bg="white" borderRadius="xl" overflow="hidden" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
        <Tabs variant="unstyled">
          <TabList bg="#f8faff" px="4" pt="3" borderBottom="2px solid #e8edf5" gap="1" display="flex" overflowX="auto" sx={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            {[{ icon: Globe, label: 'General Settings' }, { icon: MapPin, label: 'Address Settings' }, { icon: Share2, label: 'Social Media Settings' }].map(({ icon, label }) => (
              <Tab key={label}
                _selected={{ color: BRAND, bg: 'white', borderBottom: `2px solid ${BRAND}`, mb: '-2px' }}
                borderRadius="lg lg 0 0" px="5" py="3" fontSize="sm" fontWeight="600" color="#64748b"
                display="flex" alignItems="center" gap="2" transition="all 0.18s" whiteSpace="nowrap" flexShrink={0}>
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
                  <FormControl>
                    <FormLabel {...labelStyle}>Site Name</FormLabel>
                    <Input {...inputStyle} name="siteName" value={settings.siteName} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel {...labelStyle}>Company Email</FormLabel>
                    <Input {...inputStyle} name="companyEmail" value={settings.companyEmail} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel {...labelStyle}>Contact Number</FormLabel>
                    <Input {...inputStyle} name="contactNumber" value={settings.contactNumber} onChange={handleInputChange} />
                  </FormControl>
                  <SimpleGrid columns={2} spacing="4">
                    <FormControl>
                      <FormLabel {...labelStyle}>Logo</FormLabel>
                      <VStack align="start" spacing="2">
                        <input type="file" hidden ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" />
                        <Button size="xs" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" leftIcon={<Upload size={12} />} _hover={{ borderColor: BRAND, color: BRAND }} onClick={() => logoInputRef.current.click()}>Upload</Button>
                        {previews.logo && <Image src={previews.logo} h="36px" bg="white" p="1" borderRadius="md" border="1px solid #e8edf5" />}
                      </VStack>
                    </FormControl>
                    <FormControl>
                      <FormLabel {...labelStyle}>Favicon</FormLabel>
                      <VStack align="start" spacing="2">
                        <input type="file" hidden ref={faviconInputRef} onChange={(e) => handleFileChange(e, 'favicon')} accept="image/*" />
                        <Button size="xs" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" leftIcon={<Upload size={12} />} _hover={{ borderColor: BRAND, color: BRAND }} onClick={() => faviconInputRef.current.click()}>Upload</Button>
                        {previews.favicon && <Image src={previews.favicon} w="32px" h="32px" bg="#f8faff" borderRadius="md" border="1px solid #e8edf5" />}
                      </VStack>
                    </FormControl>
                  </SimpleGrid>
                </SimpleGrid>
                <Flex pt="4">
                  <Button isLoading={saving} onClick={handleSave} leftIcon={<Save size={15} />} bg={BRAND} color="white" size="sm" px="6" borderRadius="lg" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Save Changes</Button>
                </Flex>
              </VStack>
            </TabPanel>

            {/* Address Settings */}
            <TabPanel p="0">
              <VStack align="stretch" spacing="6">
                <SectionTitle>Contact & Legal</SectionTitle>
                <FormControl>
                  <FormLabel {...labelStyle}>Full Address</FormLabel>
                  <Textarea {...inputStyle} name="fullAddress" value={settings.fullAddress} onChange={handleInputChange} minH="90px" />
                </FormControl>
                <FormControl>
                  <FormLabel {...labelStyle}>Copyright Text</FormLabel>
                  <Input {...inputStyle} name="copyrightText" value={settings.copyrightText} onChange={handleInputChange} />
                </FormControl>
                <FormControl>
                  <FormLabel {...labelStyle}>Google Map Script</FormLabel>
                  <Textarea {...inputStyle} name="googleMapScript" value={settings.googleMapScript} onChange={handleInputChange} placeholder="Paste your iframe code here..." minH="110px" />
                </FormControl>
                <Flex pt="4">
                  <Button isLoading={saving} onClick={handleSave} leftIcon={<Save size={15} />} bg={BRAND} color="white" size="sm" px="6" borderRadius="lg" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Update Address</Button>
                </Flex>
              </VStack>
            </TabPanel>

            {/* Social Media Settings */}
            <TabPanel p="0">
              <VStack align="stretch" spacing="6">
                <SectionTitle>Social Media Links</SectionTitle>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing="5">
                  <FormControl><FormLabel {...labelStyle}>Facebook URL</FormLabel><Input {...inputStyle} name="facebookUrl" value={settings.facebookUrl} onChange={handleInputChange} /></FormControl>
                  <FormControl><FormLabel {...labelStyle}>Instagram URL</FormLabel><Input {...inputStyle} name="instagramUrl" value={settings.instagramUrl} onChange={handleInputChange} /></FormControl>
                  <FormControl><FormLabel {...labelStyle}>Twitter URL</FormLabel><Input {...inputStyle} name="twitterUrl" value={settings.twitterUrl} onChange={handleInputChange} /></FormControl>
                  <FormControl><FormLabel {...labelStyle}>LinkedIn URL</FormLabel><Input {...inputStyle} name="linkedinUrl" value={settings.linkedinUrl} onChange={handleInputChange} /></FormControl>
                  <FormControl><FormLabel {...labelStyle}>YouTube URL</FormLabel><Input {...inputStyle} name="youtubeUrl" value={settings.youtubeUrl} onChange={handleInputChange} /></FormControl>
                </SimpleGrid>
                <FormControl>
                  <FormLabel {...labelStyle}>Important Instruction</FormLabel>
                  <Box bg="white" borderRadius="lg" overflow="hidden" border="1.5px solid #dde6f5">
                    <ReactQuill theme="snow" value={settings.importantInstruction} onChange={handleQuillChange} />
                  </Box>
                </FormControl>
                <FormControl>
                  <FormLabel {...labelStyle}>Reschedule Message</FormLabel>
                  <Textarea {...inputStyle} name="rescheduleMessage" value={settings.rescheduleMessage} onChange={handleInputChange} minH="90px" />
                </FormControl>
                <Flex pt="4">
                  <Button isLoading={saving} onClick={handleSave} leftIcon={<Save size={15} />} bg={BRAND} color="white" size="sm" px="6" borderRadius="lg" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Update Settings</Button>
                </Flex>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      <PageFooter />
    </Box>
  );
};

export default WebSettings;
