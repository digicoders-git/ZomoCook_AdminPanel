import { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Button, Avatar, Select, useToast, Spinner, Checkbox,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, ModalFooter, Divider, Grid, GridItem
} from '@chakra-ui/react';
import { ArrowLeft, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PageHeader, TableCard, TableControls, TableFooter, PageFooter,
  BRAND, tableHeadStyle, thStyle, tdStyle, trHover,
} from '../components/ui';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const toast = useToast();
  const apiBase = API_BASE_URL.replace('/api', '');

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_BASE_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setBookings(res.data.bookings || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load bookings.', status: 'error', duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_BASE_URL}/bookings/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Updated', status: 'success', duration: 2000 });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', status: 'error', duration: 3000 });
    }
  };

  const getStatusColor = (s) => {
    switch ((s || '').toLowerCase()) {
      case 'confirmed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'completed': return '#6366f1';
      case 'cancelled': return '#ef4444';
      default: return BRAND;
    }
  };

  const filtered = bookings.filter(b => {
    const q = searchTerm.toLowerCase();
    const job = b.job || {};
    const customer = b.customer || {};
    const cook = b.cook || {};
    return (
      (job.title || '').toLowerCase().includes(q) ||
      (customer.name || '').toLowerCase().includes(q) ||
      (customer.outletName || '').toLowerCase().includes(q) ||
      (cook.name || '').toLowerCase().includes(q) ||
      (b.status || '').toLowerCase().includes(q)
    );
  });

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  const fmt = (d) => {
    if (!d) return 'N/A';
    try { return new Date(d).toLocaleDateString('en-IN'); } catch { return d; }
  };

  return (
    <Box pb="10">
      <PageHeader
        title="Booking Management"
        breadcrumb="Booking Management"
        actions={[
          <Button key="filter" leftIcon={<Filter size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>
            Filters
          </Button>,
          <Button key="back" as={Link} to="/" leftIcon={<ArrowLeft size={14} />} size="sm" variant="outline" borderColor={BRAND} color={BRAND} borderRadius="lg" _hover={{ bg: '#f0f5ff' }}>
            Back
          </Button>,
        ]}
      />

      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center">
          <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="3" />
          <Text fontSize="sm" fontWeight="700" color="#1e293b">All Bookings</Text>
          <Badge ml="3" colorScheme="blue" borderRadius="full">{bookings.length}</Badge>
        </Flex>

        <TableControls
          search={searchTerm}
          onSearch={(v) => { setSearchTerm(v); setCurrentPage(1); }}
          entries={entriesPerPage}
          onEntriesChange={setEntriesPerPage}
          searchPlaceholder="Search by job, customer, cook or status..."
        />

        <Box overflowX="auto">
          {isLoading ? (
            <Flex justify="center" py="10"><Spinner color={BRAND} /></Flex>
          ) : (
            <Table variant="simple" size="sm">
              <Thead {...tableHeadStyle}>
                <Tr>
                  <Th {...thStyle} w="40px"><Checkbox colorScheme="blue" /></Th>
                  <Th {...thStyle}>NO.</Th>
                  <Th {...thStyle} minW="200px">JOB DETAILS</Th>
                  <Th {...thStyle} minW="180px">CUSTOMER / CLIENT</Th>
                  <Th {...thStyle} minW="180px">COOK / STAFF</Th>
                  <Th {...thStyle} minW="120px">AMOUNT</Th>
                  <Th {...thStyle} minW="120px">DATES</Th>
                  <Th {...thStyle} minW="160px">STATUS</Th>
                </Tr>
              </Thead>
              <Tbody>
                {current.map((b, i) => {
                  const job = b.job || {};
                  const customer = b.customer || {};
                  const cook = b.cook || {};
                  return (
                    <Tr key={b._id} {...trHover} onClick={() => setSelectedBooking(b)} cursor="pointer">
                      <Td {...tdStyle} onClick={e => e.stopPropagation()}><Checkbox colorScheme="blue" /></Td>
                      <Td {...tdStyle} color="#475569" fontWeight="600" textAlign="center">{indexOfFirst + i + 1}</Td>
                      <Td {...tdStyle}>
                        <VStack align="start" spacing="1">
                          <Text fontWeight="700" color="#0000ff" fontSize="13px">{job.title || 'N/A'}</Text>
                          <Text fontSize="12px" color="#475569">{job.jobCategory || job.jobType || 'N/A'}</Text>
                          <Text fontSize="12px" color="#475569">{[job.city, job.state].filter(Boolean).join(', ') || 'N/A'}</Text>
                        </VStack>
                      </Td>
                      <Td {...tdStyle}>
                        <VStack align="start" spacing="1">
                          <HStack>
                            <Avatar size="xs" name={customer.outletName || customer.name} src={customer.profilePic ? `${apiBase}/${customer.profilePic}` : ''} />
                            <Text fontSize="13px" fontWeight="600" color="#1e293b">{customer.outletName || customer.name || 'N/A'}</Text>
                          </HStack>
                          <Text fontSize="12px" color="#475569">{customer.phone || 'N/A'}</Text>
                          <Text fontSize="12px" color="#475569">{customer.email || ''}</Text>
                        </VStack>
                      </Td>
                      <Td {...tdStyle}>
                        <VStack align="start" spacing="1">
                          <HStack>
                            <Avatar size="xs" name={cook.name} src={cook.profileImage ? `${apiBase}/${cook.profileImage}` : ''} />
                            <Text fontSize="13px" fontWeight="600" color="#1e293b">{cook.name || 'Not Assigned'}</Text>
                          </HStack>
                          <Text fontSize="12px" color="#475569">{cook.phone || ''}</Text>
                          <Text fontSize="12px" color="#475569">{cook.city || ''}</Text>
                        </VStack>
                      </Td>
                      <Td {...tdStyle}>
                        <VStack align="start" spacing="1">
                          <Text fontWeight="700" color={BRAND} fontSize="14px">₹{b.totalAmount || 0}</Text>
                          <Text fontSize="12px" color="#475569">{b.duration || 'Full Time'}</Text>
                        </VStack>
                      </Td>
                      <Td {...tdStyle}>
                        <VStack align="start" spacing="1">
                          <Text fontSize="12px" color="#475569">Start: {fmt(b.startDate)}</Text>
                          <Text fontSize="12px" color="#475569">Created: {fmt(b.createdAt)}</Text>
                        </VStack>
                      </Td>
                      <Td {...tdStyle} onClick={e => e.stopPropagation()}>
                        <Select
                          size="sm"
                          bg={getStatusColor(b.status)}
                          color="white"
                          borderColor="transparent"
                          borderRadius="4px"
                          fontWeight="700"
                          value={b.status || 'pending'}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          sx={{ '& option': { color: '#1e293b', bg: 'white' } }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </Select>
                      </Td>
                    </Tr>
                  );
                })}
                {!isLoading && filtered.length === 0 && (
                  <Tr><Td colSpan={8} py="10" textAlign="center" color="#94a3b8">No bookings found.</Td></Tr>
                )}
              </Tbody>
            </Table>
          )}
        </Box>

        <TableFooter
          showing={`${indexOfFirst + 1} to ${Math.min(indexOfLast, filtered.length)}`}
          total={filtered.length}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
        />
      </TableCard>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={BRAND}>Booking Details</ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py="5">
            {selectedBooking && (() => {
              const b = selectedBooking;
              const job = b.job || {};
              const customer = b.customer || {};
              const cook = b.cook || {};
              return (
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem colSpan={2}>
                    <Badge bg={getStatusColor(b.status)} color="white" px="3" py="1" borderRadius="full" fontSize="12px" fontWeight="700">
                      {(b.status || 'pending').toUpperCase()}
                    </Badge>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="11px" color="#64748b" fontWeight="600" textTransform="uppercase" mb="1">Job Title</Text>
                    <Text fontSize="14px" fontWeight="600">{job.title || 'N/A'}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="11px" color="#64748b" fontWeight="600" textTransform="uppercase" mb="1">Job Category</Text>
                    <Text fontSize="14px" fontWeight="600">{job.jobCategory || job.jobType || 'N/A'}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="11px" color="#64748b" fontWeight="600" textTransform="uppercase" mb="1">Customer / Client</Text>
                    <Text fontSize="14px" fontWeight="600">{customer.outletName || customer.name || 'N/A'}</Text>
                    <Text fontSize="12px" color="#475569">{customer.phone || ''}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="11px" color="#64748b" fontWeight="600" textTransform="uppercase" mb="1">Cook / Staff</Text>
                    <Text fontSize="14px" fontWeight="600">{cook.name || 'Not Assigned'}</Text>
                    <Text fontSize="12px" color="#475569">{cook.phone || ''}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="11px" color="#64748b" fontWeight="600" textTransform="uppercase" mb="1">Total Amount</Text>
                    <Text fontSize="14px" fontWeight="700" color={BRAND}>₹{b.totalAmount || 0}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="11px" color="#64748b" fontWeight="600" textTransform="uppercase" mb="1">Duration</Text>
                    <Text fontSize="14px" fontWeight="600">{b.duration || 'Full Time'}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="11px" color="#64748b" fontWeight="600" textTransform="uppercase" mb="1">Start Date</Text>
                    <Text fontSize="14px" fontWeight="600">{fmt(b.startDate)}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="11px" color="#64748b" fontWeight="600" textTransform="uppercase" mb="1">Created At</Text>
                    <Text fontSize="14px" fontWeight="600">{fmt(b.createdAt)}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="11px" color="#64748b" fontWeight="600" textTransform="uppercase" mb="1">Location</Text>
                    <Text fontSize="14px" fontWeight="600">{[job.city, job.state].filter(Boolean).join(', ') || 'N/A'}</Text>
                  </GridItem>
                  {b.remarks && (
                    <GridItem colSpan={2}>
                      <Text fontSize="11px" color="#64748b" fontWeight="600" textTransform="uppercase" mb="1">Remarks</Text>
                      <Text fontSize="14px" fontWeight="600">{b.remarks}</Text>
                    </GridItem>
                  )}
                </Grid>
              );
            })()}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => setSelectedBooking(null)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <PageFooter />
    </Box>
  );
};

export default BookingList;
