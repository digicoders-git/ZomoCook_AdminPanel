import { useState, useEffect, useRef } from 'react';
import {
  Box, Flex, HStack, VStack, Text, Button, IconButton, Badge, Avatar,
  Input, Select, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, useToast, SimpleGrid, Card, CardBody, Tooltip,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader,
  AlertDialogBody, AlertDialogFooter, Spinner, Tag, TagLabel
} from '@chakra-ui/react';
import {
  Star, MessageSquare, Search, RotateCcw, CheckCircle2, XCircle,
  Trash2, Eye, User, Phone, Calendar, ChevronLeft, ChevronRight,
  TrendingUp, ThumbsUp, AlertCircle, Award, Check, Clock, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { BRAND, ACCENT, PageHeader, PageFooter, TableCard, TableControls, Loading } from '../components/ui';

const UPLOAD_BASE = API_BASE_URL.replace('/api', '');

const darkThStyle = {
  color: 'white',
  bg: '#0f2343',
  fontSize: 'xs',
  fontWeight: '800',
  py: '3.5',
  px: '4',
  border: '1px solid #1a365d',
  textAlign: 'center',
  textTransform: 'none',
  letterSpacing: '0.5px'
};

const customTdStyle = {
  py: '3.5',
  px: '4',
  border: '1px solid #edf2f7',
  fontSize: 'xs',
};

const RatingReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 5.0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [selectedReview, setSelectedReview] = useState(null);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const [deleteReviewId, setDeleteReviewId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelDeleteRef = useRef();

  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchReviews();
  }, [page, ratingFilter, typeFilter, statusFilter]);

  const fetchReviews = async (overrideSearch) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const s = overrideSearch !== undefined ? overrideSearch : search;
      const params = {
        page,
        limit: 15,
        search: s || undefined,
        rating: ratingFilter !== 'all' ? ratingFilter : undefined,
        reviewType: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

      const res = await axios.get(`${API_BASE_URL}/reviews`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setReviews(res.data.reviews || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || 0);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch reviews and ratings.',
        status: 'error',
        duration: 3000
      });
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReviews(search);
  };

  const handleResetFilters = () => {
    setSearch('');
    setRatingFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
    setPage(1);
    fetchReviews('');
  };

  const handleStatusUpdate = async (reviewId, newStatus) => {
    setStatusUpdatingId(reviewId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.patch(
        `${API_BASE_URL}/reviews/${reviewId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast({
          title: `Status Updated`,
          description: `Review status changed to ${newStatus}.`,
          status: 'success',
          duration: 3000
        });
        fetchReviews();
        if (selectedReview && selectedReview._id === reviewId) {
          setSelectedReview({ ...selectedReview, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Error updating review status:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update review status.',
        status: 'error',
        duration: 3000
      });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteReviewId) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.delete(`${API_BASE_URL}/reviews/${deleteReviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast({
          title: 'Review Deleted',
          description: 'The review has been deleted and cook rating updated.',
          status: 'success',
          duration: 3000
        });
        onDeleteClose();
        setDeleteReviewId(null);
        fetchReviews();
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      toast({
        title: 'Delete Failed',
        description: err.response?.data?.message || 'Could not delete review.',
        status: 'error',
        duration: 3000
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderStars = (rating = 5, size = 14) => {
    const num = Math.min(5, Math.max(1, Math.round(rating)));
    return (
      <HStack spacing="1" display="inline-flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= num ? '#f59e0b' : 'none'}
            color={star <= num ? '#f59e0b' : '#cbd5e1'}
          />
        ))}
        <Text fontSize="xs" fontWeight="800" color="#1e293b" ml="1">
          {Number(rating).toFixed(1)}
        </Text>
      </HStack>
    );
  };

  const getCookImageUrl = (cook) => {
    if (!cook?.profileImage) return null;
    return cook.profileImage.startsWith('http')
      ? cook.profileImage
      : `${UPLOAD_BASE}/${cook.profileImage}`;
  };

  return (
    <Box p={{ base: '4', md: '6' }} bg="#f8fafc" minH="100vh">
      {/* Top Header */}
      <Flex justify="space-between" align="center" mb="6" flexWrap="wrap" gap="3">
        <Box>
          <HStack spacing="3">
            <Box w="4px" h="28px" bg={BRAND} borderRadius="full" />
            <Box>
              <Text fontSize="xl" fontWeight="800" color="#1e293b" letterSpacing="-0.5px">
                Ratings & Reviews
              </Text>
              <Text fontSize="xs" color="#64748b" fontWeight="500">
                Customer ratings, reviews and feedback for cooks & catering staff
              </Text>
            </Box>
          </HStack>
        </Box>
        <HStack spacing="2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RotateCcw size={14} />}
            onClick={() => fetchReviews()}
            isLoading={loading}
            fontWeight="700"
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing="4" mb="6">
        <Card bg="white" borderRadius="2xl" border="1px solid #e2e8f0" boxShadow="sm">
          <CardBody p="4">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="xs" color="#64748b" fontWeight="700" textTransform="uppercase">
                  Total Reviews
                </Text>
                <Text fontSize="2xl" fontWeight="900" color="#1e293b" mt="1">
                  {stats.totalReviews || 0}
                </Text>
                <Text fontSize="11px" color="#10b981" fontWeight="600" mt="0.5">
                  Across all services
                </Text>
              </Box>
              <Box p="3" bg="#eff6ff" borderRadius="xl">
                <MessageSquare size={24} color="#2563eb" />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card bg="white" borderRadius="2xl" border="1px solid #e2e8f0" boxShadow="sm">
          <CardBody p="4">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="xs" color="#64748b" fontWeight="700" textTransform="uppercase">
                  Average Rating
                </Text>
                <HStack spacing="2" align="baseline" mt="1">
                  <Text fontSize="2xl" fontWeight="900" color="#f59e0b">
                    {stats.avgRating || 5.0}
                  </Text>
                  <Text fontSize="sm" color="#64748b" fontWeight="700">
                    / 5.0
                  </Text>
                </HStack>
                <Text fontSize="11px" color="#64748b" fontWeight="600" mt="0.5">
                  Overall customer satisfaction
                </Text>
              </Box>
              <Box p="3" bg="#fef3c7" borderRadius="xl">
                <Star size={24} color="#f59e0b" fill="#f59e0b" />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card bg="white" borderRadius="2xl" border="1px solid #e2e8f0" boxShadow="sm">
          <CardBody p="4">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="xs" color="#64748b" fontWeight="700" textTransform="uppercase">
                  5-Star Ratings
                </Text>
                <Text fontSize="2xl" fontWeight="900" color="#16a34a" mt="1">
                  {stats.breakdown?.[5] || 0}
                </Text>
                <Text fontSize="11px" color="#16a34a" fontWeight="600" mt="0.5">
                  {stats.totalReviews > 0
                    ? `${Math.round(((stats.breakdown?.[5] || 0) / stats.totalReviews) * 100)}% of total reviews`
                    : 'No ratings yet'}
                </Text>
              </Box>
              <Box p="3" bg="#dcfce7" borderRadius="xl">
                <Award size={24} color="#16a34a" />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card bg="white" borderRadius="2xl" border="1px solid #e2e8f0" boxShadow="sm">
          <CardBody p="4">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="xs" color="#64748b" fontWeight="700" textTransform="uppercase">
                  Low Ratings (1-3 ⭐)
                </Text>
                <Text fontSize="2xl" fontWeight="900" color="#dc2626" mt="1">
                  {(stats.breakdown?.[1] || 0) + (stats.breakdown?.[2] || 0) + (stats.breakdown?.[3] || 0)}
                </Text>
                <Text fontSize="11px" color="#dc2626" fontWeight="600" mt="0.5">
                  Requires attention / QA
                </Text>
              </Box>
              <Box p="3" bg="#fee2e2" borderRadius="xl">
                <AlertCircle size={24} color="#dc2626" />
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filter Bar */}
      <Card bg="white" borderRadius="2xl" border="1px solid #e2e8f0" boxShadow="sm" mb="5">
        <CardBody p="4">
          <form onSubmit={handleSearchSubmit}>
            <Flex gap="3" flexWrap="wrap" align="center">
              <Box flex="1" minW="220px">
                <HStack bg="#f8fafc" px="3" py="1.5" borderRadius="xl" border="1px solid #e2e8f0">
                  <Search size={16} color="#94a3b8" />
                  <Input
                    variant="unstyled"
                    fontSize="xs"
                    placeholder="Search by Cook, Customer, Phone, Booking ID, or Comment..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <IconButton
                      size="xs"
                      variant="ghost"
                      icon={<XCircle size={14} />}
                      onClick={() => {
                        setSearch('');
                        fetchReviews('');
                      }}
                      aria-label="Clear search"
                    />
                  )}
                </HStack>
              </Box>

              <Select
                size="sm"
                w={{ base: '100%', sm: '140px' }}
                borderRadius="xl"
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setPage(1);
                }}
                fontWeight="600"
                fontSize="xs"
              >
                <option value="all">All Ratings</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 Star)</option>
                <option value="4">⭐⭐⭐⭐ (4 Star)</option>
                <option value="3">⭐⭐⭐ (3 Star)</option>
                <option value="2">⭐⭐ (2 Star)</option>
                <option value="1">⭐ (1 Star)</option>
              </Select>

              <Select
                size="sm"
                w={{ base: '100%', sm: '140px' }}
                borderRadius="xl"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                fontWeight="600"
                fontSize="xs"
              >
                <option value="all">All Services</option>
                <option value="trial">Demo / Trial</option>
                <option value="booking">Daily Basis</option>
                <option value="party">Chef for Party</option>
                <option value="event">Event Catering</option>
              </Select>

              <Select
                size="sm"
                w={{ base: '100%', sm: '130px' }}
                borderRadius="xl"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                fontWeight="600"
                fontSize="xs"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </Select>

              <Button
                size="sm"
                type="submit"
                colorScheme="blue"
                bg={BRAND}
                _hover={{ bg: '#1d1a63' }}
                px="4"
                fontWeight="700"
              >
                Search
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetFilters}
                fontWeight="700"
                color="#64748b"
              >
                Reset
              </Button>
            </Flex>
          </form>
        </CardBody>
      </Card>

      {/* Main Reviews Table */}
      <Card bg="white" borderRadius="2xl" border="1px solid #e2e8f0" boxShadow="sm" overflow="hidden">
        <Box overflowX="auto">
          {loading ? (
            <Box py="16" textAlign="center">
              <Spinner size="lg" color={BRAND} thickness="3px" />
              <Text fontSize="sm" color="#64748b" mt="3" fontWeight="600">
                Loading ratings and reviews...
              </Text>
            </Box>
          ) : reviews.length === 0 ? (
            <VStack py="16" spacing="3">
              <Box p="4" bg="#f1f5f9" borderRadius="full">
                <MessageSquare size={36} color="#94a3b8" />
              </Box>
              <Text fontSize="base" fontWeight="700" color="#334155">
                No Reviews Found
              </Text>
              <Text fontSize="xs" color="#94a3b8">
                {search || ratingFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Customer ratings and reviews will appear here once submitted.'}
              </Text>
              {(search || ratingFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all') && (
                <Button size="xs" colorScheme="blue" variant="outline" onClick={handleResetFilters}>
                  Clear All Filters
                </Button>
              )}
            </VStack>
          ) : (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th {...darkThStyle}>#</Th>
                  <Th {...darkThStyle} textAlign="left">Cook / Staff</Th>
                  <Th {...darkThStyle} textAlign="left">Customer</Th>
                  <Th {...darkThStyle}>Booking / Service</Th>
                  <Th {...darkThStyle}>Rating</Th>
                  <Th {...darkThStyle} textAlign="left">Feedback & Tags</Th>
                  <Th {...darkThStyle}>Date</Th>
                  <Th {...darkThStyle}>Status</Th>
                  <Th {...darkThStyle}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {reviews.map((r, idx) => {
                  const cookImg = getCookImageUrl(r.cook);
                  const cookName = r.cookName || r.cook?.name || 'Cook';
                  const cookPhone = r.cook?.phone || '';
                  const customerName = r.customerName || r.customer?.name || 'Customer';
                  const customerPhone = r.customerPhone || r.customer?.phone || '';
                  const jobCode = r.bookingId || r.job?.jobCode || (r.job?._id ? `JOB-${r.job._id.slice(-6)}` : 'N/A');
                  const role = r.role || 'Staff';
                  const serviceType = r.reviewType || 'trial';

                  return (
                    <Tr key={r._id} _hover={{ bg: '#f8fafc' }} transition="all 0.15s">
                      <Td {...customTdStyle} textAlign="center" color="#94a3b8" fontWeight="700">
                        {(page - 1) * 15 + idx + 1}
                      </Td>

                      {/* Cook / Staff Column */}
                      <Td {...customTdStyle}>
                        <Flex align="center" gap="2.5">
                          <Avatar
                            size="sm"
                            src={cookImg}
                            name={cookName}
                            bg={BRAND}
                            color="white"
                            cursor={r.cook?._id ? 'pointer' : 'default'}
                            onClick={() => r.cook?._id && navigate(`/candidates/view/${r.cook._id}`)}
                          />
                          <Box>
                            <Text
                              fontSize="xs"
                              fontWeight="700"
                              color="#1e293b"
                              cursor={r.cook?._id ? 'pointer' : 'default'}
                              _hover={{ color: r.cook?._id ? BRAND : 'inherit', textDecoration: r.cook?._id ? 'underline' : 'none' }}
                              onClick={() => r.cook?._id && navigate(`/candidates/view/${r.cook._id}`)}
                            >
                              {cookName}
                            </Text>
                            <HStack spacing="1.5" mt="0.5">
                              <Badge colorScheme="purple" fontSize="9px" px="1.5" borderRadius="sm">
                                {role}
                              </Badge>
                              {cookPhone && (
                                <Text fontSize="10px" color="#64748b">
                                  📞 {cookPhone}
                                </Text>
                              )}
                            </HStack>
                          </Box>
                        </Flex>
                      </Td>

                      {/* Customer Column */}
                      <Td {...customTdStyle}>
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color="#1e293b">
                            {customerName}
                          </Text>
                          {customerPhone && (
                            <Text fontSize="10px" color="#64748b" mt="0.5">
                              📞 {customerPhone}
                            </Text>
                          )}
                        </Box>
                      </Td>

                      {/* Booking / Service Column */}
                      <Td {...customTdStyle} textAlign="center">
                        <VStack spacing="1" align="center">
                          <Badge
                            colorScheme="blue"
                            variant="subtle"
                            fontSize="10px"
                            fontWeight="800"
                            cursor={r.job?._id ? 'pointer' : 'default'}
                            onClick={() => r.job?._id && navigate(`/jobs/view/${r.job._id}`)}
                          >
                            {jobCode}
                          </Badge>
                          <Badge
                            colorScheme={
                              serviceType === 'trial' ? 'teal' : (serviceType === 'booking' ? 'blue' : 'purple')
                            }
                            fontSize="9px"
                            textTransform="capitalize"
                          >
                            {serviceType}
                          </Badge>
                        </VStack>
                      </Td>

                      {/* Rating Column */}
                      <Td {...customTdStyle} textAlign="center">
                        <Box>
                          {renderStars(r.rating || 5, 12)}
                        </Box>
                      </Td>

                      {/* Feedback & Tags Column */}
                      <Td {...customTdStyle} maxW="320px">
                        <Box>
                          {Array.isArray(r.tags) && r.tags.length > 0 && (
                            <Flex wrap="wrap" gap="1" mb="1">
                              {r.tags.map((t, ti) => (
                                <Badge
                                  key={ti}
                                  colorScheme="green"
                                  variant="subtle"
                                  fontSize="9px"
                                  px="1.5"
                                  borderRadius="full"
                                >
                                  ✓ {t}
                                </Badge>
                              ))}
                            </Flex>
                          )}
                          <Text
                            fontSize="xs"
                            color="#334155"
                            noOfLines={2}
                            title={r.comment || 'No written comment'}
                            fontStyle={!r.comment ? 'italic' : 'normal'}
                          >
                            {r.comment || 'No comment provided'}
                          </Text>
                        </Box>
                      </Td>

                      {/* Date Column */}
                      <Td {...customTdStyle} textAlign="center" whiteSpace="nowrap">
                        <Text fontSize="xs" color="#64748b" fontWeight="600">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : '—'}
                        </Text>
                        <Text fontSize="10px" color="#94a3b8">
                          {r.createdAt ? new Date(r.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ''}
                        </Text>
                      </Td>

                      {/* Status Column */}
                      <Td {...customTdStyle} textAlign="center">
                        <Badge
                          colorScheme={
                            r.status === 'approved' ? 'green' : (r.status === 'rejected' ? 'red' : 'yellow')
                          }
                          fontSize="10px"
                          px="2"
                          py="0.5"
                          borderRadius="md"
                          textTransform="capitalize"
                          fontWeight="700"
                        >
                          {r.status || 'approved'}
                        </Badge>
                      </Td>

                      {/* Actions Column */}
                      <Td {...customTdStyle} textAlign="center">
                        <HStack spacing="1" justify="center">
                          <Tooltip label="View Full Details">
                            <IconButton
                              size="xs"
                              variant="ghost"
                              colorScheme="blue"
                              icon={<Eye size={14} />}
                              onClick={() => {
                                setSelectedReview(r);
                                onDetailOpen();
                              }}
                              aria-label="View Details"
                            />
                          </Tooltip>

                          {r.status !== 'approved' && (
                            <Tooltip label="Approve Review">
                              <IconButton
                                size="xs"
                                colorScheme="green"
                                variant="ghost"
                                icon={<CheckCircle2 size={14} />}
                                isLoading={statusUpdatingId === r._id}
                                onClick={() => handleStatusUpdate(r._id, 'approved')}
                                aria-label="Approve"
                              />
                            </Tooltip>
                          )}

                          {r.status !== 'rejected' && (
                            <Tooltip label="Reject Review">
                              <IconButton
                                size="xs"
                                colorScheme="orange"
                                variant="ghost"
                                icon={<XCircle size={14} />}
                                isLoading={statusUpdatingId === r._id}
                                onClick={() => handleStatusUpdate(r._id, 'rejected')}
                                aria-label="Reject"
                              />
                            </Tooltip>
                          )}

                          <Tooltip label="Delete Review">
                            <IconButton
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              icon={<Trash2 size={14} />}
                              onClick={() => {
                                setDeleteReviewId(r._id);
                                onDeleteOpen();
                              }}
                              aria-label="Delete"
                            />
                          </Tooltip>
                        </HStack>
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
            py="3"
            borderTop="1px solid #edf2f7"
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap="2"
            bg="#f8fafc"
          >
            <Text fontSize="xs" color="#64748b" fontWeight="600">
              Showing {(page - 1) * 15 + 1} - {Math.min(page * 15, totalCount)} of {totalCount} reviews
            </Text>
            <HStack spacing="2">
              <Button
                size="xs"
                variant="outline"
                leftIcon={<ChevronLeft size={13} />}
                isDisabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                fontWeight="700"
              >
                Previous
              </Button>
              <Text fontSize="xs" fontWeight="700" color="#1e293b" px="2">
                Page {page} of {totalPages}
              </Text>
              <Button
                size="xs"
                variant="outline"
                rightIcon={<ChevronRight size={13} />}
                isDisabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                fontWeight="700"
              >
                Next
              </Button>
            </HStack>
          </Flex>
        )}
      </Card>

      {/* Review Details Modal */}
      {selectedReview && (
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="lg" isCentered>
          <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
          <ModalContent borderRadius="2xl">
            <ModalHeader borderBottom="1px solid #f1f5f9" pb="3">
              <HStack spacing="2">
                <Box p="2" bg="#eff6ff" borderRadius="lg">
                  <Star size={18} color="#2563eb" fill="#2563eb" />
                </Box>
                <Box>
                  <Text fontSize="md" fontWeight="800" color="#1e293b">
                    Review & Rating Details
                  </Text>
                  <Text fontSize="xs" color="#64748b">
                    Submitted on{' '}
                    {selectedReview.createdAt
                      ? new Date(selectedReview.createdAt).toLocaleString('en-IN')
                      : 'N/A'}
                  </Text>
                </Box>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody py="4">
              <VStack spacing="4" align="stretch">
                {/* Rating Score Banner */}
                <Box p="4" bg="#fffbeb" borderRadius="xl" border="1px solid #fde68a" textAlign="center">
                  <Text fontSize="xs" color="#92400e" fontWeight="700" textTransform="uppercase" mb="1">
                    Customer Rating
                  </Text>
                  <HStack justify="center" spacing="2" mb="2">
                    {renderStars(selectedReview.rating || 5, 22)}
                  </HStack>
                  <Badge
                    colorScheme={
                      selectedReview.status === 'approved'
                        ? 'green'
                        : selectedReview.status === 'rejected'
                        ? 'red'
                        : 'yellow'
                    }
                    fontSize="11px"
                    px="3"
                    py="0.5"
                    borderRadius="full"
                    textTransform="uppercase"
                  >
                    Status: {selectedReview.status || 'approved'}
                  </Badge>
                </Box>

                {/* Cook & Customer Grid */}
                <SimpleGrid columns={2} spacing="3">
                  <Box p="3" bg="#f8fafc" borderRadius="xl" border="1px solid #e2e8f0">
                    <Text fontSize="10px" color="#64748b" fontWeight="800" textTransform="uppercase" mb="2">
                      Cook / Staff Info
                    </Text>
                    <HStack spacing="2" mb="1">
                      <Avatar
                        size="xs"
                        name={selectedReview.cookName || selectedReview.cook?.name || 'Cook'}
                        src={getCookImageUrl(selectedReview.cook)}
                        bg={BRAND}
                      />
                      <Text fontSize="xs" fontWeight="700" color="#1e293b">
                        {selectedReview.cookName || selectedReview.cook?.name || 'Cook'}
                      </Text>
                    </HStack>
                    <Text fontSize="11px" color="#64748b">
                      Role: {selectedReview.role || 'Staff'}
                    </Text>
                    {selectedReview.cook?.phone && (
                      <Text fontSize="11px" color="#64748b">
                        Phone: {selectedReview.cook.phone}
                      </Text>
                    )}
                  </Box>

                  <Box p="3" bg="#f8fafc" borderRadius="xl" border="1px solid #e2e8f0">
                    <Text fontSize="10px" color="#64748b" fontWeight="800" textTransform="uppercase" mb="2">
                      Customer Info
                    </Text>
                    <Text fontSize="xs" fontWeight="700" color="#1e293b">
                      {selectedReview.customerName || selectedReview.customer?.name || 'Customer'}
                    </Text>
                    {selectedReview.customerPhone && (
                      <Text fontSize="11px" color="#64748b" mt="1">
                        Phone: {selectedReview.customerPhone}
                      </Text>
                    )}
                    <Text fontSize="11px" color="#64748b" mt="0.5">
                      Service: <Badge fontSize="9px">{selectedReview.reviewType || 'trial'}</Badge>
                    </Text>
                  </Box>
                </SimpleGrid>

                {/* Tags */}
                {Array.isArray(selectedReview.tags) && selectedReview.tags.length > 0 && (
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="#1e293b" mb="1.5">
                      Positive Highlights & Tags
                    </Text>
                    <Flex wrap="wrap" gap="1.5">
                      {selectedReview.tags.map((t, idx) => (
                        <Tag key={idx} size="sm" colorScheme="green" borderRadius="full">
                          <TagLabel>✓ {t}</TagLabel>
                        </Tag>
                      ))}
                    </Flex>
                  </Box>
                )}

                {/* Comment */}
                <Box>
                  <Text fontSize="xs" fontWeight="700" color="#1e293b" mb="1.5">
                    Written Feedback / Review
                  </Text>
                  <Box
                    p="3"
                    bg="#f1f5f9"
                    borderRadius="xl"
                    border="1px solid #e2e8f0"
                    fontSize="xs"
                    color="#334155"
                    lineHeight="1.6"
                  >
                    {selectedReview.comment || 'No written comment was provided.'}
                  </Box>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter borderTop="1px solid #f1f5f9" pt="3" justify="space-between">
              <HStack spacing="2">
                {selectedReview.status !== 'approved' && (
                  <Button
                    size="sm"
                    colorScheme="green"
                    leftIcon={<Check size={14} />}
                    isLoading={statusUpdatingId === selectedReview._id}
                    onClick={() => handleStatusUpdate(selectedReview._id, 'approved')}
                  >
                    Approve
                  </Button>
                )}
                {selectedReview.status !== 'rejected' && (
                  <Button
                    size="sm"
                    colorScheme="orange"
                    variant="outline"
                    leftIcon={<XCircle size={14} />}
                    isLoading={statusUpdatingId === selectedReview._id}
                    onClick={() => handleStatusUpdate(selectedReview._id, 'rejected')}
                  >
                    Reject
                  </Button>
                )}
              </HStack>
              <Button size="sm" variant="ghost" onClick={onDetailClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.400">
          <AlertDialogContent borderRadius="2xl">
            <AlertDialogHeader fontSize="md" fontWeight="800">
              Delete Customer Review
            </AlertDialogHeader>
            <AlertDialogBody fontSize="xs" color="#64748b">
              Are you sure you want to permanently delete this review? The cook&apos;s overall star rating will be automatically recalculated.
            </AlertDialogBody>
            <AlertDialogFooter borderTop="1px solid #f1f5f9" pt="3">
              <Button ref={cancelDeleteRef} size="sm" variant="ghost" onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                size="sm"
                ml="3"
                isLoading={isDeleting}
                onClick={handleDeleteReview}
                fontWeight="700"
              >
                Delete Permanently
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default RatingReviewList;

