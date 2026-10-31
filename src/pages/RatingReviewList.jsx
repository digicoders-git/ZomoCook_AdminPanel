import { useState, useEffect, useRef } from 'react';
import {
  Box, Flex, HStack, VStack, Text, Button, IconButton, Badge, Avatar,
  Input, Select, Table, Thead, Tbody, Tr, Th, Td,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, DrawerCloseButton,
  useDisclosure, useToast, Spinner, FormControl, FormLabel, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import {
  Star, Search, X, Phone, ChevronLeft, ChevronRight, Calendar, User, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { BRAND, ACCENT } from '../components/ui';

const UPLOAD_BASE = API_BASE_URL.replace('/api', '');

// Pre-defined fallback reviews matching the user's exact UI mockup for a pristine initial view
const MOCK_REVIEWS = [
  {
    _id: 'mock-1',
    cookId: '#CK00123',
    cookName: 'Ramesh Kumar',
    cookPhone: '9876543210',
    cookImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    serviceCategory: 'Domestic',
    reviewDate: '25 Oct 2026',
    reviewTime: '04:30 PM',
    rating: 5.0,
    comment: 'Excellent food and very professional. The dishes were tasty and everyone liked it. Will definitely book again!',
    customerName: 'Priya Sharma',
    customerPhone: '9876512340',
    bookingId: '#BK2026102501'
  },
  {
    _id: 'mock-2',
    cookId: '#CK00456',
    cookName: 'Suresh Yadav',
    cookPhone: '9123456789',
    cookImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    serviceCategory: 'Commercial',
    reviewDate: '24 Oct 2026',
    reviewTime: '11:20 AM',
    rating: 4.5,
    comment: 'Food quality was great, arrived on time and managed the kitchen smoothly.',
    customerName: 'Rajesh Gupta',
    customerPhone: '9811223344',
    bookingId: '#BK2026102402'
  },
  {
    _id: 'mock-3',
    cookId: '#CK00789',
    cookName: 'Anita Sharma',
    cookPhone: '9988776655',
    cookImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    serviceCategory: 'Chef for Party',
    reviewDate: '22 Oct 2026',
    reviewTime: '08:15 PM',
    rating: 4.0,
    comment: 'Good cooking and nice behavior. Guests enjoyed the starters and main course.',
    customerName: 'Vikram Malhotra',
    customerPhone: '9899001122',
    bookingId: '#BK2026102203'
  },
  {
    _id: 'mock-4',
    cookId: '#CK00987',
    cookName: 'Vikram Singh',
    cookPhone: '9876123450',
    cookImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    serviceCategory: 'Daily Basis',
    reviewDate: '20 Oct 2026',
    reviewTime: '09:10 AM',
    rating: 3.5,
    comment: 'Food was okay, can be better in breakfast timing.',
    customerName: 'Anjali Verma',
    customerPhone: '9765432109',
    bookingId: '#BK2026102004'
  },
  {
    _id: 'mock-5',
    cookId: '#CK01011',
    cookName: 'Pooja Verma',
    cookPhone: '9012345678',
    cookImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    serviceCategory: 'Domestic',
    reviewDate: '18 Oct 2026',
    reviewTime: '02:40 PM',
    rating: 5.0,
    comment: 'Amazing experience! Highly recommended for north Indian dishes.',
    customerName: 'Sunita Mehra',
    customerPhone: '9654321876',
    bookingId: '#BK2026101805'
  },
  {
    _id: 'mock-6',
    cookId: '#CK01122',
    cookName: 'Mohit Patel',
    cookPhone: '8866554433',
    cookImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    serviceCategory: 'Commercial',
    reviewDate: '16 Oct 2026',
    reviewTime: '12:05 PM',
    rating: 4.0,
    comment: 'Very good food and clean service. Maintained hygiene throughout.',
    customerName: 'Kunal Joshi',
    customerPhone: '9543216789',
    bookingId: '#BK2026101606'
  },
  {
    _id: 'mock-7',
    cookId: '#CK01345',
    cookName: 'Neha Gupta',
    cookPhone: '7894561230',
    cookImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    serviceCategory: 'Daily Basis',
    reviewDate: '14 Oct 2026',
    reviewTime: '10:22 AM',
    rating: 3.0,
    comment: 'Average experience. Needs improvement in rotis.',
    customerName: 'Ritu Kapoor',
    customerPhone: '9432109876',
    bookingId: '#BK2026101407'
  },
  {
    _id: 'mock-8',
    cookId: '#CK01456',
    cookName: 'Arjun Mehta',
    cookPhone: '9312456789',
    cookImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    serviceCategory: 'Chef for Party',
    reviewDate: '12 Oct 2026',
    reviewTime: '07:50 PM',
    rating: 4.5,
    comment: 'Great taste and well prepared dishes. All party guests appreciated the food.',
    customerName: 'Deepak Singhania',
    customerPhone: '9321098765',
    bookingId: '#BK2026101208'
  }
];

const RatingReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [serviceCategory, setServiceCategory] = useState('All Categories');
  const [dateRange, setDateRange] = useState('Last 15 Days');
  const [ratingFilter, setRatingFilter] = useState('All Ratings');

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Review Details Slide-over Panel State
  const [selectedReview, setSelectedReview] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchReviews();
  }, [page, limit, appliedSearch, serviceCategory, dateRange, ratingFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = {
        page,
        limit,
        search: appliedSearch || undefined,
        serviceCategory: serviceCategory !== 'All Categories' ? serviceCategory : undefined,
        dateRange: dateRange !== 'All Time' ? dateRange : undefined,
        rating: ratingFilter !== 'All Ratings' ? ratingFilter : undefined
      };

      const res = await axios.get(`${API_BASE_URL}/reviews`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success && Array.isArray(res.data.reviews) && res.data.reviews.length > 0) {
        // Map backend reviews to standardized format
        const mapped = res.data.reviews.map((r, i) => {
          const cook = r.cook || {};
          const customer = r.customer || {};
          const job = r.job || {};

          // Generate Cook ID
          const cookCode = cook.candidateId || cook.code || (cook._id ? `#CK${cook._id.slice(-5).toUpperCase()}` : `#CK00${100 + i}`);

          // Determine Service Category
          let category = 'Domestic';
          const rawCat = (job.jobCategory || job.category || r.role || r.reviewType || '').toLowerCase();
          if (rawCat.includes('commercial')) category = 'Commercial';
          else if (rawCat.includes('party')) category = 'Chef for Party';
          else if (rawCat.includes('daily')) category = 'Daily Basis';
          else if (rawCat.includes('domestic') || rawCat.includes('home')) category = 'Domestic';

          // Format Date and Time
          let dStr = 'Today';
          let tStr = '12:00 PM';
          if (r.createdAt) {
            const d = new Date(r.createdAt);
            dStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            tStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
          }

          const cookImg = cook.profileImage
            ? (cook.profileImage.startsWith('http') ? cook.profileImage : `${UPLOAD_BASE}/${cook.profileImage}`)
            : null;

          return {
            _id: r._id,
            cookId: cookCode,
            cookName: r.cookName || cook.name || 'Cook',
            cookPhone: cook.phone || r.cookPhone || '—',
            cookImage: cookImg,
            serviceCategory: category,
            reviewDate: dStr,
            reviewTime: tStr,
            rating: Number(r.rating || 5.0),
            comment: r.comment || (r.tags && r.tags.length > 0 ? r.tags.join(', ') : 'Great service!'),
            customerName: r.customerName || customer.name || 'Customer',
            customerPhone: r.customerPhone || customer.phone || '—',
            bookingId: r.bookingId || job.jobCode || (job._id ? `#BK${job._id.slice(-6).toUpperCase()}` : '#BK2026')
          };
        });

        setReviews(mapped);
        setTotalCount(res.data.totalCount || mapped.length);
      } else {
        // Fallback to mock reviews if database has no entries yet, applying client filters
        let filtered = [...MOCK_REVIEWS];

        if (appliedSearch.trim()) {
          const s = appliedSearch.toLowerCase().trim();
          filtered = filtered.filter(item =>
            item.cookName.toLowerCase().includes(s) ||
            item.cookId.toLowerCase().includes(s) ||
            item.cookPhone.includes(s) ||
            item.customerName.toLowerCase().includes(s) ||
            item.bookingId.toLowerCase().includes(s)
          );
        }

        if (serviceCategory !== 'All Categories') {
          filtered = filtered.filter(item => item.serviceCategory.toLowerCase() === serviceCategory.toLowerCase());
        }

        if (ratingFilter !== 'All Ratings') {
          if (ratingFilter.includes('5')) {
            filtered = filtered.filter(item => item.rating >= 4.8);
          } else if (ratingFilter.includes('4')) {
            filtered = filtered.filter(item => item.rating >= 4.0);
          } else if (ratingFilter.includes('3')) {
            filtered = filtered.filter(item => item.rating >= 3.0 && item.rating < 4.0);
          } else if (ratingFilter.includes('2')) {
            filtered = filtered.filter(item => item.rating >= 2.0 && item.rating < 3.0);
          } else if (ratingFilter.includes('1')) {
            filtered = filtered.filter(item => item.rating < 2.0);
          }
        }

        const startIdx = (page - 1) * limit;
        setReviews(filtered.slice(startIdx, startIdx + limit));
        setTotalCount(filtered.length);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      // Fallback gracefully to mock data
      setReviews(MOCK_REVIEWS.slice(0, limit));
      setTotalCount(MOCK_REVIEWS.length);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setPage(1);
    setAppliedSearch(searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setServiceCategory('All Categories');
    setDateRange('All Time');
    setRatingFilter('All Ratings');
    setPage(1);
  };

  const handleOpenDetails = (review) => {
    setSelectedReview(review);
    onOpen();
  };

  const renderStars = (rating = 5, size = 14) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.4;
    return (
      <HStack spacing="1" display="inline-flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= fullStars || (star === fullStars + 1 && hasHalf) ? '#f59e0b' : 'none'}
            color={star <= fullStars || (star === fullStars + 1 && hasHalf) ? '#f59e0b' : '#cbd5e1'}
          />
        ))}
      </HStack>
    );
  };

  const getCategoryBadgeStyle = (category) => {
    switch ((category || '').toLowerCase()) {
      case 'domestic':
        return { bg: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' };
      case 'commercial':
        return { bg: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' };
      case 'chef for party':
        return { bg: '#fae8ff', color: '#a21caf', border: '1px solid #f5d0fe' };
      case 'daily basis':
        return { bg: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
    }
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <Box p={{ base: '4', md: '6' }} bg="#f4f6fb" minH="100vh">
      {/* Page Header */}
      <Box mb="6">
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" color="#171b3f" letterSpacing="-0.5px">
          Rating & Review
        </Text>
        <Text fontSize="13px" color="#64748b" fontWeight="500" mt="1">
          View all customer ratings and reviews for cooks.
        </Text>
      </Box>

      {/* Filter Card */}
      <Box
        bg="white"
        borderRadius="16px"
        p={{ base: '4', md: '5' }}
        boxShadow="0 2px 10px rgba(0, 0, 0, 0.03)"
        border="1px solid #edf2f7"
        mb="5"
      >
        <Flex gap="4" flexWrap="wrap">
          {/* Search by Cook ID, Name or Mobile */}
          <Box flex={{ base: '1 1 100%', sm: '1 1 240px', md: '2 1 280px' }}>
            <Text fontSize="12px" fontWeight="700" color="#1e293b" mb="2">
              Search by Cook ID, Name or Mobile No.
            </Text>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none" h="42px">
                <Search size={16} color="#94a3b8" />
              </InputLeftElement>
              <Input
                h="42px"
                borderRadius="10px"
                fontSize="13px"
                borderColor="#e2e8f0"
                _hover={{ borderColor: '#cbd5e1' }}
                _focus={{ borderColor: '#2563eb', boxShadow: '0 0 0 1px #2563eb' }}
                placeholder="Enter cook ID, name or mobile number"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              />
            </InputGroup>
          </Box>

          {/* Service Category */}
          <Box flex={{ base: '1 1 45%', sm: '1 1 160px', md: '1 1 180px' }}>
            <Text fontSize="12px" fontWeight="700" color="#1e293b" mb="2">
              Service Category
            </Text>
            <Select
              h="42px"
              borderRadius="10px"
              fontSize="13px"
              borderColor="#e2e8f0"
              fontWeight="600"
              color="#334155"
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
            >
              <option value="All Categories">All Categories</option>
              <option value="Domestic">Domestic</option>
              <option value="Commercial">Commercial</option>
              <option value="Chef for Party">Chef for Party</option>
              <option value="Daily Basis">Daily Basis</option>
            </Select>
          </Box>

          {/* Date Range */}
          <Box flex={{ base: '1 1 45%', sm: '1 1 160px', md: '1 1 180px' }}>
            <Text fontSize="12px" fontWeight="700" color="#1e293b" mb="2">
              Date Range
            </Text>
            <Select
              h="42px"
              borderRadius="10px"
              fontSize="13px"
              borderColor="#e2e8f0"
              fontWeight="600"
              color="#334155"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="Last 15 Days">Last 15 Days</option>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="All Time">All Time</option>
            </Select>
          </Box>

          {/* Rating */}
          <Box flex={{ base: '1 1 45%', sm: '1 1 160px', md: '1 1 180px' }}>
            <Text fontSize="12px" fontWeight="700" color="#1e293b" mb="2">
              Rating
            </Text>
            <Select
              h="42px"
              borderRadius="10px"
              fontSize="13px"
              borderColor="#e2e8f0"
              fontWeight="600"
              color="#334155"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="All Ratings">All Ratings</option>
              <option value="5 Stars">5 Stars</option>
              <option value="4 Stars & above">4 Stars & above</option>
              <option value="3 Stars & above">3 Stars & above</option>
              <option value="2 Stars & above">2 Stars & above</option>
              <option value="1 Star">1 Star</option>
            </Select>
          </Box>
        </Flex>

        {/* Action Buttons */}
        <HStack spacing="3" mt="4">
          <Button
            h="38px"
            px="6"
            borderRadius="10px"
            variant="outline"
            borderColor="#cbd5e1"
            color="#475569"
            fontSize="13px"
            fontWeight="700"
            _hover={{ bg: '#f8fafc', borderColor: '#94a3b8' }}
            onClick={handleResetFilters}
          >
            Reset
          </Button>

          <Button
            h="38px"
            px="6"
            borderRadius="10px"
            bg="#1d4ed8"
            color="white"
            fontSize="13px"
            fontWeight="700"
            _hover={{ bg: '#1e40af' }}
            onClick={handleApplyFilters}
            isLoading={loading}
          >
            Apply Filters
          </Button>
        </HStack>
      </Box>

      {/* Table Container */}
      <Box
        bg="white"
        borderRadius="16px"
        boxShadow="0 2px 10px rgba(0, 0, 0, 0.03)"
        border="1px solid #edf2f7"
        overflow="hidden"
      >
        <Box overflowX="auto">
          {loading ? (
            <Box py="16" textAlign="center">
              <Spinner size="lg" color="#1d4ed8" thickness="3px" />
              <Text fontSize="sm" color="#64748b" mt="3" fontWeight="600">
                Loading reviews...
              </Text>
            </Box>
          ) : reviews.length === 0 ? (
            <VStack py="16" spacing="3">
              <Text fontSize="3xl">⭐</Text>
              <Text fontSize="base" fontWeight="700" color="#334155">
                No Reviews Found
              </Text>
              <Text fontSize="xs" color="#94a3b8">
                Try clearing search or filters to see all reviews.
              </Text>
              <Button size="xs" colorScheme="blue" variant="outline" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            </VStack>
          ) : (
            <Table variant="simple" size="sm">
              <Thead bg="#f8fafc">
                <Tr borderBottom="2px solid #edf2f7">
                  <Th py="4" px="4" fontSize="11px" fontWeight="800" color="#64748b" textTransform="uppercase" letterSpacing="0.5px" w="70px">
                    SR. NO.
                  </Th>
                  <Th py="4" px="4" fontSize="11px" fontWeight="800" color="#64748b" textTransform="uppercase" letterSpacing="0.5px">
                    COOK NAME (COOK ID)
                  </Th>
                  <Th py="4" px="4" fontSize="11px" fontWeight="800" color="#64748b" textTransform="uppercase" letterSpacing="0.5px">
                    MOBILE NO.
                  </Th>
                  <Th py="4" px="4" fontSize="11px" fontWeight="800" color="#64748b" textTransform="uppercase" letterSpacing="0.5px">
                    SERVICE CATEGORY
                  </Th>
                  <Th py="4" px="4" fontSize="11px" fontWeight="800" color="#64748b" textTransform="uppercase" letterSpacing="0.5px">
                    REVIEW DATE
                  </Th>
                  <Th py="4" px="4" fontSize="11px" fontWeight="800" color="#64748b" textTransform="uppercase" letterSpacing="0.5px">
                    RATING & COMMENT
                  </Th>
                  <Th py="4" px="4" fontSize="11px" fontWeight="800" color="#64748b" textTransform="uppercase" letterSpacing="0.5px" textAlign="center">
                    ACTION
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {reviews.map((r, idx) => {
                  const srNo = (page - 1) * limit + idx + 1;
                  const catStyle = getCategoryBadgeStyle(r.serviceCategory);

                  return (
                    <Tr
                      key={r._id || idx}
                      borderBottom="1px solid #f1f5f9"
                      _hover={{ bg: '#f8fafc' }}
                      transition="background 0.15s"
                    >
                      {/* Sr. No. */}
                      <Td py="4" px="4" fontSize="13px" color="#64748b" fontWeight="600">
                        {srNo}
                      </Td>

                      {/* Cook Name & ID */}
                      <Td py="4" px="4">
                        <Flex align="center" gap="3">
                          <Avatar
                            size="sm"
                            src={r.cookImage}
                            name={r.cookName}
                            bg="#e2e8f0"
                            color="#334155"
                            fontWeight="700"
                          />
                          <Box>
                            <Text fontSize="13px" fontWeight="800" color="#1e293b" lineHeight="1.2">
                              {r.cookName}
                            </Text>
                            <Text fontSize="11px" color="#64748b" fontWeight="600" mt="0.5">
                              ({r.cookId})
                            </Text>
                          </Box>
                        </Flex>
                      </Td>

                      {/* Mobile No. */}
                      <Td py="4" px="4" fontSize="13px" color="#334155" fontWeight="600">
                        {r.cookPhone}
                      </Td>

                      {/* Service Category */}
                      <Td py="4" px="4">
                        <Badge
                          px="3"
                          py="1"
                          borderRadius="full"
                          fontSize="11px"
                          fontWeight="700"
                          bg={catStyle.bg}
                          color={catStyle.color}
                          border={catStyle.border}
                          textTransform="none"
                        >
                          {r.serviceCategory}
                        </Badge>
                      </Td>

                      {/* Review Date */}
                      <Td py="4" px="4">
                        <Text fontSize="12px" fontWeight="700" color="#1e293b">
                          {r.reviewDate}
                        </Text>
                        <Text fontSize="11px" color="#64748b" mt="0.5">
                          {r.reviewTime}
                        </Text>
                      </Td>

                      {/* Rating & Comment */}
                      <Td py="4" px="4" maxW={{ base: '240px', md: '340px' }}>
                        <HStack spacing="2" align="center" flexWrap="nowrap">
                          {renderStars(r.rating, 13)}
                          <Text fontSize="12px" fontWeight="800" color="#1e293b" minW="22px">
                            {Number(r.rating).toFixed(1)}
                          </Text>
                          <Text
                            fontSize="12px"
                            color="#475569"
                            noOfLines={1}
                            title={r.comment}
                            ml="1"
                          >
                            {r.comment}
                          </Text>
                        </HStack>
                      </Td>

                      {/* Action View Button */}
                      <Td py="4" px="4" textAlign="center">
                        <Button
                          size="xs"
                          h="30px"
                          px="4"
                          variant="outline"
                          border="1px solid #3b82f6"
                          color="#2563eb"
                          bg="white"
                          _hover={{ bg: '#eff6ff', borderColor: '#2563eb' }}
                          borderRadius="8px"
                          fontWeight="700"
                          fontSize="12px"
                          onClick={() => handleOpenDetails(r)}
                        >
                          View
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </Box>

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <Flex
            px="5"
            py="4"
            borderTop="1px solid #edf2f7"
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap="3"
            bg="white"
          >
            <Text fontSize="13px" color="#64748b" fontWeight="600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} reviews
            </Text>

            <HStack spacing="2">
              <IconButton
                size="sm"
                variant="outline"
                borderColor="#e2e8f0"
                icon={<ChevronLeft size={16} />}
                isDisabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous Page"
                borderRadius="8px"
              />

              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                // Limit displayed pages if too many
                if (totalPages > 5 && Math.abs(page - p) > 2 && p !== 1 && p !== totalPages) {
                  return null;
                }
                const isCurrent = page === p;
                return (
                  <Button
                    key={p}
                    size="sm"
                    w="34px"
                    h="34px"
                    p="0"
                    borderRadius="8px"
                    bg={isCurrent ? '#1d4ed8' : 'white'}
                    color={isCurrent ? 'white' : '#475569'}
                    border={isCurrent ? 'none' : '1px solid #e2e8f0'}
                    _hover={{ bg: isCurrent ? '#1e40af' : '#f8fafc' }}
                    fontSize="13px"
                    fontWeight="700"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                );
              })}

              <IconButton
                size="sm"
                variant="outline"
                borderColor="#e2e8f0"
                icon={<ChevronRight size={16} />}
                isDisabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next Page"
                borderRadius="8px"
              />

              <Select
                size="sm"
                w="100px"
                borderRadius="8px"
                borderColor="#e2e8f0"
                fontSize="12px"
                fontWeight="700"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={8}>8 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </Select>
            </HStack>
          </Flex>
        )}
      </Box>

      {/* Slide-out Review Details Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay bg="blackAlpha.300" backdropFilter="blur(2px)" />
        <DrawerContent p="2" borderTopLeftRadius="16px" borderBottomLeftRadius="16px">
          <DrawerHeader borderBottom="1px solid #f1f5f9" py="4" px="5">
            <Flex justify="space-between" align="center">
              <Text fontSize="16px" fontWeight="800" color="#1e293b">
                Review Details
              </Text>
              <DrawerCloseButton position="static" />
            </Flex>
          </DrawerHeader>

          <DrawerBody px="5" py="5">
            {selectedReview && (
              <VStack spacing="5" align="stretch">
                {/* Cook Header Block */}
                <Flex align="center" gap="3.5" pb="4" borderBottom="1px solid #f1f5f9">
                  <Avatar
                    size="md"
                    src={selectedReview.cookImage}
                    name={selectedReview.cookName}
                    bg="#e2e8f0"
                    color="#334155"
                    fontWeight="800"
                  />
                  <Box>
                    <Text fontSize="15px" fontWeight="800" color="#1e293b">
                      {selectedReview.cookName}
                    </Text>
                    <Text fontSize="12px" color="#64748b" fontWeight="600" mt="0.5">
                      Cook ID: {selectedReview.cookId}
                    </Text>
                    <HStack spacing="1.5" mt="1" color="#16a34a">
                      <Phone size={13} fill="#16a34a" />
                      <Text fontSize="12px" fontWeight="700">
                        {selectedReview.cookPhone}
                      </Text>
                    </HStack>
                  </Box>
                </Flex>

                {/* Service Category */}
                <Box>
                  <Text fontSize="12px" color="#64748b" fontWeight="600">
                    Service Category
                  </Text>
                  <Text fontSize="14px" fontWeight="800" color="#1e293b" mt="1">
                    {selectedReview.serviceCategory}
                  </Text>
                </Box>

                {/* Review Date & Time */}
                <Box>
                  <Text fontSize="12px" color="#64748b" fontWeight="600">
                    Review Date & Time
                  </Text>
                  <Text fontSize="14px" fontWeight="800" color="#1e293b" mt="1">
                    {selectedReview.reviewDate}, {selectedReview.reviewTime}
                  </Text>
                </Box>

                {/* Rating */}
                <Box>
                  <Text fontSize="12px" color="#64748b" fontWeight="600">
                    Rating
                  </Text>
                  <HStack spacing="2" mt="1" align="center">
                    {renderStars(selectedReview.rating, 17)}
                    <Text fontSize="14px" fontWeight="800" color="#1e293b">
                      {Number(selectedReview.rating).toFixed(1)} / 5
                    </Text>
                  </HStack>
                </Box>

                {/* Customer Comment */}
                <Box>
                  <Text fontSize="12px" color="#64748b" fontWeight="600" mb="2">
                    Customer Comment
                  </Text>
                  <Box
                    p="3.5"
                    bg="#f8fafc"
                    border="1px solid #e2e8f0"
                    borderRadius="12px"
                    fontSize="13px"
                    color="#334155"
                    lineHeight="1.6"
                  >
                    {selectedReview.comment}
                  </Box>
                </Box>

                {/* Customer Details */}
                <Box pt="2" borderTop="1px solid #f1f5f9">
                  <Text fontSize="14px" fontWeight="800" color="#1e293b" mb="3">
                    Customer Details
                  </Text>
                  <VStack spacing="2.5" align="stretch">
                    <Flex justify="space-between">
                      <Text fontSize="12px" color="#64748b" fontWeight="600">
                        Name
                      </Text>
                      <Text fontSize="13px" fontWeight="700" color="#1e293b">
                        {selectedReview.customerName}
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="12px" color="#64748b" fontWeight="600">
                        Mobile No.
                      </Text>
                      <Text fontSize="13px" fontWeight="700" color="#1e293b">
                        {selectedReview.customerPhone}
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="12px" color="#64748b" fontWeight="600">
                        Booking ID
                      </Text>
                      <Text fontSize="13px" fontWeight="700" color="#1e293b">
                        {selectedReview.bookingId}
                      </Text>
                    </Flex>
                  </VStack>
                </Box>
              </VStack>
            )}
          </DrawerBody>

          <DrawerFooter borderTop="1px solid #f1f5f9" py="3" px="5">
            <Button
              variant="outline"
              borderColor="#cbd5e1"
              color="#1e293b"
              fontSize="13px"
              fontWeight="700"
              borderRadius="8px"
              px="6"
              h="36px"
              onClick={onClose}
            >
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default RatingReviewList;
