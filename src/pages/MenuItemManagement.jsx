import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL, { UPLOAD_BASE_URL } from '../apiConfig';
import Swal from 'sweetalert2';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Flex,
  Heading,
  Tooltip,
  Badge,
  Image,
  Text,
  HStack,
  VStack,
  Icon,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody
} from '@chakra-ui/react';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  RefreshCw, 
  UtensilsCrossed, 
  Check, 
  X,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon
} from 'lucide-react';

const CUISINE_OPTIONS = [
  'North Indian',
  'Chinese',
  'South Indian',
  'Continental',
  'Mughlai',
  'Punjabi',
  'Italian',
  'Mexican',
  'Thai',
  'Tandoor',
  'Fast Food',
  'Desserts',
  'Beverages'
];

const CATEGORY_OPTIONS = [
  'Main Course',
  'Starter',
  'Snacks',
  'Bread',
  'Rice',
  'Dessert',
  'Drinks',
  'Breakfast',
  'Sides'
];

export default function MenuItemManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // Form State
  const [itemName, setItemName] = useState('');
  const [foodType, setFoodType] = useState('veg'); // 'veg' | 'non-veg'
  const [cuisine, setCuisine] = useState('North Indian');
  const [category, setCategory] = useState('Main Course');
  const [cookingCharge, setCookingCharge] = useState(250);
  const [itemImage, setItemImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' | 'url'
  const [status, setStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Helper to resolve image URL (whether external URL or uploaded on server)
  const getImageUrl = (imgPath) => {
    if (!imgPath || typeof imgPath !== 'string') return '';
    let normalized = imgPath.replace(/\\/g, '/').trim();
    const serverHost = 'https://api.zomocook.in';

    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      if (normalized.includes('onrender.com') || normalized.includes('localhost') || normalized.includes('admin.zomocook.in')) {
        normalized = normalized.replace(/^https?:\/\/[^\/]+/, serverHost);
      }
      return normalized;
    }
    const uploadsIdx = normalized.indexOf('uploads/');
    if (uploadsIdx !== -1) {
      normalized = normalized.substring(uploadsIdx);
    } else {
      normalized = `uploads/${normalized.replace(/^\/+/, '')}`;
    }
    const baseUrl = (UPLOAD_BASE_URL && UPLOAD_BASE_URL !== '/' && !UPLOAD_BASE_URL.includes('admin.zomocook.in') ? UPLOAD_BASE_URL : serverHost).replace(/\/+$/, '');
    return `${baseUrl}/${normalized}`;
  };

  // Table Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [foodTypeFilter, setFoodTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const toast = useToast();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/menu-items`);
      if (res.data && res.data.success) {
        setMenuItems(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
      toast({
        title: 'Error fetching menu items',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
    setLoading(false);
  };

  const resetForm = () => {
    setItemName('');
    setFoodType('veg');
    setCuisine('North Indian');
    setCategory('Main Course');
    setCookingCharge(250);
    setItemImage('');
    setImageFile(null);
    setImagePreview('');
    setImageInputMode('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setStatus(true);
    setEditingItemId(null);
    setShowAddModal(false);
  };

  const handleEditClick = (item) => {
    setEditingItemId(item._id);
    setItemName(item.name || '');
    setFoodType(item.foodType || (item.isNonVeg ? 'non-veg' : 'veg'));
    setCuisine(item.cuisine || 'North Indian');
    setCategory(item.category || 'Main Course');
    setCookingCharge(item.cookingCharge || 0);
    setItemImage(item.image || '');
    setImageFile(null);
    setImagePreview(item.image ? getImageUrl(item.image) : '');
    setImageInputMode(item.image && item.image.startsWith('http') && !item.image.includes('uploads') ? 'url' : 'upload');
    setStatus(item.isActive !== false);
    setShowAddModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file (JPG, PNG, WebP)',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Image size should be under 10MB',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setItemImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter dish name',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', itemName.trim());
      formData.append('foodType', foodType);
      formData.append('cuisine', cuisine);
      formData.append('category', category);
      formData.append('cookingCharge', Number(cookingCharge) || 0);
      formData.append('isActive', status);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (itemImage.trim()) {
        formData.append('image', itemImage.trim());
      } else {
        formData.append('image', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200');
      }

      const token = localStorage.getItem('adminToken');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      };

      if (editingItemId) {
        const res = await axios.put(`${API_BASE_URL}/menu-items/${editingItemId}`, formData, config);
        if (res.data && res.data.success) {
          toast({
            title: 'Updated Successfully',
            description: `"${itemName}" has been updated.`,
            status: 'success',
            duration: 3000,
            isClosable: true
          });
          fetchMenuItems();
          resetForm();
        }
      } else {
        const res = await axios.post(`${API_BASE_URL}/menu-items`, formData, config);
        if (res.data && res.data.success) {
          toast({
            title: 'Created Successfully',
            description: `New dish "${itemName}" created.`,
            status: 'success',
            duration: 3000,
            isClosable: true
          });
          fetchMenuItems();
          resetForm();
        }
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error Saving Item',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    }
    setSubmitting(false);
  };

  const handleToggleStatus = async (item) => {
    const newStatus = !item.isActive;
    // Optimistic UI update
    setMenuItems(prev => prev.map(m => m._id === item._id ? { ...m, isActive: newStatus } : m));

    try {
      await axios.put(`${API_BASE_URL}/menu-items/${item._id}`, { isActive: newStatus });
      toast({
        title: `Status set to ${newStatus ? 'Active' : 'Inactive'}`,
        status: newStatus ? 'success' : 'info',
        duration: 2000,
        isClosable: true
      });
    } catch (err) {
      console.error(err);
      fetchMenuItems();
    }
  };

  const handleDeleteItem = async (id, name) => {
    const res = await Swal.fire({
      title: 'Delete Menu Item?',
      text: `Are you sure you want to delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!res.isConfirmed) return;

    setMenuItems(prev => prev.filter(m => m._id !== id));
    try {
      await axios.delete(`${API_BASE_URL}/menu-items/${id}`);
      toast({
        title: 'Deleted!',
        description: `"${name}" removed from catalog.`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (err) {
      console.error(err);
      fetchMenuItems();
    }
  };

  const handleSyncDefaults = async () => {
    const res = await Swal.fire({
      title: 'Sync Default Menu?',
      text: 'This will seed any missing default catalog items into the database.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0866ed',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Sync Now'
    });

    if (!res.isConfirmed) return;

    try {
      const resp = await axios.post(`${API_BASE_URL}/menu-items/seed`);
      if (resp.data && resp.data.success) {
        Swal.fire({ icon: 'success', title: 'Synced!', text: resp.data.message });
        fetchMenuItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered List
  const filteredItems = menuItems.filter(item => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q || 
      item.name?.toLowerCase().includes(q) || 
      item.cuisine?.toLowerCase().includes(q) || 
      item.category?.toLowerCase().includes(q);

    const matchesCuisine = cuisineFilter === 'All' || item.cuisine === cuisineFilter;
    const matchesFoodType = foodTypeFilter === 'All' || item.foodType === foodTypeFilter;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    return matchesSearch && matchesCuisine && matchesFoodType && matchesCategory;
  });

  const getCategoryBadgeColor = (cat) => {
    switch (cat) {
      case 'Starter': return 'orange';
      case 'Main Course': return 'blue';
      case 'Snacks': return 'teal';
      case 'Dessert': return 'pink';
      case 'Drinks': return 'cyan';
      case 'Bread': return 'purple';
      case 'Rice': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }} maxW="100%" overflowX="hidden">
      
      {/* Page Header */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} mb={6} gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" fontWeight="bold">Menu Items</Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Add, edit and manage all menu items for the app.
          </Text>
        </Box>

        <HStack spacing={3}>
          <Button
            leftIcon={<Icon as={RefreshCw} boxSize={4} boxColor="blue.500" />}
            onClick={handleSyncDefaults}
            variant="outline"
            colorScheme="gray"
            size="md"
            borderRadius="xl"
            fontWeight="bold"
            bg="white"
            _hover={{ bg: 'gray.50' }}
          >
            Sync Defaults ({menuItems.length})
          </Button>

          <Button
            leftIcon={<Icon as={Plus} boxSize={4} />}
            colorScheme="blue"
            bg="#0866ed"
            _hover={{ bg: '#0652ba' }}
            size="md"
            borderRadius="xl"
            fontWeight="bold"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            Add New Menu Item
          </Button>
        </HStack>
      </Flex>

      {/* Main Content Card */}
      <Card borderRadius="2xl" border="1px solid" borderColor="gray.200" shadow="sm" bg="white" overflow="hidden">
        <CardBody p={0}>
          
          {/* Filters Bar */}
          <Flex direction={{ base: 'column', lg: 'row' }} justify="space-between" align={{ base: 'stretch', lg: 'center' }} p={5} borderBottom="1px solid" borderColor="gray.100" gap={4} bg="gray.50/50">
            <Text fontWeight="bold" fontSize="md" color="gray.800">
              Menu Items List <Text as="span" color="gray.400" fontWeight="normal" fontSize="sm">({filteredItems.length})</Text>
            </Text>

            <Flex flexWrap="wrap" gap={3} align="center">
              {/* Search */}
              <InputGroup minW={{ base: '100%', sm: '220px' }} maxW="300px" size="sm">
                <InputLeftElement pointerEvents="none">
                  <Icon as={Search} color="gray.400" boxSize={4} />
                </InputLeftElement>
                <Input
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  borderRadius="xl"
                  bg="white"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'blue.500' }}
                />
              </InputGroup>

              {/* Cuisine Filter */}
              <Select
                size="sm"
                value={cuisineFilter}
                onChange={(e) => setCuisineFilter(e.target.value)}
                borderRadius="xl"
                bg="white"
                borderColor="gray.200"
                maxW="160px"
                fontWeight="semibold"
              >
                <option value="All">All Cuisines</option>
                {CUISINE_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>

              {/* Food Type Filter */}
              <Select
                size="sm"
                value={foodTypeFilter}
                onChange={(e) => setFoodTypeFilter(e.target.value)}
                borderRadius="xl"
                bg="white"
                borderColor="gray.200"
                maxW="150px"
                fontWeight="semibold"
              >
                <option value="All">All Food Types</option>
                <option value="veg">🌿 Veg</option>
                <option value="non-veg">🍗 Non-Veg</option>
              </Select>

              {/* Category Filter */}
              <Select
                size="sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                borderRadius="xl"
                bg="white"
                borderColor="gray.200"
                maxW="160px"
                fontWeight="semibold"
              >
                <option value="All">All Categories</option>
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </Flex>
          </Flex>

          {/* Table */}
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead bg="gray.50">
                <Tr>
                  <Th textTransform="uppercase" fontSize="xs" color="gray.500" py={4} whiteSpace="nowrap">#</Th>
                  <Th textTransform="uppercase" fontSize="xs" color="gray.500" py={4} whiteSpace="nowrap">Image</Th>
                  <Th textTransform="uppercase" fontSize="xs" color="gray.500" py={4} whiteSpace="nowrap">Item Name</Th>
                  <Th textTransform="uppercase" fontSize="xs" color="gray.500" py={4} whiteSpace="nowrap">Cuisine</Th>
                  <Th textTransform="uppercase" fontSize="xs" color="gray.500" py={4} whiteSpace="nowrap">Food Type</Th>
                  <Th textTransform="uppercase" fontSize="xs" color="gray.500" py={4} whiteSpace="nowrap">Meal Category</Th>
                  <Th textTransform="uppercase" fontSize="xs" color="gray.500" py={4} whiteSpace="nowrap">Cooking Charge (₹)</Th>
                  <Th textTransform="uppercase" fontSize="xs" color="gray.500" py={4} whiteSpace="nowrap">Status</Th>
                  <Th textTransform="uppercase" fontSize="xs" color="gray.500" py={4} textAlign="center" whiteSpace="nowrap">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={9} textAlign="center" py={12} color="gray.500" fontWeight="bold">
                      Loading menu items...
                    </Td>
                  </Tr>
                ) : filteredItems.length === 0 ? (
                  <Tr>
                    <Td colSpan={9} textAlign="center" py={12} color="gray.400" fontWeight="medium">
                      No dishes found matching criteria.
                    </Td>
                  </Tr>
                ) : (
                  filteredItems.map((item, index) => (
                    <Tr key={item._id || index} _hover={{ bg: 'gray.50/80' }} transition="background 0.2s">
                      <Td fontWeight="bold" color="gray.400" whiteSpace="nowrap">{index + 1}</Td>
                      
                      <Td whiteSpace="nowrap">
                        <Image
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          boxSize="52px"
                          minW="52px"
                          minH="52px"
                          maxW="52px"
                          maxH="52px"
                          objectFit="cover"
                          borderRadius="xl"
                          border="1px solid"
                          borderColor="gray.200"
                          shadow="2xs"
                          fallback={
                            <Box boxSize="52px" bg="gray.100" borderRadius="xl" border="1px dashed #cbd5e1" display="flex" alignItems="center" justifyContent="center">
                              <Icon as={ImageIcon} color="gray.400" boxSize={5} />
                            </Box>
                          }
                        />
                      </Td>

                      <Td fontWeight="bold" color="gray.900" whiteSpace="nowrap">
                        {item.name}
                      </Td>

                      <Td color="gray.600" fontWeight="medium" whiteSpace="nowrap">
                        {item.cuisine}
                      </Td>

                      <Td whiteSpace="nowrap">
                        {item.foodType === 'non-veg' ? (
                          <Badge colorScheme="red" px={2.5} py={1} borderRadius="lg" fontSize="xs" textTransform="none">
                            🍗 Non-Veg
                          </Badge>
                        ) : (
                          <Badge colorScheme="green" px={2.5} py={1} borderRadius="lg" fontSize="xs" textTransform="none">
                            🌿 Veg
                          </Badge>
                        )}
                      </Td>

                      <Td whiteSpace="nowrap">
                        <Badge colorScheme={getCategoryBadgeColor(item.category)} px={2.5} py={1} borderRadius="lg" fontSize="xs" textTransform="none">
                          {item.category}
                        </Badge>
                      </Td>

                      <Td fontWeight="bold" color="gray.800" whiteSpace="nowrap">
                        ₹{item.cookingCharge || 0}
                      </Td>

                      <Td whiteSpace="nowrap">
                        <Badge
                          colorScheme={item.isActive !== false ? 'blue' : 'gray'}
                          px={3}
                          py={1}
                          borderRadius="full"
                          cursor="pointer"
                          onClick={() => handleToggleStatus(item)}
                          fontSize="xs"
                          textTransform="none"
                        >
                          ● {item.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </Td>

                      <Td textAlign="center" whiteSpace="nowrap">
                        <HStack spacing={1} justify="center">
                          <Tooltip label="Edit Dish" hasArrow>
                            <IconButton
                              icon={<Icon as={Pencil} boxSize={4} />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              aria-label="Edit"
                              onClick={() => handleEditClick(item)}
                            />
                          </Tooltip>

                          <Tooltip label="Delete Dish" hasArrow>
                            <IconButton
                              icon={<Icon as={Trash2} boxSize={4} />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              aria-label="Delete"
                              onClick={() => item._id && handleDeleteItem(item._id, item.name)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* Add / Edit Modal */}
      <Modal isOpen={showAddModal} onClose={resetForm} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <ModalHeader bg="gray.50" borderBottom="1px solid" borderColor="gray.100" py={4}>
            <Heading size="md" color="gray.800">
              {editingItemId ? 'Edit Menu Item' : 'Add New Menu Item'}
            </Heading>
          </ModalHeader>
          <ModalCloseButton mt={1} />

          <form onSubmit={handleSaveMenuItem}>
            <ModalBody p={6}>
              <VStack spacing={4} align="stretch">
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Item Name</FormLabel>
                    <Input
                      placeholder="e.g. Dal Makhni"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      borderRadius="xl"
                      bg="gray.50"
                      _focus={{ bg: 'white', borderColor: 'blue.500' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Cuisine</FormLabel>
                    <Select
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      borderRadius="xl"
                      bg="gray.50"
                      _focus={{ bg: 'white', borderColor: 'blue.500' }}
                    >
                      {CUISINE_OPTIONS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Meal Category</FormLabel>
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      borderRadius="xl"
                      bg="gray.50"
                      _focus={{ bg: 'white', borderColor: 'blue.500' }}
                    >
                      {CATEGORY_OPTIONS.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Cooking Charge (₹)</FormLabel>
                    <Input
                      type="number"
                      placeholder="e.g. 250"
                      value={cookingCharge}
                      onChange={(e) => setCookingCharge(e.target.value)}
                      borderRadius="xl"
                      bg="gray.50"
                      _focus={{ bg: 'white', borderColor: 'blue.500' }}
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Food Type</FormLabel>
                  <HStack spacing={3}>
                    <Button
                      flex={1}
                      onClick={() => setFoodType('veg')}
                      colorScheme={foodType === 'veg' ? 'green' : 'gray'}
                      variant={foodType === 'veg' ? 'solid' : 'outline'}
                      borderRadius="xl"
                      fontWeight="bold"
                    >
                      🌿 Veg
                    </Button>
                    <Button
                      flex={1}
                      onClick={() => setFoodType('non-veg')}
                      colorScheme={foodType === 'non-veg' ? 'red' : 'gray'}
                      variant={foodType === 'non-veg' ? 'solid' : 'outline'}
                      borderRadius="xl"
                      fontWeight="bold"
                    >
                      🍗 Non-Veg
                    </Button>
                  </HStack>
                </FormControl>

                <FormControl>
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.700" mb={0}>
                      Dish Image
                    </FormLabel>
                    <HStack spacing={1}>
                      <Button
                        size="xs"
                        variant={imageInputMode === 'upload' ? 'solid' : 'ghost'}
                        colorScheme={imageInputMode === 'upload' ? 'blue' : 'gray'}
                        borderRadius="lg"
                        leftIcon={<Icon as={Upload} boxSize={3} />}
                        onClick={() => setImageInputMode('upload')}
                      >
                        Upload Image
                      </Button>
                      <Button
                        size="xs"
                        variant={imageInputMode === 'url' ? 'solid' : 'ghost'}
                        colorScheme={imageInputMode === 'url' ? 'blue' : 'gray'}
                        borderRadius="lg"
                        leftIcon={<Icon as={LinkIcon} boxSize={3} />}
                        onClick={() => setImageInputMode('url')}
                      >
                        Image URL
                      </Button>
                    </HStack>
                  </Flex>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />

                  {imageInputMode === 'upload' ? (
                    <Box>
                      {imagePreview ? (
                        <Flex
                          align="center"
                          p={3}
                          bg="blue.50/40"
                          border="1px solid"
                          borderColor="blue.200"
                          borderRadius="xl"
                          gap={3.5}
                        >
                          <Image
                            src={imagePreview}
                            alt="Selected dish"
                            boxSize="68px"
                            minW="68px"
                            maxW="68px"
                            maxH="68px"
                            objectFit="cover"
                            borderRadius="xl"
                            border="2px solid white"
                            shadow="sm"
                            fallback={
                              <Box boxSize="68px" bg="gray.100" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                                <Icon as={ImageIcon} color="gray.400" boxSize={6} />
                              </Box>
                            }
                          />
                          <Box flex={1}>
                            <Text fontSize="xs" fontWeight="bold" color="blue.900" noOfLines={1}>
                              {imageFile ? imageFile.name : (itemName ? `${itemName} Image` : 'Dish Image')}
                            </Text>
                            <Text fontSize="11px" color="blue.600" mt={0.5}>
                              {imageFile 
                                ? `${(imageFile.size / 1024).toFixed(1)} KB — Ready to upload to server` 
                                : 'Stored on backend server'}
                            </Text>
                            <HStack spacing={2} mt={2}>
                              <Button
                                size="xs"
                                colorScheme="blue"
                                variant="outline"
                                borderRadius="md"
                                onClick={() => fileInputRef.current?.click()}
                                leftIcon={<Icon as={Upload} boxSize={3} />}
                              >
                                Change Image
                              </Button>
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                borderRadius="md"
                                onClick={handleRemoveImage}
                              >
                                Remove
                              </Button>
                            </HStack>
                          </Box>
                        </Flex>
                      ) : (
                        <Box
                          onClick={() => fileInputRef.current?.click()}
                          cursor="pointer"
                          p={5}
                          border="2px dashed"
                          borderColor="blue.300"
                          borderRadius="xl"
                          bg="blue.50/30"
                          _hover={{ bg: 'blue.50/80', borderColor: 'blue.500' }}
                          textAlign="center"
                          transition="all 0.2s"
                        >
                          <VStack spacing={1.5}>
                            <Box p={2.5} bg="blue.100" borderRadius="full" color="blue.600">
                              <Icon as={Upload} boxSize={5} />
                            </Box>
                            <Text fontSize="xs" fontWeight="bold" color="gray.700">
                              Click to choose image from device / mobile
                            </Text>
                            <Text fontSize="11px" color="gray.500">
                              Supports JPG, PNG, WebP (auto-uploaded to backend server)
                            </Text>
                          </VStack>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <HStack spacing={3} align="flex-start">
                      <Image
                        src={getImageUrl(itemImage) || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200'}
                        alt="Preview"
                        boxSize="64px"
                        minW="64px"
                        objectFit="cover"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="gray.200"
                        fallback={
                          <Box boxSize="64px" bg="gray.100" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                            <Icon as={ImageIcon} color="gray.400" boxSize={6} />
                          </Box>
                        }
                      />
                      <VStack flex={1} align="stretch" spacing={1}>
                        <Input
                          size="sm"
                          placeholder="Paste image URL (e.g. Unsplash)..."
                          value={itemImage}
                          onChange={(e) => {
                            setItemImage(e.target.value);
                            setImagePreview(e.target.value);
                          }}
                          borderRadius="lg"
                          bg="gray.50"
                        />
                        <Text fontSize="xs" color="gray.400">
                          Recommended: 500 × 500 px direct image link
                        </Text>
                      </VStack>
                    </HStack>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">Status</FormLabel>
                  <Button
                    size="sm"
                    colorScheme={status ? 'blue' : 'gray'}
                    variant="outline"
                    borderRadius="xl"
                    onClick={() => setStatus(!status)}
                  >
                    ● {status ? 'Active' : 'Inactive'}
                  </Button>
                </FormControl>

              </VStack>
            </ModalBody>

            <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100" py={3}>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={resetForm} borderRadius="xl">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  bg="#0866ed"
                  _hover={{ bg: '#0652ba' }}
                  isLoading={submitting}
                  borderRadius="xl"
                  fontWeight="bold"
                >
                  {editingItemId ? 'Update Menu Item' : 'Save Menu Item'}
                </Button>
              </HStack>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

    </Box>
  );
}
