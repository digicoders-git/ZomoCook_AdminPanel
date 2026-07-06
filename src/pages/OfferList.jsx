import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, FormControl,
  FormLabel, Input, Select, Flex, Heading, Tooltip, Badge,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Text, InputGroup, InputLeftElement, HStack, VStack, Icon,
  SimpleGrid, Divider
} from '@chakra-ui/react';
import { Pencil, Trash2, Plus, Search, Copy, Info, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import moment from 'moment';

const OfferList = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterApplicableOn, setFilterApplicableOn] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal
  const [isOpen, setIsOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  
  const initialFormState = { 
    code: '', title: '', subtitle: '', 
    offerType: 'FLAT', discountValue: 0, 
    applicableOn: 'All', minOrderValue: 0, 
    usageLimitTotal: 0, usageLimitPerUser: 1, 
    validFrom: '', validTo: '', status: 'ACTIVE' 
  };
  const [formData, setFormData] = useState(initialFormState);
  
  const toast = useToast();
  const token = localStorage.getItem('adminToken');
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/offers`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        const mappedOffers = res.data.offers.map(o => ({
           ...o,
           offerType: o.offerType || 'PERCENTAGE',
           discountValue: o.discountValue !== undefined ? o.discountValue : (o.discountPercent || 0),
           status: o.status || (o.isActive ? 'ACTIVE' : 'INACTIVE')
        }));
        setOffers(mappedOffers);
        setFilteredOffers(mappedOffers);
      }
    } catch (error) {
      toast({ title: 'Failed to fetch offers', status: 'error', isClosable: true });
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = offers;
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(o => o.code.toLowerCase().includes(lowerQuery) || o.title.toLowerCase().includes(lowerQuery));
    }
    if (filterType) {
      result = result.filter(o => o.offerType === filterType);
    }
    if (filterApplicableOn) {
      result = result.filter(o => o.applicableOn === filterApplicableOn);
    }
    if (filterStatus) {
      result = result.filter(o => o.status === filterStatus);
    }
    if (filterDateFrom && filterDateTo) {
        result = result.filter(o => {
            if (!o.validFrom || !o.validTo) return true; // If no validity set, don't filter it out maybe? Or filter out if strict. Let's be inclusive if dates not set, or strict if they are. Assuming strict here based on UI having date pickers.
            const offerStart = moment(o.validFrom);
            const offerEnd = moment(o.validTo);
            const filterStart = moment(filterDateFrom);
            const filterEnd = moment(filterDateTo);
            // Check if offer date range overlaps with filter date range
            return (offerStart.isSameOrBefore(filterEnd) && offerEnd.isSameOrAfter(filterStart));
        });
    }

    setFilteredOffers(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [offers, searchQuery, filterType, filterApplicableOn, filterStatus, filterDateFrom, filterDateTo]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOffers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);

  const handleOpen = (offer = null) => {
    if (offer) {
      setCurrentOffer(offer);
      setFormData({
        code: offer.code || '',
        title: offer.title || '',
        subtitle: offer.subtitle || '',
        offerType: offer.offerType || 'FLAT',
        discountValue: offer.discountValue || 0,
        applicableOn: offer.applicableOn || 'All',
        minOrderValue: offer.minOrderValue || 0,
        usageLimitTotal: offer.usageLimitTotal || 0,
        usageLimitPerUser: offer.usageLimitPerUser || 1,
        validFrom: offer.validFrom ? moment(offer.validFrom).format('YYYY-MM-DD') : '',
        validTo: offer.validTo ? moment(offer.validTo).format('YYYY-MM-DD') : '',
        status: offer.status || 'ACTIVE'
      });
    } else {
      setCurrentOffer(null);
      setFormData(initialFormState);
    }
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  const handleSubmit = async () => {
    if (!formData.code || !formData.title) {
      toast({ title: 'Code and Title are required', status: 'warning', isClosable: true });
      return;
    }

    const payload = { ...formData };
    if (!payload.validFrom) payload.validFrom = null;
    if (!payload.validTo) payload.validTo = null;

    try {
      if (currentOffer) {
        await axios.put(`${apiUrl}/offers/${currentOffer._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: 'Offer updated', status: 'success', isClosable: true });
      } else {
        await axios.post(`${apiUrl}/offers`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: 'Offer created', status: 'success', isClosable: true });
      }
      fetchOffers();
      handleClose();
    } catch (error) {
      toast({ title: error.response?.data?.message || 'Error saving offer', status: 'error', isClosable: true });
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Delete this offer permanently?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${apiUrl}/offers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          toast({ title: 'Offer deleted', status: 'success', isClosable: true });
          fetchOffers();
        } catch (error) {
          toast({ title: 'Failed to delete offer', status: 'error', isClosable: true });
        }
      }
    });
  };

  const resetFilters = () => {
      setSearchQuery('');
      setFilterType('');
      setFilterApplicableOn('');
      setFilterStatus('');
      setFilterDateFrom('');
      setFilterDateTo('');
  };

  const handleCopyCode = (code) => {
      navigator.clipboard.writeText(code);
      toast({ title: 'Code copied!', status: 'success', duration: 2000, isClosable: true });
  }

  // Helpers for styling
  const getOfferTypeStyle = (type) => {
      if (type === 'FLAT') return { bg: 'blue.50', color: 'blue.600' };
      if (type === 'PERCENTAGE') return { bg: 'green.50', color: 'green.600' };
      return { bg: 'gray.100', color: 'gray.600' };
  };

  const getStatusStyle = (status) => {
      if (status === 'ACTIVE') return { color: 'green.500', fontWeight: 'bold' };
      if (status === 'INACTIVE') return { color: 'gray.500', fontWeight: 'bold' };
      if (status === 'SCHEDULED') return { color: 'orange.500', fontWeight: 'bold' };
      if (status === 'EXPIRED') return { color: 'red.500', fontWeight: 'bold' };
      return { color: 'gray.500' };
  }

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Flex justify="space-between" align="center" mb={2}>
        <Box>
            <Heading size="lg" color="gray.800" mb={1}>Offer Management</Heading>
            <Text color="gray.500" fontSize="sm">Create and manage discount offers that customers can apply at checkout or before package calculation.</Text>
        </Box>
        <Button leftIcon={<Icon as={Plus} />} colorScheme="blue" bg="blue.600" onClick={() => handleOpen()} borderRadius="md">
          Create New Offer
        </Button>
      </Flex>

      {/* Filters Section */}
      <Box bg="white" p={4} borderRadius="lg" shadow="sm" mb={6} mt={6}>
          <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4} alignItems="flex-end">
              <FormControl>
                  <FormLabel fontSize="sm" color="gray.600" fontWeight="bold">Search by Code or Name</FormLabel>
                  <InputGroup>
                      <InputLeftElement pointerEvents='none'>
                          <Icon as={Search} color='gray.400' />
                      </InputLeftElement>
                      <Input placeholder="Search offer code or name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} borderRadius="md" />
                  </InputGroup>
              </FormControl>
              
              <FormControl>
                  <FormLabel fontSize="sm" color="gray.600" fontWeight="bold">Offer Type</FormLabel>
                  <Select placeholder="All Types" value={filterType} onChange={(e) => setFilterType(e.target.value)} borderRadius="md">
                      <option value="FLAT">Flat</option>
                      <option value="PERCENTAGE">Percentage</option>
                  </Select>
              </FormControl>
              
              <FormControl>
                  <FormLabel fontSize="sm" color="gray.600" fontWeight="bold">Applicable On</FormLabel>
                  <Select placeholder="All" value={filterApplicableOn} onChange={(e) => setFilterApplicableOn(e.target.value)} borderRadius="md">
                      <option value="Service Package">Service Package</option>
                      <option value="Hiring Processing Fee">Hiring Processing Fee</option>
                      <option value="All">All</option>
                  </Select>
              </FormControl>
              
              <FormControl>
                  <FormLabel fontSize="sm" color="gray.600" fontWeight="bold">Status</FormLabel>
                  <Select placeholder="All Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} borderRadius="md">
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="EXPIRED">Expired</option>
                  </Select>
              </FormControl>
              
              <FormControl>
                  <FormLabel fontSize="sm" color="gray.600" fontWeight="bold">Date Range</FormLabel>
                  <Flex gap={2}>
                      <Input type="date" size="md" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} borderRadius="md" />
                      <Input type="date" size="md" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} borderRadius="md" />
                  </Flex>
              </FormControl>
          </SimpleGrid>
          <Flex mt={4} gap={4}>
              <Button variant="outline" onClick={resetFilters} borderRadius="md" w="100px">Reset</Button>
              <Button colorScheme="blue" bg="blue.600" onClick={() => {/* Currently filters auto-apply, button just for UI */}} borderRadius="md" w="120px">Apply Filters</Button>
          </Flex>
      </Box>

      {/* Table Section */}
      <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th color="gray.500" fontSize="xs">OFFER CODE</Th>
                <Th color="gray.500" fontSize="xs">OFFER NAME</Th>
                <Th color="gray.500" fontSize="xs" textAlign="center">OFFER TYPE</Th>
                <Th color="gray.500" fontSize="xs" textAlign="center">DISCOUNT</Th>
                <Th color="gray.500" fontSize="xs" textAlign="center">APPLICABLE ON</Th>
                <Th color="gray.500" fontSize="xs" textAlign="center">MIN. ORDER / PACKAGE<br/>VALUE</Th>
                <Th color="gray.500" fontSize="xs" textAlign="center">USAGE LIMIT<br/>(Total / Per User)</Th>
                <Th color="gray.500" fontSize="xs" textAlign="center">VALIDITY<br/>(FROM - TO)</Th>
                <Th color="gray.500" fontSize="xs" textAlign="center">STATUS</Th>
                <Th color="gray.500" fontSize="xs" textAlign="center">ACTIONS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentItems.map(o => (
                <Tr key={o._id} _hover={{ bg: "gray.50" }}>
                  <Td>
                      <Badge bg={o.offerType === 'FLAT' ? 'blue.50' : (o.offerType === 'PERCENTAGE' ? 'green.50' : 'purple.50')} 
                             color={o.offerType === 'FLAT' ? 'blue.600' : (o.offerType === 'PERCENTAGE' ? 'green.600' : 'purple.600')} 
                             px={3} py={1} borderRadius="md" textTransform="uppercase">
                          {o.code}
                      </Badge>
                  </Td>
                  <Td>
                      <Text fontWeight="bold" color="gray.800">{o.title}</Text>
                      {o.subtitle && <Text fontSize="xs" color="gray.500" mt={1}>{o.subtitle}</Text>}
                  </Td>
                  <Td textAlign="center">
                      <Badge {...getOfferTypeStyle(o.offerType)} px={2} py={0.5} borderRadius="sm" fontSize="xs">
                          {o.offerType}
                      </Badge>
                  </Td>
                  <Td textAlign="center" fontWeight="500">
                      {o.offerType === 'FLAT' ? `₹${o.discountValue}` : `${o.discountValue}%`}
                  </Td>
                  <Td textAlign="center" color="gray.600" fontSize="sm">
                      {o.applicableOn}
                  </Td>
                  <Td textAlign="center" color="gray.600" fontSize="sm">
                      ₹{o.minOrderValue?.toLocaleString() || '0'}
                  </Td>
                  <Td textAlign="center" color="gray.600" fontSize="sm">
                      {o.usageLimitTotal || '∞'} / {o.usageLimitPerUser || '∞'}
                  </Td>
                  <Td textAlign="center" fontSize="xs" color="gray.600">
                      {o.validFrom ? moment(o.validFrom).format('DD MMM YYYY') : '-'} <br/> to <br/> {o.validTo ? moment(o.validTo).format('DD MMM YYYY') : '-'}
                  </Td>
                  <Td textAlign="center">
                      <Text {...getStatusStyle(o.status)} fontSize="sm">{o.status}</Text>
                  </Td>
                  <Td textAlign="center">
                    <HStack spacing={1} justify="center">
                        <Tooltip label="Edit">
                            <IconButton size="sm" icon={<Icon as={Pencil} boxSize={4} />} variant="ghost" colorScheme="blue" onClick={() => handleOpen(o)} />
                        </Tooltip>
                        <Tooltip label="Copy Code">
                            <IconButton size="sm" icon={<Icon as={Copy} boxSize={4} />} variant="ghost" colorScheme="blue" onClick={() => handleCopyCode(o.code)} />
                        </Tooltip>
                        <Tooltip label="Delete">
                            <IconButton size="sm" icon={<Icon as={Trash2} boxSize={4} />} variant="ghost" colorScheme="red" onClick={() => handleDelete(o._id)} />
                        </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))}
              {currentItems.length === 0 && (
                <Tr>
                  <Td colSpan={10} textAlign="center" py={8} color="gray.500">No offers found matching your criteria</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
        
        {/* Pagination */}
        <Flex justify="space-between" align="center" p={4} borderTop="1px solid" borderColor="gray.100">
            <Text fontSize="sm" color="gray.500">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOffers.length)} of {filteredOffers.length} offers
            </Text>
            <HStack>
                <IconButton 
                    icon={<Icon as={ChevronLeft} />} 
                    size="sm" 
                    variant="outline" 
                    isDisabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                />
                <Button size="sm" colorScheme="blue" bg="blue.600">{currentPage}</Button>
                <IconButton 
                    icon={<Icon as={ChevronRight} />} 
                    size="sm" 
                    variant="outline" 
                    isDisabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                />
                <Select size="sm" w="100px" ml={2} value={itemsPerPage} onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}}>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                </Select>
            </HStack>
        </Flex>
      </Box>

      {/* Info Section */}
      <Box bg="white" borderRadius="lg" p={5} mt={6} border="1px solid" borderColor="blue.100" shadow="sm">
          <Flex align="center" mb={3}>
              <Icon as={Info} color="blue.500" mr={2} boxSize={5} />
              <Heading size="sm" color="gray.700">How Offers Work</Heading>
          </Flex>
          <VStack align="start" spacing={2} pl={1}>
              <Flex align="center">
                  <Icon as={CheckCircle2} color="green.500" mr={2} boxSize={4} />
                  <Text fontSize="sm" color="gray.600">Offers will be visible to customers at checkout or before service package calculation.</Text>
              </Flex>
              <Flex align="center">
                  <Icon as={CheckCircle2} color="green.500" mr={2} boxSize={4} />
                  <Text fontSize="sm" color="gray.600">Customers can enter the offer code and tap "Apply" to get the discount.</Text>
              </Flex>
              <Flex align="center">
                  <Icon as={CheckCircle2} color="green.500" mr={2} boxSize={4} />
                  <Text fontSize="sm" color="gray.600">Only one offer can be applied per transaction.</Text>
              </Flex>
              <Flex align="center">
                  <Icon as={CheckCircle2} color="green.500" mr={2} boxSize={4} />
                  <Text fontSize="sm" color="gray.600">Offers can be applicable on Hiring Processing Fee or Service Packages.</Text>
              </Flex>
          </VStack>
      </Box>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="gray.700">{currentOffer ? 'Edit Offer' : 'Create New Offer'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">Promo Code</FormLabel>
                  <Input placeholder="e.g. FLAT299" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">Offer Title</FormLabel>
                  <Input placeholder="e.g. Flat ₹299 OFF" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </FormControl>

                <FormControl gridColumn="span 2">
                  <FormLabel fontSize="sm" fontWeight="semibold">Offer Subtitle</FormLabel>
                  <Input placeholder="e.g. Get flat ₹299 off on any service package." value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">Offer Type</FormLabel>
                  <Select value={formData.offerType} onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}>
                      <option value="FLAT">Flat Amount</option>
                      <option value="PERCENTAGE">Percentage</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">Discount Value</FormLabel>
                  <NumberInput min={0} value={formData.discountValue} onChange={(v) => setFormData({ ...formData, discountValue: v === '' ? '' : Number(v) })}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">Applicable On</FormLabel>
                  <Select value={formData.applicableOn} onChange={(e) => setFormData({ ...formData, applicableOn: e.target.value })}>
                      <option value="Service Package">Service Package</option>
                      <option value="Hiring Processing Fee">Hiring Processing Fee</option>
                      <option value="All">All</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">Min. Order Value (₹)</FormLabel>
                  <NumberInput min={0} value={formData.minOrderValue} onChange={(v) => setFormData({ ...formData, minOrderValue: v === '' ? '' : Number(v) })}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">Total Usage Limit</FormLabel>
                  <NumberInput min={0} value={formData.usageLimitTotal} onChange={(v) => setFormData({ ...formData, usageLimitTotal: v === '' ? '' : Number(v) })}>
                    <NumberInputField placeholder="0 for unlimited" />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">Usage Limit Per User</FormLabel>
                  <NumberInput min={0} value={formData.usageLimitPerUser} onChange={(v) => setFormData({ ...formData, usageLimitPerUser: v === '' ? '' : Number(v) })}>
                    <NumberInputField placeholder="1" />
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">Valid From</FormLabel>
                  <Input type="date" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">Valid To</FormLabel>
                  <Input type="date" value={formData.validTo} onChange={(e) => setFormData({ ...formData, validTo: e.target.value })} />
                </FormControl>

                <FormControl isRequired gridColumn="span 2">
                  <FormLabel fontSize="sm" fontWeight="semibold">Status</FormLabel>
                  <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="EXPIRED">Expired</option>
                  </Select>
                </FormControl>
            </SimpleGrid>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>Cancel</Button>
            <Button colorScheme="blue" bg="blue.600" onClick={handleSubmit}>Save Offer</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default OfferList;
