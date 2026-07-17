import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import API_BASE_URL from '../apiConfig';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, FormControl,
  FormLabel, Input, Switch, Flex, Heading, Tooltip, Badge, Image, Text, Select, SimpleGrid, VStack
} from '@chakra-ui/react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Icon } from '@chakra-ui/react';

const audienceLabel = (val) => {
  if (val === 'cook') return '👨‍🍳 Cook Only';
  if (val === 'chef') return '🍽️ Chef / Employer Only';
  return '👥 Both';
};

const audienceColor = (val) => {
  if (val === 'cook') return 'orange';
  if (val === 'chef') return 'blue';
  return 'purple';
};

const BannerList = () => {
  const [banners, setBanners] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [formData, setFormData] = useState({ title: '', link: '', status: 'active', targetAudience: 'both' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const token = localStorage.getItem('adminToken');

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/banners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setBanners(res.data.banners);
    } catch {
      toast({ title: 'Failed to fetch banners', status: 'error', isClosable: true });
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleOpen = (banner = null) => {
    if (banner) {
      setCurrentBanner(banner);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || '',
        cta: banner.cta || '',
        link: banner.link || '',
        status: banner.status,
        targetAudience: banner.targetAudience || 'both',
      });
      setImagePreview(banner.image ? `${API_BASE_URL.replace('/api', '')}/${banner.image}` : '');
    } else {
      setCurrentBanner(null);
      setFormData({ title: '', subtitle: '', cta: '', link: '', status: 'active', targetAudience: 'both' });
      setImagePreview('');
    }
    setImageFile(null);
    setIsOpen(true);
  };

  const handleClose = () => { setIsOpen(false); setImageFile(null); setImagePreview(''); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast({ title: 'Title is required', status: 'warning', isClosable: true });
      return;
    }
    setSaving(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('subtitle', formData.subtitle);
      data.append('cta', formData.cta);
      data.append('link', formData.link);
      data.append('status', formData.status);
      data.append('targetAudience', formData.targetAudience);
      if (imageFile) data.append('image', imageFile);

      if (currentBanner) {
        await axios.put(`${API_BASE_URL}/banners/${currentBanner._id}`, data, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        toast({ title: 'Banner updated', status: 'success', isClosable: true });
      } else {
        await axios.post(`${API_BASE_URL}/banners`, data, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        toast({ title: 'Banner created', status: 'success', isClosable: true });
      }
      fetchBanners();
      handleClose();
    } catch (error) {
      toast({ title: error.response?.data?.message || 'Error saving banner', status: 'error', isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Delete this banner?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/banners/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast({ title: 'Banner deleted', status: 'success', isClosable: true });
          fetchBanners();
        } catch {
          toast({ title: 'Failed to delete banner', status: 'error', isClosable: true });
        }
      }
    });
  };

  const handleToggleStatus = async (banner) => {
    const newStatus = banner.status === 'active' ? 'inactive' : 'active';
    try {
      const data = new FormData();
      data.append('status', newStatus);
      data.append('targetAudience', banner.targetAudience || 'both');
      await axios.put(`${API_BASE_URL}/banners/${banner._id}`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      fetchBanners();
    } catch {
      toast({ title: 'Error toggling status', status: 'error', isClosable: true });
    }
  };

  const getImageUrl = (imgPath) => {
    if (!imgPath) return '';
    if (imgPath.startsWith('http')) return imgPath;
    return `${API_BASE_URL.replace('/api', '')}/${imgPath}`;
  };

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="sm">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md" color="gray.700">Manage Banners</Heading>
        <Button leftIcon={<Icon as={Plus} />} colorScheme="blue" onClick={() => handleOpen()}>
          Add Banner
        </Button>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Image</Th>
              <Th>Title</Th>
              <Th>Show To</Th>
              <Th>Link</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {banners.map((b) => (
              <Tr key={b._id}>
                <Td>
                  {b.image ? (
                    <Image
                      src={getImageUrl(b.image)}
                      alt={b.title}
                      boxSize="40px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                  ) : (
                    <Box boxSize="40px" bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                      <Icon as={ImageIcon} color="gray.400" />
                    </Box>
                  )}
                </Td>
                <Td fontWeight="semibold">{b.title}</Td>
                <Td>
                  <Badge colorScheme={audienceColor(b.targetAudience)}>
                    {audienceLabel(b.targetAudience)}
                  </Badge>
                </Td>
                <Td>
                  <Text fontSize="xs" color="blue.500" noOfLines={1} maxW="150px">
                    {b.link || '—'}
                  </Text>
                </Td>
                <Td>
                  <Switch
                    colorScheme="green"
                    isChecked={b.status === 'active'}
                    onChange={() => handleToggleStatus(b)}
                  />
                  <Badge ml={2} colorScheme={b.status === 'active' ? 'green' : 'red'}>
                    {b.status}
                  </Badge>
                </Td>
                <Td>
                  <Tooltip label="Edit">
                    <IconButton size="sm" icon={<Icon as={Pencil} boxSize={4} />} colorScheme="blue" mr={2} onClick={() => handleOpen(b)} />
                  </Tooltip>
                  <Tooltip label="Delete">
                    <IconButton size="sm" icon={<Icon as={Trash2} boxSize={4} />} colorScheme="red" onClick={() => handleDelete(b._id)} />
                  </Tooltip>
                </Td>
              </Tr>
            ))}
            {banners.length === 0 && (
              <Tr>
                <Td colSpan={6} textAlign="center" py={6} color="gray.400">No banners found. Click "Add Banner" to create one.</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={handleClose} size="4xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" overflow="hidden">
          <ModalHeader bg="gray.50" borderBottomWidth="1px">
            {currentBanner ? 'Edit Banner' : 'Create New Banner'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
              {/* Left Column - Form Details */}
              <Box flex="1">
                <Heading size="sm" mb={4} color="gray.600">Banner Details</Heading>
                
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="semibold">Show To</FormLabel>
                    <Select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      bg="white"
                    >
                      <option value="both">👥 Both (Cook & Chef)</option>
                      <option value="cook">👨‍🍳 Cook Only (Job Seekers)</option>
                      <option value="chef">🍽️ Chef / Employer Only</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="flex-end" pb={2}>
                    <Box w="full" p={3} borderWidth={1} borderRadius="md" borderColor={formData.status === 'active' ? 'green.200' : 'gray.200'} bg={formData.status === 'active' ? 'green.50' : 'gray.50'}>
                      <Flex justify="space-between" align="center">
                        <FormLabel mb="0" fontSize="sm" fontWeight="bold" color={formData.status === 'active' ? 'green.600' : 'gray.500'}>
                          {formData.status === 'active' ? 'Active Status' : 'Inactive Status'}
                        </FormLabel>
                        <Switch
                          colorScheme="green"
                          isChecked={formData.status === 'active'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                        />
                      </Flex>
                    </Box>
                  </FormControl>
                </SimpleGrid>

                <FormControl mt={4} isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">Title</FormLabel>
                  <Input
                    placeholder="e.g. Summer Special Offer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </FormControl>

                <FormControl mt={4}>
                  <FormLabel fontSize="sm" fontWeight="semibold">Subtitle (Optional)</FormLabel>
                  <Input
                    placeholder="e.g. Verified | Experienced | Reliable"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </FormControl>

                <SimpleGrid columns={2} spacing={4} mt={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">CTA Button Text (Optional)</FormLabel>
                    <Input
                      placeholder="e.g. Hire Now"
                      value={formData.cta}
                      onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">Button Link Path (Optional)</FormLabel>
                    <Input
                      placeholder="e.g. https://zomocook.com/offers"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* Right Column - Image Upload */}
              <Box w={{ base: '100%', md: '350px' }}>
                <Heading size="sm" mb={4} color="gray.600">Banner Image</Heading>
                <FormControl isRequired={!currentBanner}>
                  <Box
                    borderWidth="2px"
                    borderStyle="dashed"
                    borderColor={imagePreview ? 'blue.300' : 'gray.300'}
                    borderRadius="xl"
                    p={4}
                    textAlign="center"
                    bg={imagePreview ? 'blue.50' : 'gray.50'}
                    position="relative"
                    minH="250px"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    transition="all 0.2s"
                    _hover={{ borderColor: 'blue.400', bg: 'gray.100' }}
                  >
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      position="absolute"
                      top="0"
                      left="0"
                      w="full"
                      h="full"
                      opacity="0"
                      cursor="pointer"
                      zIndex="2"
                    />
                    
                    {imagePreview ? (
                      <Box position="relative" w="full" h="200px">
                        <Image src={imagePreview} w="full" h="full" objectFit="contain" borderRadius="md" />
                        <Box position="absolute" bottom="-2" left="50%" transform="translateX(-50%)" bg="blackAlpha.700" color="white" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="bold">
                          Click to change image
                        </Box>
                      </Box>
                    ) : (
                      <VStack spacing={2} color="gray.500">
                        <Box boxSize="60px" bg="gray.200" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                          <Icon as={Plus} boxSize={6} color="gray.500" />
                        </Box>
                        <Text fontWeight="semibold">Click or drag image here</Text>
                        <Text fontSize="xs">Recommended aspect ratio: 16:9 or 2:1</Text>
                        <Text fontSize="xs" mt={2} color="blue.500">
                          {currentBanner ? 'Leave empty to keep current image' : 'Image is required'}
                        </Text>
                      </VStack>
                    )}
                  </Box>
                </FormControl>
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter bg="gray.50" borderTopWidth="1px">
            <Button variant="ghost" mr={3} onClick={handleClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleSubmit} isLoading={saving} size="lg" px={8}>
              {currentBanner ? 'Update Banner' : 'Publish Banner'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BannerList;
