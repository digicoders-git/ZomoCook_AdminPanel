import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, FormControl,
  FormLabel, Input, Select, Flex, Heading, Tooltip, Badge,
  NumberInput, NumberInputField, Text, InputGroup, InputLeftElement,
  InputRightElement, HStack, VStack, SimpleGrid, Menu, MenuButton,
  MenuList, MenuItem
} from '@chakra-ui/react';
import {
  Filter, Gift, Calendar, MoreVertical, Pencil, Trash2, Plus,
  Search, Copy, ChevronLeft, ChevronRight
} from 'lucide-react';
import moment from 'moment';
import API_BASE_URL from '../apiConfig';

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

  // Dynamic Master State
  const [masterOfferTypes, setMasterOfferTypes] = useState(['FLAT', 'PERCENTAGE']);
  const [masterApplicableTypes, setMasterApplicableTypes] = useState([
    'All',
    'Service Package',
    'Chef for Party',
    'Daily Staff',
    'Hiring Processing Fee'
  ]);

  // Modal
  const [isOpen, setIsOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  
  const initialFormState = { 
    code: '', title: '', subtitle: '', 
    offerType: 'PERCENTAGE', discountValue: 0, maxDiscountValue: 0,
    targetPlatform: 'All', applicableOn: 'All', minOrderValue: 0, 
    usageLimitTotal: 0, usageLimitPerUser: 1, 
    validFrom: '', validTo: '', status: 'ACTIVE' 
  };
  const [formData, setFormData] = useState(initialFormState);
  
  const toast = useToast();
  const token = localStorage.getItem('adminToken');
  const apiUrl = API_BASE_URL;

  const fetchMasters = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [typeRes, appRes] = await Promise.allSettled([
        axios.get(`${apiUrl}/masters/offer-types`, { headers }),
        axios.get(`${apiUrl}/masters/applicable-types`, { headers })
      ]);

      if (typeRes.status === 'fulfilled' && typeRes.value?.data?.success && Array.isArray(typeRes.value.data.masters) && typeRes.value.data.masters.length > 0) {
        setMasterOfferTypes(typeRes.value.data.masters.map(m => m.name));
      }
      if (appRes.status === 'fulfilled' && appRes.value?.data?.success && Array.isArray(appRes.value.data.masters) && appRes.value.data.masters.length > 0) {
        const fetched = appRes.value.data.masters.map(m => m.name);
        const combined = Array.from(new Set(['All', 'Service Package', 'Chef for Party', 'Daily Staff', 'Hiring Processing Fee', ...fetched]));
        setMasterApplicableTypes(combined);
      }
    } catch (e) {
      console.error('Error fetching offer masters:', e);
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/offers?platform=All`, { headers: { Authorization: `Bearer ${token}` } });
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
    fetchMasters();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = offers;
    
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.trim().toLowerCase();
      result = result.filter(o => 
        (o.code && o.code.toLowerCase().includes(lowerQuery)) || 
        (o.title && o.title.toLowerCase().includes(lowerQuery)) ||
        (o.subtitle && o.subtitle.toLowerCase().includes(lowerQuery))
      );
    }
    if (filterType) {
      result = result.filter(o => o.offerType === filterType);
    }
    if (filterApplicableOn && filterApplicableOn !== 'All') {
      const fLower = filterApplicableOn.toLowerCase();
      result = result.filter(o => {
        if (!o.applicableOn) return false;
        const appLower = o.applicableOn.toLowerCase();
        if (appLower === fLower) return true;
        if (fLower.includes('daily') && appLower.includes('daily')) return true;
        if (fLower.includes('party') && appLower.includes('party')) return true;
        if (fLower.includes('package') && appLower.includes('package')) return true;
        if (fLower.includes('fee') && (appLower.includes('fee') || appLower.includes('processing'))) return true;
        return false;
      });
    }
    if (filterStatus) {
      result = result.filter(o => o.status === filterStatus);
    }
    if (filterDateFrom && filterDateTo) {
      result = result.filter(o => {
        if (!o.validFrom || !o.validTo) return true;
        const offerStart = moment(o.validFrom);
        const offerEnd = moment(o.validTo);
        const filterStart = moment(filterDateFrom);
        const filterEnd = moment(filterDateTo);
        return (offerStart.isSameOrBefore(filterEnd) && offerEnd.isSameOrAfter(filterStart));
      });
    } else if (filterDateFrom) {
      result = result.filter(o => {
        if (!o.validTo) return true;
        return moment(o.validTo).isSameOrAfter(moment(filterDateFrom));
      });
    } else if (filterDateTo) {
      result = result.filter(o => {
        if (!o.validFrom) return true;
        return moment(o.validFrom).isSameOrBefore(moment(filterDateTo));
      });
    }

    setFilteredOffers(result);
    setCurrentPage(1);
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
        offerType: offer.offerType || 'PERCENTAGE',
        discountValue: offer.discountValue !== undefined ? offer.discountValue : (offer.discountPercent || 0),
        maxDiscountValue: offer.maxDiscountValue || 0,
        targetPlatform: offer.targetPlatform || 'All',
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
        toast({ title: 'Offer updated successfully', status: 'success', isClosable: true });
      } else {
        await axios.post(`${apiUrl}/offers`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: 'Offer created successfully', status: 'success', isClosable: true });
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
      confirmButtonColor: '#004aad',
      cancelButtonColor: '#ef4444',
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
    toast({ title: 'Code copied to clipboard!', status: 'success', duration: 2000, isClosable: true });
  };

  // Helper for Service Category pill style matching the reference UI
  const getCategoryStyle = (category = '') => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('party')) return { bg: '#F3E8FF', color: '#7E22CE' }; // Purple
    if (cat.includes('package')) return { bg: '#DCFCE7', color: '#15803D' }; // Green
    if (cat.includes('daily')) return { bg: '#FEF3C7', color: '#B45309' }; // Amber
    if (cat.includes('fee') || cat.includes('processing')) return { bg: '#E0F2FE', color: '#0369A1' }; // Blue
    return { bg: '#F1F5F9', color: '#475569' }; // Gray
  };

  // Helper for Status pill badge matching reference UI
  const getStatusBadge = (status = 'ACTIVE') => {
    const s = (status || 'ACTIVE').toUpperCase();
    if (s === 'ACTIVE') {
      return { bg: '#DCFCE7', color: '#16A34A', dot: '#22C55E', label: 'ACTIVE' };
    }
    if (s === 'SCHEDULED') {
      return { bg: '#FEF3C7', color: '#D97706', dot: '#F59E0B', label: 'SCHEDULED' };
    }
    if (s === 'EXPIRED') {
      return { bg: '#FEE2E2', color: '#DC2626', dot: '#EF4444', label: 'EXPIRED' };
    }
    return { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8', label: s || 'INACTIVE' };
  };

  return (
    <Box p={{ base: 4, md: 6 }} bg="#F8FAFC" minH="100vh">
      {/* Top Header Section */}
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} mb={6} direction={{ base: 'column', md: 'row' }} gap={4}>
        <Box>
          <Heading size="lg" fontWeight="800" color="#1E293B" mb={1} letterSpacing="-0.02em">
            Offer Management
          </Heading>
          <Text color="#64748B" fontSize="sm">
            Create and manage discount offers across all ZomoCook services.
          </Text>
        </Box>
        <Button
          leftIcon={<Plus size={18} />}
          bg="#004AAD"
          color="white"
          _hover={{ bg: "#003B8A" }}
          _active={{ bg: "#002F70" }}
          onClick={() => handleOpen()}
          borderRadius="lg"
          h="42px"
          px={5}
          fontWeight="600"
          fontSize="sm"
          boxShadow="0 2px 8px rgba(0,74,173,0.18)"
        >
          Create New Offer
        </Button>
      </Flex>

      {/* Filter Card */}
      <Box
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid #E8EDF5"
        boxShadow="0 2px 12px rgba(0,74,173,0.04)"
        mb={6}
      >
        <HStack spacing={2} mb={4}>
          <Filter size={18} color="#004AAD" />
          <Text fontSize="md" fontWeight="800" color="#1E1B4B">
            Filter Offers
          </Text>
        </HStack>

        <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} spacing={4} alignItems="flex-end">
          {/* 1. Search by Code or Name */}
          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="1.5">
              Search by Code or Name
            </FormLabel>
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none" h="40px" pl={3}>
                <Search size={16} color="#94A3B8" />
              </InputLeftElement>
              <Input
                placeholder="Enter offer code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                h="40px"
                borderRadius="lg"
                bg="#F8FAFF"
                border="1.5px solid #DDE6F5"
                fontSize="sm"
                color="#1E293B"
                _focus={{ borderColor: "#004AAD", bg: "white", boxShadow: "0 0 0 1px #004AAD" }}
                _placeholder={{ color: "#94A3B8" }}
              />
            </InputGroup>
          </FormControl>

          {/* 2. Offer Type */}
          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="1.5">
              Offer Type
            </FormLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              h="40px"
              borderRadius="lg"
              bg="#F8FAFF"
              border="1.5px solid #DDE6F5"
              fontSize="sm"
              color="#1E293B"
              _focus={{ borderColor: "#004AAD", bg: "white" }}
            >
              <option value="">All Types</option>
              <option value="FLAT">Flat</option>
              <option value="PERCENTAGE">Percentage</option>
            </Select>
          </FormControl>

          {/* 3. Service Category */}
          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="1.5">
              Service Category
            </FormLabel>
            <Select
              value={filterApplicableOn}
              onChange={(e) => setFilterApplicableOn(e.target.value)}
              h="40px"
              borderRadius="lg"
              bg="#F8FAFF"
              border="1.5px solid #DDE6F5"
              fontSize="sm"
              color="#1E293B"
              _focus={{ borderColor: "#004AAD", bg: "white" }}
            >
              <option value="">All</option>
              <option value="Service Package">Service Package</option>
              <option value="Chef for Party">Chef for Party</option>
              <option value="Daily Staff">Daily Staff</option>
              <option value="Hiring Processing Fee">Hiring Processing Fee</option>
            </Select>
          </FormControl>

          {/* 4. Status */}
          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="1.5">
              Status
            </FormLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              h="40px"
              borderRadius="lg"
              bg="#F8FAFF"
              border="1.5px solid #DDE6F5"
              fontSize="sm"
              color="#1E293B"
              _focus={{ borderColor: "#004AAD", bg: "white" }}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="EXPIRED">Expired</option>
            </Select>
          </FormControl>

          {/* 5. Date Range */}
          <FormControl>
            <FormLabel fontSize="xs" fontWeight="700" color="#475569" mb="1.5">
              Date Range
            </FormLabel>
            <SimpleGrid columns={2} spacing={2}>
              <InputGroup size="sm">
                <Input
                  type={filterDateFrom ? "date" : "text"}
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                  }}
                  placeholder="From Date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  h="40px"
                  borderRadius="lg"
                  bg="#F8FAFF"
                  border="1.5px solid #DDE6F5"
                  fontSize="xs"
                  color="#1E293B"
                  _focus={{ borderColor: "#004AAD", bg: "white", boxShadow: "0 0 0 1px #004AAD" }}
                  _placeholder={{ color: "#64748B" }}
                  sx={{
                    '&::-webkit-calendar-picker-indicator': {
                      cursor: 'pointer',
                      opacity: 0,
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: '100%',
                      height: '100%'
                    }
                  }}
                />
                <InputRightElement h="40px" pointerEvents="none" pr={2}>
                  <Calendar size={15} color="#64748B" />
                </InputRightElement>
              </InputGroup>

              <InputGroup size="sm">
                <Input
                  type={filterDateTo ? "date" : "text"}
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                  }}
                  placeholder="To Date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  h="40px"
                  borderRadius="lg"
                  bg="#F8FAFF"
                  border="1.5px solid #DDE6F5"
                  fontSize="xs"
                  color="#1E293B"
                  _focus={{ borderColor: "#004AAD", bg: "white", boxShadow: "0 0 0 1px #004AAD" }}
                  _placeholder={{ color: "#64748B" }}
                  sx={{
                    '&::-webkit-calendar-picker-indicator': {
                      cursor: 'pointer',
                      opacity: 0,
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: '100%',
                      height: '100%'
                    }
                  }}
                />
                <InputRightElement h="40px" pointerEvents="none" pr={2}>
                  <Calendar size={15} color="#64748B" />
                </InputRightElement>
              </InputGroup>
            </SimpleGrid>
          </FormControl>
        </SimpleGrid>

        {/* Filter Buttons */}
        <HStack spacing={3} mt={4}>
          <Button
            variant="outline"
            border="1.5px solid #DDE6F5"
            color="#475569"
            borderRadius="lg"
            h="38px"
            px={6}
            fontSize="sm"
            fontWeight="600"
            _hover={{ bg: "#F8FAFC", borderColor: "#CBD5E1" }}
            onClick={resetFilters}
          >
            Reset
          </Button>
          <Button
            bg="#004AAD"
            color="white"
            borderRadius="lg"
            h="38px"
            px={6}
            fontSize="sm"
            fontWeight="600"
            _hover={{ bg: "#003B8A" }}
            _active={{ bg: "#002F70" }}
          >
            Apply Filters
          </Button>
        </HStack>
      </Box>

      {/* Offers List Card */}
      <Box
        bg="white"
        borderRadius="2xl"
        border="1px solid #E8EDF5"
        boxShadow="0 2px 12px rgba(0,74,173,0.04)"
        overflow="hidden"
      >
        {/* Card Header */}
        <Flex
          px={5}
          py={4}
          justify="space-between"
          align="center"
          borderBottom="1px solid #F1F5F9"
          wrap="wrap"
          gap={3}
        >
          <HStack spacing={2.5}>
            <Gift size={20} color="#004AAD" />
            <Text fontSize="md" fontWeight="800" color="#1E1B4B">
              Offers List ({filteredOffers.length})
            </Text>
          </HStack>

          <HStack spacing={4}>
            <Text fontSize="xs" color="#64748B" fontWeight="500">
              Showing {filteredOffers.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOffers.length)} of {filteredOffers.length} offers
            </Text>
            <Select
              w="115px"
              size="sm"
              h="34px"
              borderRadius="lg"
              bg="#F8FAFF"
              border="1.5px solid #DDE6F5"
              fontSize="xs"
              fontWeight="600"
              color="#475569"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </Select>
          </HStack>
        </Flex>

        {/* Table Section */}
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg="#F8FAFC" borderBottom="1.5px solid #E2E8F0">
              <Tr>
                <Th py={3.5} px={4} fontSize="11px" fontWeight="700" color="#64748B" letterSpacing="0.05em">
                  OFFER CODE
                </Th>
                <Th py={3.5} px={4} fontSize="11px" fontWeight="700" color="#64748B" letterSpacing="0.05em">
                  OFFER NAME
                </Th>
                <Th py={3.5} px={4} fontSize="11px" fontWeight="700" color="#64748B" letterSpacing="0.05em">
                  SERVICE CATEGORY
                </Th>
                <Th py={3.5} px={4} fontSize="11px" fontWeight="700" color="#64748B" letterSpacing="0.05em">
                  OFFER TYPE
                </Th>
                <Th py={3.5} px={4} fontSize="11px" fontWeight="700" color="#64748B" letterSpacing="0.05em">
                  DISCOUNT
                </Th>
                <Th py={3.5} px={4} fontSize="11px" fontWeight="700" color="#64748B" letterSpacing="0.05em">
                  MIN. ORDER VALUE (₹)
                </Th>
                <Th py={3.5} px={4} fontSize="11px" fontWeight="700" color="#64748B" letterSpacing="0.05em">
                  USAGE LIMIT (PER USER)
                </Th>
                <Th py={3.5} px={4} fontSize="11px" fontWeight="700" color="#64748B" letterSpacing="0.05em">
                  VALIDITY (FROM - TO)
                </Th>
                <Th py={3.5} px={4} fontSize="11px" fontWeight="700" color="#64748B" letterSpacing="0.05em">
                  STATUS
                </Th>
                <Th py={3.5} px={4} fontSize="11px" fontWeight="700" color="#64748B" letterSpacing="0.05em" textAlign="center">
                  ACTIONS
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentItems.map((o) => {
                const catStyle = getCategoryStyle(o.applicableOn);
                const statBadge = getStatusBadge(o.status);

                return (
                  <Tr
                    key={o._id}
                    _hover={{ bg: "#F8FAFC" }}
                    borderBottom="1px solid #F1F5F9"
                    transition="background 0.15s"
                  >
                    {/* 1. OFFER CODE */}
                    <Td py={4} px={4}>
                      <Badge
                        bg="#E0F2FE"
                        color="#0284C7"
                        px={3}
                        py={1.5}
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight="700"
                        letterSpacing="0.04em"
                        textTransform="uppercase"
                      >
                        {o.code}
                      </Badge>
                    </Td>

                    {/* 2. OFFER NAME */}
                    <Td py={4} px={4} maxW="280px">
                      <Text fontSize="sm" fontWeight="700" color="#0F172A" lineHeight="1.3">
                        {o.title}
                      </Text>
                      {o.subtitle && (
                        <Text fontSize="xs" color="#64748B" mt="1" lineHeight="1.3">
                          {o.subtitle}
                        </Text>
                      )}
                    </Td>

                    {/* 3. SERVICE CATEGORY */}
                    <Td py={4} px={4}>
                      <Badge
                        bg={catStyle.bg}
                        color={catStyle.color}
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="600"
                        textTransform="none"
                      >
                        {o.applicableOn || 'All'}
                      </Badge>
                    </Td>

                    {/* 4. OFFER TYPE */}
                    <Td py={4} px={4}>
                      <Badge
                        bg={o.offerType === 'FLAT' ? '#E0F2FE' : '#FEF3C7'}
                        color={o.offerType === 'FLAT' ? '#0284C7' : '#D97706'}
                        px={2.5}
                        py={0.5}
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight="600"
                        textTransform="capitalize"
                      >
                        {o.offerType === 'FLAT' ? 'Flat' : (o.offerType === 'PERCENTAGE' ? 'Percentage' : o.offerType)}
                      </Badge>
                    </Td>

                    {/* 5. DISCOUNT */}
                    <Td py={4} px={4}>
                      <Text fontSize="sm" fontWeight="700" color="#0F172A">
                        {o.offerType === 'FLAT'
                          ? `₹${Number(o.discountValue || 0).toLocaleString('en-IN')}`
                          : `${o.discountValue || 0}%`}
                      </Text>
                      {o.offerType === 'PERCENTAGE' && o.maxDiscountValue > 0 && (
                        <Text fontSize="10px" color="#64748B" mt="0.5">
                          Cap: ₹{Number(o.maxDiscountValue).toLocaleString('en-IN')}
                        </Text>
                      )}
                    </Td>

                    {/* 6. MIN. ORDER VALUE (₹) */}
                    <Td py={4} px={4}>
                      <Text fontSize="sm" fontWeight="600" color="#334155">
                        ₹{Number(o.minOrderValue || 0).toLocaleString('en-IN')}
                      </Text>
                    </Td>

                    {/* 7. USAGE LIMIT (PER USER) */}
                    <Td py={4} px={4}>
                      <Text fontSize="sm" fontWeight="500" color="#334155">
                        {o.usageLimitPerUser ? `${o.usageLimitPerUser} per user` : '1 per user'}
                      </Text>
                    </Td>

                    {/* 8. VALIDITY (FROM - TO) */}
                    <Td py={4} px={4}>
                      <VStack align="start" spacing={0} fontSize="xs" color="#475569" lineHeight="1.4">
                        <Text>{o.validFrom ? moment(o.validFrom).format('DD MMM YYYY') : '-'}</Text>
                        <Text color="#94A3B8">–</Text>
                        <Text>{o.validTo ? moment(o.validTo).format('DD MMM YYYY') : '-'}</Text>
                      </VStack>
                    </Td>

                    {/* 9. STATUS */}
                    <Td py={4} px={4}>
                      <HStack
                        spacing="1.5"
                        bg={statBadge.bg}
                        color={statBadge.color}
                        px={3}
                        py={1}
                        borderRadius="full"
                        display="inline-flex"
                      >
                        <Box w="6px" h="6px" borderRadius="full" bg={statBadge.dot} />
                        <Text fontSize="11px" fontWeight="700" letterSpacing="0.05em">
                          {statBadge.label}
                        </Text>
                      </HStack>
                    </Td>

                    {/* 10. ACTIONS */}
                    <Td py={4} px={4}>
                      <HStack spacing={1.5} justify="center">
                        <Tooltip label="Copy Code" hasArrow placement="top">
                          <IconButton
                            size="sm"
                            variant="ghost"
                            color="#004AAD"
                            _hover={{ bg: "#E0F2FE" }}
                            icon={<Copy size={16} />}
                            onClick={() => handleCopyCode(o.code)}
                            aria-label="Copy code"
                            borderRadius="md"
                          />
                        </Tooltip>
                        <Tooltip label="Edit Offer" hasArrow placement="top">
                          <IconButton
                            size="sm"
                            variant="ghost"
                            color="#004AAD"
                            _hover={{ bg: "#E0F2FE" }}
                            icon={<Pencil size={16} />}
                            onClick={() => handleOpen(o)}
                            aria-label="Edit offer"
                            borderRadius="md"
                          />
                        </Tooltip>
                        <Menu isLazy>
                          <MenuButton
                            as={IconButton}
                            size="sm"
                            variant="ghost"
                            color="#64748B"
                            _hover={{ bg: "#F1F5F9", color: "#0F172A" }}
                            icon={<MoreVertical size={16} />}
                            aria-label="More options"
                            borderRadius="md"
                          />
                          <MenuList shadow="xl" borderColor="#E2E8F0" minW="140px" py={1.5}>
                            <MenuItem
                              icon={<Trash2 size={14} color="#EF4444" />}
                              color="#EF4444"
                              fontSize="xs"
                              fontWeight="600"
                              _hover={{ bg: "#FEE2E2" }}
                              onClick={() => handleDelete(o._id)}
                            >
                              Delete Offer
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}

              {currentItems.length === 0 && (
                <Tr>
                  <Td colSpan={10} textAlign="center" py={10} color="#64748B" fontSize="sm">
                    No offers found matching your criteria.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination Footer */}
        <Flex
          justify="space-between"
          align="center"
          px={5}
          py={4}
          borderTop="1px solid #F1F5F9"
          wrap="wrap"
          gap={2}
        >
          <Text fontSize="xs" color="#64748B" fontWeight="500">
            Showing {filteredOffers.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOffers.length)} of {filteredOffers.length} offers
          </Text>
          <HStack spacing={1.5}>
            <IconButton
              icon={<ChevronLeft size={16} />}
              size="sm"
              variant="outline"
              borderColor="#E2E8F0"
              color="#64748B"
              borderRadius="md"
              w="32px"
              h="32px"
              minW="32px"
              isDisabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              aria-label="Previous page"
              _hover={{ bg: "#F8FAFC" }}
            />
            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                size="sm"
                w="32px"
                h="32px"
                minW="32px"
                p={0}
                borderRadius="md"
                bg={currentPage === page ? "#004AAD" : "transparent"}
                color={currentPage === page ? "white" : "#475569"}
                border={currentPage === page ? "none" : "1px solid #E2E8F0"}
                fontWeight="700"
                fontSize="xs"
                _hover={{ bg: currentPage === page ? "#003B8A" : "#F8FAFC" }}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <IconButton
              icon={<ChevronRight size={16} />}
              size="sm"
              variant="outline"
              borderColor="#E2E8F0"
              color="#64748B"
              borderRadius="md"
              w="32px"
              h="32px"
              minW="32px"
              isDisabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              aria-label="Next page"
              _hover={{ bg: "#F8FAFC" }}
            />
          </HStack>
        </Flex>
      </Box>

      {/* Add / Edit Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(2px)" />
        <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="0 10px 30px rgba(0,0,0,0.15)">
          <ModalHeader bg="#F8FAFC" borderBottom="1px solid #E2E8F0" py={4} px={6}>
            <Text fontSize="lg" fontWeight="800" color="#1E293B">
              {currentOffer ? 'Edit Offer' : 'Create New Offer'}
            </Text>
          </ModalHeader>
          <ModalCloseButton mt={2} />
          
          <ModalBody p={6}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700" color="#475569">Promo Code</FormLabel>
                <Input
                  placeholder="e.g. FLAT299"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  borderRadius="lg"
                  bg="#F8FAFF"
                  border="1.5px solid #DDE6F5"
                  _focus={{ borderColor: "#004AAD", bg: "white" }}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700" color="#475569">Offer Title</FormLabel>
                <Input
                  placeholder="e.g. Flat ₹299 OFF"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  borderRadius="lg"
                  bg="#F8FAFF"
                  border="1.5px solid #DDE6F5"
                  _focus={{ borderColor: "#004AAD", bg: "white" }}
                />
              </FormControl>

              <FormControl gridColumn={{ base: 'span 1', md: 'span 2' }}>
                <FormLabel fontSize="xs" fontWeight="700" color="#475569">Offer Subtitle / Description</FormLabel>
                <Input
                  placeholder="e.g. Enjoy flat ₹299 off on your next booking."
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  borderRadius="lg"
                  bg="#F8FAFF"
                  border="1.5px solid #DDE6F5"
                  _focus={{ borderColor: "#004AAD", bg: "white" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700" color="#475569">Offer Type</FormLabel>
                <Select
                  value={formData.offerType}
                  onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}
                  borderRadius="lg"
                  bg="#F8FAFF"
                  border="1.5px solid #DDE6F5"
                  _focus={{ borderColor: "#004AAD", bg: "white" }}
                >
                  <option value="FLAT">Flat Amount</option>
                  <option value="PERCENTAGE">Percentage</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700" color="#475569">
                  Discount Value {formData.offerType === 'PERCENTAGE' ? '(%)' : '(₹)'}
                </FormLabel>
                <NumberInput
                  min={0}
                  value={formData.discountValue}
                  onChange={(v) => setFormData({ ...formData, discountValue: v === '' ? '' : Number(v) })}
                >
                  <NumberInputField
                    borderRadius="lg"
                    bg="#F8FAFF"
                    border="1.5px solid #DDE6F5"
                    _focus={{ borderColor: "#004AAD", bg: "white" }}
                  />
                </NumberInput>
              </FormControl>

              {formData.offerType === 'PERCENTAGE' && (
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="700" color="#475569">Max Discount Cap (₹)</FormLabel>
                  <NumberInput
                    min={0}
                    value={formData.maxDiscountValue}
                    onChange={(v) => setFormData({ ...formData, maxDiscountValue: v === '' ? 0 : Number(v) })}
                  >
                    <NumberInputField
                      placeholder="0 = No cap"
                      borderRadius="lg"
                      bg="#F8FAFF"
                      border="1.5px solid #DDE6F5"
                      _focus={{ borderColor: "#004AAD", bg: "white" }}
                    />
                  </NumberInput>
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700" color="#475569">Service Category</FormLabel>
                <Select
                  value={formData.applicableOn}
                  onChange={(e) => setFormData({ ...formData, applicableOn: e.target.value })}
                  borderRadius="lg"
                  bg="#F8FAFF"
                  border="1.5px solid #DDE6F5"
                  _focus={{ borderColor: "#004AAD", bg: "white" }}
                >
                  <option value="All">All Categories</option>
                  <option value="Service Package">Service Package</option>
                  <option value="Chef for Party">Chef for Party</option>
                  <option value="Daily Staff">Daily Staff</option>
                  <option value="Hiring Processing Fee">Hiring Processing Fee</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700" color="#475569">Target Platform</FormLabel>
                <Select
                  value={formData.targetPlatform}
                  onChange={(e) => setFormData({ ...formData, targetPlatform: e.target.value })}
                  borderRadius="lg"
                  bg="#F8FAFF"
                  border="1.5px solid #DDE6F5"
                  _focus={{ borderColor: "#004AAD", bg: "white" }}
                >
                  <option value="All">All Platforms (App & Website)</option>
                  <option value="App">Mobile App Only</option>
                  <option value="Website">Website Only</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="700" color="#475569">Min. Order Value (₹)</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.minOrderValue}
                  onChange={(v) => setFormData({ ...formData, minOrderValue: v === '' ? '' : Number(v) })}
                >
                  <NumberInputField
                    borderRadius="lg"
                    bg="#F8FAFF"
                    border="1.5px solid #DDE6F5"
                    _focus={{ borderColor: "#004AAD", bg: "white" }}
                  />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="700" color="#475569">Total Usage Limit</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.usageLimitTotal}
                  onChange={(v) => setFormData({ ...formData, usageLimitTotal: v === '' ? '' : Number(v) })}
                >
                  <NumberInputField
                    placeholder="0 for unlimited"
                    borderRadius="lg"
                    bg="#F8FAFF"
                    border="1.5px solid #DDE6F5"
                    _focus={{ borderColor: "#004AAD", bg: "white" }}
                  />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="700" color="#475569">Usage Limit Per User</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.usageLimitPerUser}
                  onChange={(v) => setFormData({ ...formData, usageLimitPerUser: v === '' ? '' : Number(v) })}
                >
                  <NumberInputField
                    placeholder="1"
                    borderRadius="lg"
                    bg="#F8FAFF"
                    border="1.5px solid #DDE6F5"
                    _focus={{ borderColor: "#004AAD", bg: "white" }}
                  />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700" color="#475569">Valid From</FormLabel>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  borderRadius="lg"
                  bg="#F8FAFF"
                  border="1.5px solid #DDE6F5"
                  _focus={{ borderColor: "#004AAD", bg: "white" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="700" color="#475569">Valid To</FormLabel>
                <Input
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  borderRadius="lg"
                  bg="#F8FAFF"
                  border="1.5px solid #DDE6F5"
                  _focus={{ borderColor: "#004AAD", bg: "white" }}
                />
              </FormControl>

              <FormControl isRequired gridColumn={{ base: 'span 1', md: 'span 2' }}>
                <FormLabel fontSize="xs" fontWeight="700" color="#475569">Status</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  borderRadius="lg"
                  bg="#F8FAFF"
                  border="1.5px solid #DDE6F5"
                  _focus={{ borderColor: "#004AAD", bg: "white" }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="EXPIRED">Expired</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </ModalBody>

          <ModalFooter bg="#F8FAFC" borderTop="1px solid #E2E8F0" py={3} px={6}>
            <Button variant="outline" mr={3} onClick={handleClose} borderRadius="lg" border="1.5px solid #DDE6F5">
              Cancel
            </Button>
            <Button
              bg="#004AAD"
              color="white"
              _hover={{ bg: "#003B8A" }}
              onClick={handleSubmit}
              borderRadius="lg"
              px={6}
            >
              Save Offer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default OfferList;
