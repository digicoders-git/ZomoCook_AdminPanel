import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, FormControl,
  FormLabel, Input, Switch, Flex, Heading, Tooltip, Badge, Image, Text, Select
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
        link: banner.link || '',
        status: banner.status,
        targetAudience: banner.targetAudience || 'both',
      });
      setImagePreview(banner.image ? `${API_BASE_URL.replace('/api', '')}/${banner.image}` : '');
    } else {
      setCurrentBanner(null);
      setFormData({ title: '', link: '', status: 'active', targetAudience: 'both' });
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
    if (!currentBanner && !imageFile) {
      toast({ title: 'Please upload a banner image', status: 'warning', isClosable: true });
      return;
    }
    setSaving(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
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
    if (!window.confirm('Delete this banner?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Banner deleted', status: 'success', isClosable: true });
      fetchBanners();
    } catch {
      toast({ title: 'Failed to delete banner', status: 'error', isClosable: true });
    }
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
                    <Image src={getImageUrl(b.image)} alt={b.title} w="80px" h="40px" objectFit="cover" borderRadius="md" />
                  ) : (
                    <Text color="gray.400" fontSize="xs">No image</Text>
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

      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentBanner ? 'Edit Banner' : 'Add Banner'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>Show To</FormLabel>
              <Select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              >
                <option value="both">👥 Both (Cook & Chef)</option>
                <option value="cook">👨‍🍳 Cook Only (Job Seekers)</option>
                <option value="chef">🍽️ Chef / Employer Only</option>
              </Select>
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                placeholder="e.g. Summer Special Offer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Link (Optional)</FormLabel>
              <Input
                placeholder="e.g. https://zomocook.com/offers"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </FormControl>
            <FormControl mb={4} isRequired={!currentBanner}>
              <FormLabel>Banner Image {currentBanner && '(Leave empty to keep current)'}</FormLabel>
              <Input type="file" accept="image/*" p={1} onChange={handleImageChange} />
              {imagePreview && (
                <Image src={imagePreview} mt={3} borderRadius="md" maxH="150px" objectFit="cover" w="100%" />
              )}
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Active</FormLabel>
              <Switch
                colorScheme="green"
                isChecked={formData.status === 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit} isLoading={saving}>Save</Button>
            <Button onClick={handleClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BannerList;
