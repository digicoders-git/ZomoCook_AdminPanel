import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, VStack, Icon, Spinner, useToast, Grid, Badge, Table, Thead, Tbody, Tr, Th, Td, Tabs, TabList, TabPanels, Tab, TabPanel, Button, IconButton, Divider, Input, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Textarea
} from '@chakra-ui/react';
import { Briefcase, Users, CreditCard, Award, Calendar, CheckCircle, Clock, MapPin, Building, ArrowLeft, Phone, Mail, MoreVertical, LayoutDashboard, Ban, Trash2, Plus } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import PageContentLoader from '../components/PageContentLoader';

const BRAND = '#004aad';
const ACCENT = '#e60000';

const StatCard = ({ icon, label, value, colorScheme = 'blue', subLabel }) => {
  const colorMap = {
    blue: { bg: '#eff6ff', color: '#3b82f6' },
    green: { bg: '#ecfdf5', color: '#10b981' },
    purple: { bg: '#f3e8ff', color: '#a855f7' },
    cyan: { bg: '#cffafe', color: '#06b6d4' },
    orange: { bg: '#fff7ed', color: '#f97316' },
    yellow: { bg: '#fef3c7', color: '#d97706' },
    red: { bg: '#fef2f2', color: '#ef4444' },
  };
  const colors = colorMap[colorScheme] || colorMap.blue;

  return (
    <Box bg="white" p="4" borderRadius="xl" border="1px solid #e2e8f0" boxShadow="sm" display="flex" alignItems="center" gap="4">
      <Flex bg={colors.bg} p="3" borderRadius="lg">
        <Icon as={icon} size={20} color={colors.color} />
      </Flex>
      <Box>
        <Text fontSize="xs" fontWeight="700" color="#64748b">{label}</Text>
        <Text fontSize="xl" fontWeight="900" color="#0f172a">{value}</Text>
        {subLabel && <Text fontSize="xs" color="#94a3b8" mt="1">{subLabel}</Text>}
      </Box>
    </Box>
  );
};

const CustomerDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  // Notes Modal state
  const { isOpen: isNoteOpen, onOpen: onNoteOpen, onClose: onNoteClose } = useDisclosure();
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    if (location.state?.activeTab !== undefined) {
      setTabIndex(location.state.activeTab);
    }
  }, [location]);

  useEffect(() => {
    fetchDashboardData();
  }, [id]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/customers/${id}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setData(response.data.dashboard);
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast({
        title: "Error loading dashboard",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate('/customers/list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmittingNote(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`${API_BASE_URL}/customers/${id}/notes`, 
        { content: newNote },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast({ title: "Note added successfully", status: "success", duration: 2000 });
        setNewNote('');
        onNoteClose();
        fetchDashboardData(); // Refresh data to show new note
      }
    } catch (error) {
      toast({ title: "Error adding note", status: "error", duration: 3000 });
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading || !data) {
    return <PageContentLoader />;
  }

  const { customer, stats, jobs, applications, transactions, bookings, activeSubscriptions, recentActivity } = data;

  const hiredCandidates = applications.filter(app => app.status === 'Hired');
  const demoScheduled = applications.filter(app => app.status === 'Demo Scheduled');

  return (
    <Box pb="10">
      <Flex justify="space-between" align="center" mb="6">
        <Box>
          <Text fontSize="xs" color="#64748b" fontWeight="600" mb="1">
            Home &gt; Client Management &gt; Client Dashboard
          </Text>
          <HStack>
            <Text fontSize="2xl" fontWeight="800" color="#0f172a">Client Dashboard</Text>
            <Badge colorScheme={customer.accountStatus === 'active' ? 'green' : 'red'} variant="subtle" borderRadius="md" px="2">{customer.accountStatus === 'active' ? 'Active' : 'Blocked'}</Badge>
          </HStack>
        </Box>
        <Button leftIcon={<ArrowLeft size={16} />} variant="outline" size="sm" onClick={() => navigate('/customers/list')} borderRadius="lg" bg="white">
          Back to Client List
        </Button>
      </Flex>

      {/* Top Section: Profile & Stats */}
      <Grid templateColumns={{ base: '1fr', lg: '350px 1fr' }} gap="6" mb="6">
        
        {/* Profile Card */}
        <Box bg="white" p="6" borderRadius="2xl" border="1px solid #e2e8f0" boxShadow="sm">
          <HStack spacing="4" mb="5">
            <Flex w="70px" h="70px" bg="#eff6ff" borderRadius="full" justify="center" align="center" border="2px solid #bfdbfe">
              <Building size={32} color={BRAND} />
            </Flex>
            <Box>
              <HStack>
                <Text fontSize="xl" fontWeight="800" color="#0f172a">{customer.name}</Text>
                <Badge colorScheme="blue" variant="subtle" fontSize="2xs" px="2" borderRadius="full">Verified</Badge>
              </HStack>
              <Text fontSize="sm" color="#64748b" fontWeight="600" textTransform="capitalize">Category: {customer.propertyCategory || 'N/A'}</Text>
            </Box>
          </HStack>
          
          <VStack align="start" spacing="3">
            <HStack color="#475569"><Phone size={16} /><Text fontSize="sm" fontWeight="600">{customer.contactPhone || 'N/A'}</Text></HStack>
            <HStack color="#475569"><Mail size={16} /><Text fontSize="sm" fontWeight="600">{customer.email || 'N/A'}</Text></HStack>
            <HStack color="#475569" align="start"><MapPin size={16} mt="1" /><Text fontSize="sm" fontWeight="600">{customer.contactAddress || 'N/A'}</Text></HStack>
            <HStack color="#475569" mt="2"><Clock size={16} /><Text fontSize="sm" fontWeight="600">Client Since: {formatDate(customer.createdAt)}</Text></HStack>
          </VStack>
        </Box>

        {/* Stats Grid */}
        <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(3, 1fr)' }} gap="4" alignContent="start">
          <StatCard icon={Briefcase} label="Total Jobs Posted" value={stats.totalJobs} colorScheme="blue" />
          <StatCard icon={Users} label="Hired Candidates" value={hiredCandidates.length} colorScheme="green" />
          <StatCard icon={Calendar} label="Demo Scheduled" value={demoScheduled.length} colorScheme="purple" />
          <StatCard icon={LayoutDashboard} label="Total Bookings" value={stats.totalBookings} colorScheme="cyan" />
          <StatCard icon={CreditCard} label="Total Transactions" value={`₹${stats.totalSpent.toLocaleString('en-IN')}`} colorScheme="orange" />
          <StatCard icon={Award} label="Active Package" 
            value={activeSubscriptions?.length > 0 ? activeSubscriptions[0].plan?.name : 'None'} 
            subLabel={activeSubscriptions?.length > 0 ? `Valid till: ${formatDate(activeSubscriptions[0].endDate)}` : ''}
            colorScheme="blue" />
        </Grid>
      </Grid>

      {/* Main Tabs */}
      <Box bg="white" borderRadius="2xl" border="1px solid #e2e8f0" overflow="hidden" mb="6" boxShadow="sm">
        <Tabs colorScheme="blue" index={tabIndex} onChange={(index) => setTabIndex(index)}>
          <TabList px="2" pt="2" borderBottom="1px solid #e2e8f0" overflowX="auto">
            {['Overview', 'Jobs Posted', 'Hired Candidates', 'Demo Scheduled', 'Transactions', 'Bookings', 'Blocked History', 'Activity Log'].map((tab, idx) => (
              <Tab key={idx} fontSize="sm" fontWeight="600" color="#64748b" _selected={{ color: BRAND, borderBottom: `2px solid ${BRAND}` }} whiteSpace="nowrap" pb="4">
                {tab}
              </Tab>
            ))}
          </TabList>

          <TabPanels bg="#f8fafc" minH="400px" p="6">
            
            {/* Overview Tab */}
            <TabPanel p="0">
              <Grid templateColumns={{ base: '1fr', xl: '1fr 1.2fr 1fr' }} gap="6">
                
                {/* Client Overview Details */}
                <Box bg="white" p="5" borderRadius="xl" border="1px solid #e2e8f0">
                  <Text fontSize="md" fontWeight="800" color="#0f172a" mb="4">Client Overview</Text>
                  <VStack align="stretch" spacing="4">
                    <Grid templateColumns="120px 1fr" gap="2">
                      <Text fontSize="sm" color="#64748b" fontWeight="600">Client ID</Text>
                      <Text fontSize="sm" color="#0f172a" fontWeight="700">CLT-{customer._id.toString().slice(-6).toUpperCase()}</Text>
                    </Grid>
                    <Grid templateColumns="120px 1fr" gap="2">
                      <Text fontSize="sm" color="#64748b" fontWeight="600">Contact Person</Text>
                      <Text fontSize="sm" color="#0f172a" fontWeight="700">{customer.contactName || 'N/A'}</Text>
                    </Grid>
                    <Grid templateColumns="120px 1fr" gap="2">
                      <Text fontSize="sm" color="#64748b" fontWeight="600">Email</Text>
                      <Text fontSize="sm" color="#0f172a" fontWeight="700">{customer.email || 'N/A'}</Text>
                    </Grid>
                    <Grid templateColumns="120px 1fr" gap="2">
                      <Text fontSize="sm" color="#64748b" fontWeight="600">Phone</Text>
                      <Text fontSize="sm" color="#0f172a" fontWeight="700">{customer.contactPhone || 'N/A'}</Text>
                    </Grid>
                    <Grid templateColumns="120px 1fr" gap="2">
                      <Text fontSize="sm" color="#64748b" fontWeight="600">Category</Text>
                      <Text fontSize="sm" color="#0f172a" fontWeight="700" textTransform="capitalize">{customer.propertyCategory || 'N/A'}</Text>
                    </Grid>
                    <Grid templateColumns="120px 1fr" gap="2">
                      <Text fontSize="sm" color="#64748b" fontWeight="600">Address</Text>
                      <Text fontSize="sm" color="#0f172a" fontWeight="700">{customer.contactAddress || 'N/A'}</Text>
                    </Grid>
                    <Grid templateColumns="120px 1fr" gap="2">
                      <Text fontSize="sm" color="#64748b" fontWeight="600">Account Status</Text>
                      <Badge colorScheme={customer.accountStatus === 'active' ? 'green' : 'red'} w="fit-content" borderRadius="md">{customer.accountStatus}</Badge>
                    </Grid>
                  </VStack>
                </Box>

                {/* Recent Activity */}
                <Box bg="white" p="5" borderRadius="xl" border="1px solid #e2e8f0">
                  <Text fontSize="md" fontWeight="800" color="#0f172a" mb="4">Recent Activity</Text>
                  {recentActivity.length === 0 ? (
                    <Text fontSize="sm" color="#94a3b8">No recent activity found.</Text>
                  ) : (
                    <VStack align="stretch" spacing="4" position="relative" pl="2">
                      <Box position="absolute" left="15px" top="10px" bottom="10px" w="2px" bg="#e2e8f0" zIndex="0" />
                      {recentActivity.slice(0, 5).map((activity, idx) => (
                        <Flex key={idx} position="relative" zIndex="1" gap="4">
                          <Box w="10px" h="10px" borderRadius="full" bg={BRAND} mt="1.5" outline="4px solid white" />
                          <Box>
                            <Text fontSize="sm" fontWeight="700" color="#1e293b">
                              {activity.type === 'job_posted' && `New job posted - ${activity.details.title}`}
                              {activity.type === 'candidate_hired' && `Candidate ${activity.details.candidate?.name || ''} hired`}
                              {activity.type === 'demo_scheduled' && `Demo scheduled with ${activity.details.candidate?.name || ''}`}
                              {activity.type === 'payment_received' && `Payment received ₹${activity.details.amount}`}
                              {activity.type === 'package_renewed' && `Package active - ${activity.details.plan?.name}`}
                            </Text>
                            <Text fontSize="xs" color="#64748b" mt="0.5">{formatDateTime(activity.date)}</Text>
                          </Box>
                        </Flex>
                      ))}
                    </VStack>
                  )}
                </Box>

                {/* Client Notes */}
                <Box bg="white" p="5" borderRadius="xl" border="1px solid #e2e8f0">
                  <Flex justify="space-between" align="center" mb="4">
                    <Text fontSize="md" fontWeight="800" color="#0f172a">Client Notes</Text>
                    <Button size="xs" variant="outline" onClick={onNoteOpen}>Add Note</Button>
                  </Flex>
                  <VStack align="stretch" spacing="3">
                    {(!customer.notes || customer.notes.length === 0) ? (
                      <Text fontSize="sm" color="#94a3b8">No notes added yet.</Text>
                    ) : (
                      customer.notes.slice().reverse().map((note, idx) => (
                        <Box key={idx} p="3" bg={idx % 2 === 0 ? '#fffbeb' : '#ecfdf5'} borderRadius="md" border="1px solid" borderColor={idx % 2 === 0 ? '#fde68a' : '#a7f3d0'}>
                          <Text fontSize="sm" color="#1e293b" mb="2">{note.content}</Text>
                          <Text fontSize="xs" color="#64748b">Added by {note.addedBy} on {formatDateTime(note.createdAt)}</Text>
                        </Box>
                      ))
                    )}
                  </VStack>
                </Box>

              </Grid>
            </TabPanel>

            {/* Jobs Posted Tab */}
            <TabPanel p="0">
              <Box bg="white" borderRadius="xl" border="1px solid #e2e8f0" overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#f8fafc">
                    <Tr>
                      <Th py="4" color="#64748b">Job ID</Th>
                      <Th py="4" color="#64748b">Job Title</Th>
                      <Th py="4" color="#64748b">Category</Th>
                      <Th py="4" color="#64748b">Posted On</Th>
                      <Th py="4" color="#64748b">Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {jobs.length === 0 ? (
                      <Tr><Td colSpan={5} textAlign="center" py="6" color="#94a3b8">No jobs posted yet.</Td></Tr>
                    ) : jobs.map(job => (
                      <Tr key={job._id}>
                        <Td py="3" fontSize="sm" fontWeight="600" color="#475569">{job.jobCode || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" fontWeight="700" color="#1e293b">{job.title}</Td>
                        <Td py="3" fontSize="sm" color="#64748b" textTransform="capitalize">{job.jobCategory}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{formatDate(job.createdAt)}</Td>
                        <Td py="3">
                          <Badge colorScheme={job.status === 'Active' ? 'green' : 'orange'} borderRadius="full" px="2">{job.status}</Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Hired Candidates Tab */}
            <TabPanel p="0">
              <Box bg="white" borderRadius="xl" border="1px solid #e2e8f0" overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#f8fafc">
                    <Tr>
                      <Th py="4" color="#64748b">Candidate Name</Th>
                      <Th py="4" color="#64748b">Phone</Th>
                      <Th py="4" color="#64748b">Job Title</Th>
                      <Th py="4" color="#64748b">Hired On</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {hiredCandidates.length === 0 ? (
                      <Tr><Td colSpan={4} textAlign="center" py="6" color="#94a3b8">No hired candidates.</Td></Tr>
                    ) : hiredCandidates.map(app => (
                      <Tr key={app._id}>
                        <Td py="3" fontSize="sm" fontWeight="700" color="#1e293b">{app.candidate?.name || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{app.candidate?.phone || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{app.job?.title || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{formatDate(app.updatedAt)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Demo Scheduled Tab */}
            <TabPanel p="0">
              <Box bg="white" borderRadius="xl" border="1px solid #e2e8f0" overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#f8fafc">
                    <Tr>
                      <Th py="4" color="#64748b">Candidate Name</Th>
                      <Th py="4" color="#64748b">Job Title</Th>
                      <Th py="4" color="#64748b">Demo Date</Th>
                      <Th py="4" color="#64748b">Demo Time</Th>
                      <Th py="4" color="#64748b">Meeting Link</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {demoScheduled.length === 0 ? (
                      <Tr><Td colSpan={5} textAlign="center" py="6" color="#94a3b8">No demos scheduled.</Td></Tr>
                    ) : demoScheduled.map(app => (
                      <Tr key={app._id}>
                        <Td py="3" fontSize="sm" fontWeight="700" color="#1e293b">{app.candidate?.name || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{app.job?.title || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{formatDate(app.demoDate)}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{app.demoTime || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="blue.500">
                          {app.meetingLink ? <a href={app.meetingLink} target="_blank" rel="noreferrer">Join Meet</a> : 'N/A'}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Transactions Tab */}
            <TabPanel p="0">
              <Box bg="white" borderRadius="xl" border="1px solid #e2e8f0" overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#f8fafc">
                    <Tr>
                      <Th py="4" color="#64748b">Date</Th>
                      <Th py="4" color="#64748b">Type</Th>
                      <Th py="4" color="#64748b">Amount</Th>
                      <Th py="4" color="#64748b">Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {transactions.length === 0 ? (
                      <Tr><Td colSpan={4} textAlign="center" py="6" color="#94a3b8">No transaction history.</Td></Tr>
                    ) : transactions.map(txn => (
                      <Tr key={txn._id}>
                        <Td py="3" fontSize="sm" fontWeight="600" color="#475569">{formatDate(txn.createdAt)}</Td>
                        <Td py="3" fontSize="sm" color="#1e293b" textTransform="capitalize">{txn.type.replace(/_/g, ' ')}</Td>
                        <Td py="3" fontSize="sm" fontWeight="800" color="#16a34a">₹{txn.amount.toLocaleString('en-IN')}</Td>
                        <Td py="3">
                          <Badge colorScheme={txn.status === 'success' ? 'green' : 'red'} borderRadius="full" px="2">{txn.status}</Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Bookings Tab */}
            <TabPanel p="0">
              <Box bg="white" borderRadius="xl" border="1px solid #e2e8f0" overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#f8fafc">
                    <Tr>
                      <Th py="4" color="#64748b">Booked Cook</Th>
                      <Th py="4" color="#64748b">Job Title</Th>
                      <Th py="4" color="#64748b">Booking Status</Th>
                      <Th py="4" color="#64748b">Booked On</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {bookings.length === 0 ? (
                      <Tr><Td colSpan={4} textAlign="center" py="6" color="#94a3b8">No bookings found.</Td></Tr>
                    ) : bookings.map(b => (
                      <Tr key={b._id}>
                        <Td py="3" fontSize="sm" fontWeight="700" color="#1e293b">{b.cook?.name || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">{b.job?.title || 'N/A'}</Td>
                        <Td py="3" fontSize="sm" color="#64748b">
                          <Badge colorScheme={b.status === 'confirmed' ? 'green' : 'orange'} borderRadius="full" px="2">{b.status}</Badge>
                        </Td>
                        <Td py="3" fontSize="sm" color="#64748b">{formatDate(b.createdAt)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Blocked History Tab */}
            <TabPanel p="0">
              <Flex justify="center" align="center" h="200px" bg="white" borderRadius="xl" border="1px solid #e2e8f0">
                <Text color="#94a3b8" fontWeight="600">No blocked history found.</Text>
              </Flex>
            </TabPanel>

            {/* Activity Log Tab */}
            <TabPanel p="0">
              <Box bg="white" p="5" borderRadius="xl" border="1px solid #e2e8f0">
                {recentActivity.length === 0 ? (
                  <Text fontSize="sm" color="#94a3b8">No activity log found.</Text>
                ) : (
                  <VStack align="stretch" spacing="4" position="relative" pl="2">
                    <Box position="absolute" left="15px" top="10px" bottom="10px" w="2px" bg="#e2e8f0" zIndex="0" />
                    {recentActivity.map((activity, idx) => (
                      <Flex key={idx} position="relative" zIndex="1" gap="4">
                        <Box w="10px" h="10px" borderRadius="full" bg={BRAND} mt="1.5" outline="4px solid white" />
                        <Box>
                          <Text fontSize="sm" fontWeight="700" color="#1e293b">
                            {activity.type === 'job_posted' && `New job posted - ${activity.details.title}`}
                            {activity.type === 'candidate_hired' && `Candidate ${activity.details.candidate?.name || ''} hired`}
                            {activity.type === 'demo_scheduled' && `Demo scheduled with ${activity.details.candidate?.name || ''}`}
                            {activity.type === 'payment_received' && `Payment received ₹${activity.details.amount}`}
                            {activity.type === 'package_renewed' && `Package active - ${activity.details.plan?.name}`}
                          </Text>
                          <Text fontSize="xs" color="#64748b" mt="0.5">{formatDateTime(activity.date)}</Text>
                        </Box>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </Box>
            </TabPanel>

          </TabPanels>
        </Tabs>
      </Box>

      {/* Add Note Modal */}
      <Modal isOpen={isNoteOpen} onClose={onNoteClose} isCentered>
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent>
          <ModalHeader>Add Client Note</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea 
              placeholder="Type your note here..." 
              value={newNote} 
              onChange={(e) => setNewNote(e.target.value)}
              rows={5}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onNoteClose}>Cancel</Button>
            <Button colorScheme="blue" bg={BRAND} onClick={handleAddNote} isLoading={isSubmittingNote}>Save Note</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default CustomerDashboard;
