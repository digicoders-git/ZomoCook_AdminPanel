import React, { useState } from 'react';
import {
  Box, FormControl, FormLabel, Input, Select, Textarea, HStack, Button,
  SimpleGrid, CheckboxGroup, Checkbox, Wrap, WrapItem, Text, Divider, Tag,
  TagLabel, TagCloseButton, Flex
} from '@chakra-ui/react';
import { Send, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { PageHeader, FormCard, PageFooter, BRAND, ACCENT, inputStyle, selectStyle, labelStyle } from '../components/ui';
import axios from 'axios';

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh'
];

const JOB_CATEGORIES = ['hotel', 'home', 'daily'];
const SERVICE_CATEGORIES = ['Full Time', 'Part Time', 'Live-in', 'Event Cook', 'Tiffin Service'];

const TagInput = ({ placeholder, tags, onAdd, onRemove }) => {
  const [input, setInput] = useState('');
  const handleKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) onAdd(input.trim());
      setInput('');
    }
  };
  return (
    <Box border="1.5px solid #dde6f5" borderRadius="lg" bg="#f8faff" p="2" minH="42px">
      <Flex wrap="wrap" gap="1.5" align="center">
        {tags.map(t => (
          <Tag key={t} size="sm" bg="#e6eeff" color={BRAND} borderRadius="full">
            <TagLabel>{t}</TagLabel>
            <TagCloseButton onClick={() => onRemove(t)} />
          </Tag>
        ))}
        <Input
          variant="unstyled"
          size="sm"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          fontSize="sm"
          color="#1e293b"
          minW="120px"
          flex="1"
          _placeholder={{ color: '#94a3b8' }}
        />
      </Flex>
    </Box>
  );
};

const INITIAL = {
  title: '', message: '', target: 'all', status: 'active',
  targetRegions: [], targetJobCategories: [], targetServiceCategories: []
};

const AddNotification = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL);
  const [image, setImage] = useState(null);
  const [cityInput, setCityInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleItem = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const addRegion = (val) => {
    if (!formData.targetRegions.includes(val))
      setFormData(prev => ({ ...prev, targetRegions: [...prev.targetRegions, val] }));
  };

  const removeRegion = (val) => {
    setFormData(prev => ({ ...prev, targetRegions: prev.targetRegions.filter(r => r !== val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const data = new FormData();
      data.append('title', formData.title);
      data.append('message', formData.message);
      data.append('target', formData.target);
      data.append('status', formData.status);
      data.append('targetRegions', JSON.stringify(formData.targetRegions));
      data.append('targetJobCategories', JSON.stringify(formData.targetJobCategories));
      data.append('targetServiceCategories', JSON.stringify(formData.targetServiceCategories));
      if (image) data.append('image', image);

      const response = await axios.post(`${apiUrl}/notifications`, data, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast({ title: 'Success', description: 'Notification created.', status: 'success' });
        navigate('/notifications/list');
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const isSelectiveTarget = formData.target === 'candidates' || formData.target === 'all';

  return (
    <Box pb="10">
      <PageHeader title="Add Notification Record" breadcrumb="Add Notification Record" />
      <form onSubmit={handleSubmit}>
        <FormCard headerTitle="New Notification Details" backTo="/notifications/list">
          <Box display="flex" flexDirection="column" gap="5">

            {/* Title & Message */}
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Notification Title</FormLabel>
              <Input name="title" value={formData.title} onChange={handleChange} placeholder="Enter Title" {...inputStyle} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel {...labelStyle}>Short Detail</FormLabel>
              <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Enter Short Detail" {...inputStyle} minH="110px" />
            </FormControl>

            {/* Image, Target, Status */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing="5">
              <FormControl>
                <FormLabel {...labelStyle}>Attachment Image</FormLabel>
                <Input type="file" p="1" {...inputStyle} onChange={(e) => setImage(e.target.files[0])} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel {...labelStyle}>Target Audience</FormLabel>
                <Select name="target" value={formData.target} onChange={handleChange} {...selectStyle}>
                  <option value="all">Both (Cooks + Customers)</option>
                  <option value="candidates">Only Cooks (Join as Cook)</option>
                  <option value="customers">Only Customers (Book a Chef)</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel {...labelStyle}>Status</FormLabel>
                <Select name="status" value={formData.status} onChange={handleChange} {...selectStyle}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <Divider borderColor="#e8edf5" />

            {/* Region Wise */}
            <Box>
              <Text fontSize="xs" fontWeight="700" color="#475569" textTransform="uppercase" letterSpacing="0.8px" mb="3">
                🌍 Region Wise Targeting
                <Text as="span" fontSize="10px" fontWeight="400" color="#94a3b8" ml="2" textTransform="none">(leave empty = send to all regions)</Text>
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                <FormControl>
                  <FormLabel {...labelStyle}>Select States</FormLabel>
                  <Select
                    placeholder="-- Select a State --"
                    {...selectStyle}
                    onChange={e => { if (e.target.value) addRegion(e.target.value); e.target.value = ''; }}
                  >
                    {INDIA_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                  <Box mt="2">
                    <Wrap spacing="1.5">
                      {formData.targetRegions.filter(r => INDIA_STATES.includes(r)).map(r => (
                        <WrapItem key={r}>
                          <Tag size="sm" bg="#e6eeff" color={BRAND} borderRadius="full">
                            <TagLabel>{r}</TagLabel>
                            <TagCloseButton onClick={() => removeRegion(r)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                </FormControl>
                <FormControl>
                  <FormLabel {...labelStyle}>Add Cities (type & press Enter)</FormLabel>
                  <TagInput
                    placeholder="e.g. Lucknow, Delhi..."
                    tags={formData.targetRegions.filter(r => !INDIA_STATES.includes(r))}
                    onAdd={addRegion}
                    onRemove={removeRegion}
                  />
                </FormControl>
              </SimpleGrid>
            </Box>

            <Divider borderColor="#e8edf5" />

            {/* Job Category Wise */}
            <Box>
              <Text fontSize="xs" fontWeight="700" color="#475569" textTransform="uppercase" letterSpacing="0.8px" mb="3">
                👨‍🍳 Job Category Wise
                <Text as="span" fontSize="10px" fontWeight="400" color="#94a3b8" ml="2" textTransform="none">(leave empty = all categories)</Text>
              </Text>
              <Wrap spacing="3">
                {JOB_CATEGORIES.map(cat => (
                  <WrapItem key={cat}>
                    <Box
                      as="button"
                      type="button"
                      px="4" py="2"
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="600"
                      border="1.5px solid"
                      borderColor={formData.targetJobCategories.includes(cat) ? BRAND : '#dde6f5'}
                      bg={formData.targetJobCategories.includes(cat) ? '#e6eeff' : '#f8faff'}
                      color={formData.targetJobCategories.includes(cat) ? BRAND : '#64748b'}
                      onClick={() => toggleItem('targetJobCategories', cat)}
                      transition="all 0.15s"
                      _hover={{ borderColor: BRAND, color: BRAND }}
                      textTransform="capitalize"
                    >
                      {cat === 'hotel' ? '🏨 Hotel/Restaurant' : cat === 'home' ? '🏠 Home Cook' : '📅 Daily Job'}
                    </Box>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            <Divider borderColor="#e8edf5" />

            {/* Service Category Wise */}
            <Box>
              <Text fontSize="xs" fontWeight="700" color="#475569" textTransform="uppercase" letterSpacing="0.8px" mb="3">
                🛎️ Service Category Wise
                <Text as="span" fontSize="10px" fontWeight="400" color="#94a3b8" ml="2" textTransform="none">(leave empty = all services)</Text>
              </Text>
              <Wrap spacing="3">
                {SERVICE_CATEGORIES.map(cat => (
                  <WrapItem key={cat}>
                    <Box
                      as="button"
                      type="button"
                      px="4" py="2"
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="600"
                      border="1.5px solid"
                      borderColor={formData.targetServiceCategories.includes(cat) ? ACCENT : '#dde6f5'}
                      bg={formData.targetServiceCategories.includes(cat) ? '#fff7ed' : '#f8faff'}
                      color={formData.targetServiceCategories.includes(cat) ? ACCENT : '#64748b'}
                      onClick={() => toggleItem('targetServiceCategories', cat)}
                      transition="all 0.15s"
                      _hover={{ borderColor: ACCENT, color: ACCENT }}
                    >
                      {cat}
                    </Box>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            {/* Summary */}
            {(formData.targetRegions.length > 0 || formData.targetJobCategories.length > 0 || formData.targetServiceCategories.length > 0) && (
              <Box bg="#f0f5ff" border="1px solid #c7d9f8" borderRadius="lg" p="3">
                <Text fontSize="xs" fontWeight="700" color={BRAND} mb="1.5">📋 Targeting Summary</Text>
                {formData.targetRegions.length > 0 && (
                  <Text fontSize="xs" color="#475569">🌍 Regions: <b>{formData.targetRegions.join(', ')}</b></Text>
                )}
                {formData.targetJobCategories.length > 0 && (
                  <Text fontSize="xs" color="#475569">👨‍🍳 Job Categories: <b>{formData.targetJobCategories.join(', ')}</b></Text>
                )}
                {formData.targetServiceCategories.length > 0 && (
                  <Text fontSize="xs" color="#475569">🛎️ Service Categories: <b>{formData.targetServiceCategories.join(', ')}</b></Text>
                )}
              </Box>
            )}

            <HStack justify="flex-end" spacing="3" pt="2">
              <Button
                leftIcon={<RotateCcw size={14} />}
                variant="outline"
                borderColor="#dde6f5"
                color="#64748b"
                borderRadius="lg"
                size="sm"
                _hover={{ borderColor: BRAND, color: BRAND }}
                onClick={() => { setFormData(INITIAL); setImage(null); }}
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                leftIcon={<Send size={14} />}
                bg={BRAND}
                color="white"
                borderRadius="lg"
                size="sm"
                px="6"
                _hover={{ bg: '#003d91' }}
                boxShadow={`0 4px 12px ${BRAND}30`}
              >
                Create Notification
              </Button>
            </HStack>
          </Box>
        </FormCard>
      </form>
      <PageFooter />
    </Box>
  );
};

export default AddNotification;
