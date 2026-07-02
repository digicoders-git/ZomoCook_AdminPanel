import React, { useState, useRef, useEffect } from 'react';
import {
  Box, FormControl, FormLabel, Input, Select, Textarea, HStack, Button,
  SimpleGrid, Wrap, WrapItem, Text, Divider, Tag, TagLabel, TagCloseButton, Flex, Icon
} from '@chakra-ui/react';
import { Send, RotateCcw, MapPin, Briefcase, Settings, FileText, ChevronDown, X, Check } from 'lucide-react';
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

const JOB_CATEGORIES = [
  { value: 'hotel', label: 'Hotel / Restaurant' },
  { value: 'home', label: 'Home Cook' },
  { value: 'daily', label: 'Daily Job' },
];

const SERVICE_CATEGORIES = ['Full Time', 'Part Time', 'Live-in', 'Event Cook', 'Tiffin Service'];

// Searchable dropdown for states
const SearchableStateDropdown = ({ selected, onAdd, onRemove }) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const filtered = INDIA_STATES.filter(s =>
    s.toLowerCase().includes(search.toLowerCase()) && !selected.includes(s)
  );

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <Box ref={ref} position="relative">
      <Flex
        align="center"
        bg="#f8faff"
        border="1.5px solid #dde6f5"
        borderRadius="lg"
        px="3"
        py="2"
        cursor="pointer"
        onClick={() => setOpen(o => !o)}
        _hover={{ borderColor: BRAND }}
        justify="space-between"
      >
        <Flex align="center" gap="2">
          <Icon as={MapPin} size={14} color="#94a3b8" />
          <Input
            variant="unstyled"
            fontSize="sm"
            placeholder="Search state..."
            value={search}
            onChange={e => { setSearch(e.target.value); setOpen(true); }}
            onClick={e => { e.stopPropagation(); setOpen(true); }}
            color="#1e293b"
            _placeholder={{ color: '#94a3b8' }}
          />
        </Flex>
        <Icon as={ChevronDown} size={14} color="#94a3b8" />
      </Flex>

      {open && filtered.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left="0"
          right="0"
          zIndex="100"
          bg="white"
          border="1.5px solid #dde6f5"
          borderRadius="lg"
          boxShadow="0 8px 24px rgba(0,74,173,0.10)"
          maxH="200px"
          overflowY="auto"
          mt="1"
        >
          {filtered.map(s => (
            <Flex
              key={s}
              px="3" py="2"
              fontSize="sm"
              color="#1e293b"
              cursor="pointer"
              align="center"
              gap="2"
              _hover={{ bg: '#f0f5ff', color: BRAND }}
              onClick={() => { onAdd(s); setSearch(''); setOpen(false); }}
            >
              <Icon as={MapPin} size={12} color={BRAND} />
              {s}
            </Flex>
          ))}
        </Box>
      )}

      {selected.filter(r => INDIA_STATES.includes(r)).length > 0 && (
        <Wrap spacing="1.5" mt="2">
          {selected.filter(r => INDIA_STATES.includes(r)).map(r => (
            <WrapItem key={r}>
              <Tag size="sm" bg="#e6eeff" color={BRAND} borderRadius="full">
                <TagLabel>{r}</TagLabel>
                <TagCloseButton onClick={() => onRemove(r)} />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      )}
    </Box>
  );
};

// City tag input
const CityTagInput = ({ tags, onAdd, onRemove }) => {
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
        <Icon as={MapPin} size={14} color="#94a3b8" mt="1" />
        {tags.map(t => (
          <Tag key={t} size="sm" bg="#e6eeff" color={BRAND} borderRadius="full">
            <TagLabel>{t}</TagLabel>
            <TagCloseButton onClick={() => onRemove(t)} />
          </Tag>
        ))}
        <Input
          variant="unstyled"
          size="sm"
          placeholder="Type city & press Enter..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          fontSize="sm"
          color="#1e293b"
          minW="140px"
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
              <HStack mb="3" spacing="2">
                <Icon as={MapPin} size={15} color={BRAND} />
                <Text fontSize="xs" fontWeight="700" color="#475569" textTransform="uppercase" letterSpacing="0.8px">
                  Region Wise Targeting
                </Text>
                <Text fontSize="10px" fontWeight="400" color="#94a3b8">(leave empty = all regions)</Text>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                <FormControl>
                  <FormLabel {...labelStyle}>Search & Select States</FormLabel>
                  <SearchableStateDropdown
                    selected={formData.targetRegions}
                    onAdd={addRegion}
                    onRemove={removeRegion}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel {...labelStyle}>Add Cities (press Enter)</FormLabel>
                  <CityTagInput
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
              <HStack mb="3" spacing="2">
                <Icon as={Briefcase} size={15} color={BRAND} />
                <Text fontSize="xs" fontWeight="700" color="#475569" textTransform="uppercase" letterSpacing="0.8px">
                  Job Category Wise
                </Text>
                <Text fontSize="10px" fontWeight="400" color="#94a3b8">(leave empty = all categories)</Text>
              </HStack>
              <Wrap spacing="3">
                {JOB_CATEGORIES.map(cat => {
                  const active = formData.targetJobCategories.includes(cat.value);
                  return (
                    <WrapItem key={cat.value}>
                      <Flex
                        as="button"
                        type="button"
                        align="center"
                        gap="2"
                        px="4" py="2"
                        borderRadius="full"
                        fontSize="sm"
                        fontWeight="600"
                        border="1.5px solid"
                        borderColor={active ? BRAND : '#dde6f5'}
                        bg={active ? '#e6eeff' : '#f8faff'}
                        color={active ? BRAND : '#64748b'}
                        onClick={() => toggleItem('targetJobCategories', cat.value)}
                        transition="all 0.15s"
                        _hover={{ borderColor: BRAND, color: BRAND }}
                      >
                        {active && <Icon as={Check} size={13} />}
                        {cat.label}
                      </Flex>
                    </WrapItem>
                  );
                })}
              </Wrap>
            </Box>

            <Divider borderColor="#e8edf5" />

            {/* Service Category Wise */}
            <Box>
              <HStack mb="3" spacing="2">
                <Icon as={Settings} size={15} color={ACCENT} />
                <Text fontSize="xs" fontWeight="700" color="#475569" textTransform="uppercase" letterSpacing="0.8px">
                  Service Category Wise
                </Text>
                <Text fontSize="10px" fontWeight="400" color="#94a3b8">(leave empty = all services)</Text>
              </HStack>
              <Wrap spacing="3">
                {SERVICE_CATEGORIES.map(cat => {
                  const active = formData.targetServiceCategories.includes(cat);
                  return (
                    <WrapItem key={cat}>
                      <Flex
                        as="button"
                        type="button"
                        align="center"
                        gap="2"
                        px="4" py="2"
                        borderRadius="full"
                        fontSize="sm"
                        fontWeight="600"
                        border="1.5px solid"
                        borderColor={active ? ACCENT : '#dde6f5'}
                        bg={active ? '#fff7ed' : '#f8faff'}
                        color={active ? ACCENT : '#64748b'}
                        onClick={() => toggleItem('targetServiceCategories', cat)}
                        transition="all 0.15s"
                        _hover={{ borderColor: ACCENT, color: ACCENT }}
                      >
                        {active && <Icon as={Check} size={13} />}
                        {cat}
                      </Flex>
                    </WrapItem>
                  );
                })}
              </Wrap>
            </Box>

            {/* Summary */}
            {(formData.targetRegions.length > 0 || formData.targetJobCategories.length > 0 || formData.targetServiceCategories.length > 0) && (
              <Box bg="#f0f5ff" border="1px solid #c7d9f8" borderRadius="lg" p="3">
                <HStack mb="1.5" spacing="2">
                  <Icon as={FileText} size={13} color={BRAND} />
                  <Text fontSize="xs" fontWeight="700" color={BRAND}>Targeting Summary</Text>
                </HStack>
                {formData.targetRegions.length > 0 && (
                  <HStack spacing="1.5" mb="1">
                    <Icon as={MapPin} size={11} color="#475569" />
                    <Text fontSize="xs" color="#475569">Regions: <b>{formData.targetRegions.join(', ')}</b></Text>
                  </HStack>
                )}
                {formData.targetJobCategories.length > 0 && (
                  <HStack spacing="1.5" mb="1">
                    <Icon as={Briefcase} size={11} color="#475569" />
                    <Text fontSize="xs" color="#475569">Job Categories: <b>{formData.targetJobCategories.join(', ')}</b></Text>
                  </HStack>
                )}
                {formData.targetServiceCategories.length > 0 && (
                  <HStack spacing="1.5">
                    <Icon as={Settings} size={11} color="#475569" />
                    <Text fontSize="xs" color="#475569">Service Categories: <b>{formData.targetServiceCategories.join(', ')}</b></Text>
                  </HStack>
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
