import { useState, useEffect, useRef, useMemo } from 'react';
import { Box, VStack, HStack, Text, Icon, Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Input, SimpleGrid, Image, Flex, Textarea, Button, useToast, Spinner, Select, Badge } from '@chakra-ui/react';
import { Globe, MapPin, Share2, Save, Upload, ClipboardList, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { PageHeader, PageFooter, BRAND, inputStyle, labelStyle } from '../components/ui';

import API_BASE_URL from '../apiConfig';

const SectionTitle = ({ children }) => (
  <HStack spacing="3" mb="5">
    <Box w="3px" h="18px" bg={BRAND} borderRadius="full" />
    <Text fontSize="sm" fontWeight="700" color="#1e293b">{children}</Text>
  </HStack>
);

const WebSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('');
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
    favicon: null,
    responsibilities: {},
    appVersion: {
      latestVersion: '1.0.7',
      latestBuildNumber: 8,
      minRequiredVersion: '1.0.7',
      minRequiredBuildNumber: 8,
      forceUpdate: true,
      title: 'New Update Available! 🚀',
      message: 'A new version of ZomoCook is available on the Play Store. Please update now to continue using the app.',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=digi.coders.zomocook'
    }
  });

  const [previews, setPreviews] = useState({
    logo: null,
    favicon: null
  });

  const logoInputRef = useRef();
  const faviconInputRef = useRef();
  const toast = useToast();

  const [masterCategories, setMasterCategories] = useState([]);
  const [willDoText, setWillDoText] = useState('');
  const [willNotDoText, setWillNotDoText] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [settingsRes, mastersRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/settings`, { headers }),
        axios.get(`${API_BASE_URL}/masters/job-categories`, { headers })
      ]);

      if (mastersRes.status === 'fulfilled' && mastersRes.value.data?.success) {
        setMasterCategories(mastersRes.value.data.masters || mastersRes.value.data.data || []);
      }

      if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.success) {
        const data = settingsRes.value.data;
        const fetchedSettings = data.settings || {};
        setSettings({
          ...fetchedSettings,
          logo: null,
          favicon: null,
          appVersion: fetchedSettings.appVersion || {
            latestVersion: '1.0.7',
            latestBuildNumber: 8,
            minRequiredVersion: '1.0.7',
            minRequiredBuildNumber: 8,
            forceUpdate: true,
            title: 'New Update Available! 🚀',
            message: 'A new version of ZomoCook is available on the Play Store. Please update now to continue using the app.',
            playStoreUrl: 'https://play.google.com/store/apps/details?id=digi.coders.zomocook'
          }
        });
        const serverBaseUrl = API_BASE_URL.replace('/api', '');
        setPreviews({
          logo: fetchedSettings.logo ? `${serverBaseUrl}/${fetchedSettings.logo.replace(/\\/g, '/')}` : null,
          favicon: fetchedSettings.favicon ? `${serverBaseUrl}/${fetchedSettings.favicon.replace(/\\/g, '/')}` : null
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

  const handleAppVersionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      appVersion: {
        ...prev.appVersion,
        [name]: type === 'checkbox' ? checked : (name.includes('Build') ? parseInt(value) || 0 : value)
      }
    }));
  };

  const handleQuillChange = (content) => {
    setSettings(prev => ({ ...prev, importantInstruction: content }));
  };

  const getLegacyKeyForCategory = (name) => {
    if (!name) return null;
    const lower = name.toLowerCase();
    if (lower.includes('kitchen') || lower.includes('chef')) return 'chef';
    if (lower.includes('domestic') || lower.includes('home cook') || (lower.includes('cook') && !lower.includes('kitchen'))) return 'cook';
    if (lower.includes('waiter') || lower.includes('service') || lower.includes('steward')) return 'waiter';
    if (lower.includes('dishwasher') || lower.includes('housekeeping') || lower.includes('cleaning')) return 'dishwasher';
    if (lower.includes('sitter') || lower.includes('nanny') || lower.includes('baby')) return 'sitter';
    if (lower.includes('helper') || lower.includes('assistant')) return 'helper';
    return null;
  };

  const findCategoryResponsibilities = (catKey, catName, respObj) => {
    if (!respObj || typeof respObj !== 'object') return null;

    // 1. Direct match by key (e.g. _id)
    if (catKey && respObj[catKey]) {
      return respObj[catKey];
    }

    if (catName) {
      // 2. Direct match by exact name
      if (respObj[catName]) return respObj[catName];

      // 3. Match by normalized slug
      const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      if (respObj[slug]) return respObj[slug];

      // 4. Match by displayName in stored objects
      const lowerName = catName.toLowerCase();
      for (const [, v] of Object.entries(respObj)) {
        if (v && typeof v === 'object') {
          const dName = (v.displayName || '').toLowerCase();
          if (dName && (dName === lowerName || lowerName.includes(dName) || dName.includes(lowerName))) {
            return v;
          }
        }
      }

      // 5. Match by legacy key (chef, cook, waiter, dishwasher, sitter, helper)
      const legacyKey = getLegacyKeyForCategory(catName);
      if (legacyKey && respObj[legacyKey]) {
        return respObj[legacyKey];
      }
    }

    return null;
  };

  // Build dynamic category list directly from Master Job Categories
  const categoryOptions = useMemo(() => {
    const list = [];
    const seen = new Set();

    if (masterCategories && masterCategories.length > 0) {
      masterCategories.forEach(m => {
        if (!m || m.status === 'inactive') return;
        const name = (m.name || '').trim();
        if (!name || seen.has(name.toLowerCase())) return;
        seen.add(name.toLowerCase());
        list.push({
          key: m._id || name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          id: m._id,
          name: name,
          value: m.value
        });
      });
    }

    // Fallback only if no master categories exist
    if (list.length === 0) {
      const standardCategories = [
        { key: 'chef', id: 'chef', name: 'Chef / Kitchen Staff' },
        { key: 'cook', id: 'cook', name: 'Home Cook / Cook' },
        { key: 'helper', id: 'helper', name: 'Kitchen Helper / Assistant' },
        { key: 'waiter', id: 'waiter', name: 'Waiter / Steward' },
        { key: 'dishwasher', id: 'dishwasher', name: 'Dishwasher / Utility Staff' },
        { key: 'sitter', id: 'sitter', name: 'Baby Sitter / Nanny' }
      ];
      return standardCategories;
    }

    return list;
  }, [masterCategories]);

  // Auto-sync selected category if current key is invalid or not in list
  useEffect(() => {
    if (categoryOptions.length > 0) {
      const exists = categoryOptions.some(c => c.key === selectedCategoryKey);
      if (!exists) {
        setSelectedCategoryKey(categoryOptions[0].key);
      }
    }
  }, [categoryOptions, selectedCategoryKey]);

  // Update textareas whenever selectedCategoryKey or settings.responsibilities changes
  useEffect(() => {
    if (!selectedCategoryKey) return;
    const currentCat = categoryOptions.find(c => c.key === selectedCategoryKey);
    const catData = findCategoryResponsibilities(selectedCategoryKey, currentCat?.name, settings.responsibilities);
    setWillDoText(catData?.willDo?.join('\n') || '');
    setWillNotDoText(catData?.willNotDo?.join('\n') || '');
  }, [selectedCategoryKey, settings.responsibilities, categoryOptions]);

  const handleCategoryChange = (newKey) => {
    if (selectedCategoryKey) {
      const currentCat = categoryOptions.find(c => c.key === selectedCategoryKey);
      const catName = currentCat?.name || selectedCategoryKey;
      const currentWillDo = willDoText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const currentWillNotDo = willNotDoText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      const entry = {
        displayName: catName,
        categoryName: catName,
        categoryId: currentCat?.id || selectedCategoryKey,
        willDo: currentWillDo,
        willNotDo: currentWillNotDo
      };

      setSettings(prev => {
        const updatedResp = { ...prev.responsibilities || {} };
        updatedResp[selectedCategoryKey] = entry;
        const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        updatedResp[slug] = entry;
        const legacy = getLegacyKeyForCategory(catName);
        if (legacy) updatedResp[legacy] = entry;
        return { ...prev, responsibilities: updatedResp };
      });
    }

    setSelectedCategoryKey(newKey);
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setSettings(prev => ({ ...prev, [fieldName]: file }));
      setPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();

      const currentCat = categoryOptions.find(c => c.key === selectedCategoryKey);
      const catName = currentCat?.name || selectedCategoryKey;
      const currentWillDo = willDoText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const currentWillNotDo = willNotDoText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      const updatedResp = { ...settings.responsibilities || {} };
      if (selectedCategoryKey) {
        const entry = {
          displayName: catName,
          categoryName: catName,
          categoryId: currentCat?.id || selectedCategoryKey,
          willDo: currentWillDo,
          willNotDo: currentWillNotDo
        };
        updatedResp[selectedCategoryKey] = entry;
        const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        updatedResp[slug] = entry;
        const legacy = getLegacyKeyForCategory(catName);
        if (legacy) updatedResp[legacy] = entry;
      }

      // Append all fields
      Object.keys(settings).forEach(key => {
        if (settings[key] !== null && settings[key] !== undefined) {
          if (key === 'responsibilities') {
            formData.append(key, JSON.stringify(updatedResp));
          } else if (key === 'appVersion') {
            formData.append(key, JSON.stringify(settings.appVersion));
          } else {
            formData.append(key, settings[key]);
          }
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
          title: 'Settings updated successfully!',
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
            {[{ icon: Globe, label: 'General Settings' }, { icon: MapPin, label: 'Address Settings' }, { icon: Share2, label: 'Social Media Settings' }, { icon: ClipboardList, label: 'Responsibilities' }, { icon: Globe, label: 'App Update Settings' }].map(({ icon, label }) => (
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
                        {previews.favicon && <Image src={previews.favicon} h="36px" bg="white" p="1" borderRadius="md" border="1px solid #e8edf5" />}
                      </VStack>
                    </FormControl>
                  </SimpleGrid>
                </SimpleGrid>
                <Flex pt="4">
                  <Button isLoading={saving} onClick={handleSave} leftIcon={<Save size={15} />} bg={BRAND} color="white" size="sm" px="6" borderRadius="lg" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Update Settings</Button>
                </Flex>
              </VStack>
            </TabPanel>

            {/* Address Settings */}
            <TabPanel p="0">
              <VStack align="stretch" spacing="6">
                <SectionTitle>Location & Legal</SectionTitle>
                <FormControl>
                  <FormLabel {...labelStyle}>Full Address</FormLabel>
                  <Textarea {...inputStyle} name="fullAddress" value={settings.fullAddress} onChange={handleInputChange} minH="80px" />
                </FormControl>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="5">
                  <FormControl>
                    <FormLabel {...labelStyle}>Copyright Text</FormLabel>
                    <Input {...inputStyle} name="copyrightText" value={settings.copyrightText} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel {...labelStyle}>Google Map iFrame Script</FormLabel>
                    <Textarea {...inputStyle} name="googleMapScript" value={settings.googleMapScript} onChange={handleInputChange} minH="80px" />
                  </FormControl>
                </SimpleGrid>
                <Flex pt="4">
                  <Button isLoading={saving} onClick={handleSave} leftIcon={<Save size={15} />} bg={BRAND} color="white" size="sm" px="6" borderRadius="lg" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Update Settings</Button>
                </Flex>
              </VStack>
            </TabPanel>

            {/* Social Media Settings */}
            <TabPanel p="0">
              <VStack align="stretch" spacing="6">
                <SectionTitle>Social Links & Instructions</SectionTitle>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="5">
                  <FormControl>
                    <FormLabel {...labelStyle}>Facebook URL</FormLabel>
                    <Input {...inputStyle} name="facebookUrl" value={settings.facebookUrl} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel {...labelStyle}>Instagram URL</FormLabel>
                    <Input {...inputStyle} name="instagramUrl" value={settings.instagramUrl} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel {...labelStyle}>Twitter URL</FormLabel>
                    <Input {...inputStyle} name="twitterUrl" value={settings.twitterUrl} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel {...labelStyle}>LinkedIn URL</FormLabel>
                    <Input {...inputStyle} name="linkedinUrl" value={settings.linkedinUrl} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel {...labelStyle}>YouTube URL</FormLabel>
                    <Input {...inputStyle} name="youtubeUrl" value={settings.youtubeUrl} onChange={handleInputChange} />
                  </FormControl>
                </SimpleGrid>
                <FormControl>
                  <FormLabel {...labelStyle}>Important Instruction (Rich Text)</FormLabel>
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

            {/* Responsibilities Settings */}
            <TabPanel p="0">
              <VStack align="stretch" spacing="6">
                <Flex justify="space-between" align="center" flexWrap="wrap" gap="2">
                  <SectionTitle>Category Responsibilities (What staff will do / NOT do)</SectionTitle>
                  <Button 
                    as={Link} 
                    to="/masters/job-categories" 
                    size="xs" 
                    variant="outline" 
                    colorScheme="blue" 
                    leftIcon={<ExternalLink size={13} />} 
                    borderRadius="md"
                    _hover={{ bg: 'blue.50' }}
                  >
                    Manage Master Job Categories
                  </Button>
                </Flex>
                
                <FormControl maxW="450px">
                  <HStack justify="space-between" mb="1.5">
                    <FormLabel {...labelStyle} mb="0">Select Job Category (From Masters)</FormLabel>
                    <Badge colorScheme="blue" fontSize="2xs" px="2" py="0.5" borderRadius="full">
                      {categoryOptions.length} Categories
                    </Badge>
                  </HStack>
                  <Select 
                    {...inputStyle} 
                    value={selectedCategoryKey} 
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    {categoryOptions.map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.name}</option>
                    ))}
                  </Select>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="5">
                  <FormControl>
                    <FormLabel {...labelStyle} color="green.600" fontWeight="bold">What staff will do (One item per line)</FormLabel>
                    <Textarea 
                      {...inputStyle} 
                      borderColor="green.200"
                      _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px green.400" }}
                      value={willDoText} 
                      onChange={(e) => setWillDoText(e.target.value)} 
                      placeholder="Enter each task on a new line..."
                      minH="250px" 
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel {...labelStyle} color="red.600" fontWeight="bold">What staff will NOT do (One item per line)</FormLabel>
                    <Textarea 
                      {...inputStyle} 
                      borderColor="red.200"
                      _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px red.400" }}
                      value={willNotDoText} 
                      onChange={(e) => setWillNotDoText(e.target.value)} 
                      placeholder="Enter each restriction on a new line..."
                      minH="250px" 
                    />
                  </FormControl>
                </SimpleGrid>

                <Flex pt="4">
                  <Button 
                    isLoading={saving} 
                    onClick={handleSave} 
                    leftIcon={<Save size={15} />} 
                    bg={BRAND} 
                    color="white" 
                    size="sm" 
                    px="6" 
                    borderRadius="lg" 
                    _hover={{ bg: '#003d91' }} 
                    boxShadow={`0 4px 12px ${BRAND}30`}
                  >
                    Save Responsibilities
                  </Button>
                </Flex>
              </VStack>
            </TabPanel>

            {/* App Update Settings */}
            <TabPanel p="0">
              <VStack align="stretch" spacing="6">
                <SectionTitle>Mobile App Version & Force Update Settings</SectionTitle>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="5">
                  <FormControl>
                    <FormLabel {...labelStyle}>Latest App Version (e.g. 1.0.8)</FormLabel>
                    <Input {...inputStyle} name="latestVersion" value={settings.appVersion?.latestVersion || ''} onChange={handleAppVersionChange} placeholder="1.0.8" />
                  </FormControl>
                  <FormControl>
                    <FormLabel {...labelStyle}>Latest Build Number (e.g. 9)</FormLabel>
                    <Input {...inputStyle} type="number" name="latestBuildNumber" value={settings.appVersion?.latestBuildNumber || ''} onChange={handleAppVersionChange} placeholder="9" />
                  </FormControl>
                  <FormControl>
                    <FormLabel {...labelStyle}>Minimum Required Version (e.g. 1.0.8)</FormLabel>
                    <Input {...inputStyle} name="minRequiredVersion" value={settings.appVersion?.minRequiredVersion || ''} onChange={handleAppVersionChange} placeholder="1.0.8" />
                  </FormControl>
                  <FormControl>
                    <FormLabel {...labelStyle}>Force Update Required?</FormLabel>
                    <Select {...inputStyle} name="forceUpdate" value={settings.appVersion?.forceUpdate ? 'true' : 'false'} onChange={(e) => setSettings(prev => ({ ...prev, appVersion: { ...prev.appVersion, forceUpdate: e.target.value === 'true' } }))}>
                      <option value="true">Yes (Mandatory Update - Cannot close popup)</option>
                      <option value="false">No (Optional Update - Can dismiss popup)</option>
                    </Select>
                  </FormControl>
                  <FormControl gridColumn={{ md: 'span 2' }}>
                    <FormLabel {...labelStyle}>Update Popup Title</FormLabel>
                    <Input {...inputStyle} name="title" value={settings.appVersion?.title || ''} onChange={handleAppVersionChange} placeholder="New Update Available! 🚀" />
                  </FormControl>
                  <FormControl gridColumn={{ md: 'span 2' }}>
                    <FormLabel {...labelStyle}>Update Popup Message</FormLabel>
                    <Textarea {...inputStyle} name="message" value={settings.appVersion?.message || ''} onChange={handleAppVersionChange} minH="80px" placeholder="A new version of ZomoCook is available on the Play Store..." />
                  </FormControl>
                  <FormControl gridColumn={{ md: 'span 2' }}>
                    <FormLabel {...labelStyle}>Google Play Store URL</FormLabel>
                    <Input {...inputStyle} name="playStoreUrl" value={settings.appVersion?.playStoreUrl || ''} onChange={handleAppVersionChange} placeholder="https://play.google.com/store/apps/details?id=digi.coders.zomocook" />
                  </FormControl>
                </SimpleGrid>
                <Flex pt="4">
                  <Button isLoading={saving} onClick={handleSave} leftIcon={<Save size={15} />} bg={BRAND} color="white" size="sm" px="6" borderRadius="lg" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Save App Version Settings</Button>
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
