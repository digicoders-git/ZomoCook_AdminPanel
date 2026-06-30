import { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Button, Icon, Checkbox, Avatar, Select, useToast, Spinner,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, Divider, Grid, GridItem
} from '@chakra-ui/react';
import {
  Filter, FileText, ArrowLeft, UserCheck, Clock, Send, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PageHeader, TableCard, TableControls, TableFooter, PageFooter,
  BRAND, tableHeadStyle, thStyle, tdStyle, trHover,
} from '../components/ui';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppData, setSelectedAppData] = useState(null);
  const toast = useToast();

  const apiBase = API_BASE_URL.replace('/api', '');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/candidates/applications`, {
        params: { search: searchTerm },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({ title: 'Error', description: 'Failed to load applications.', status: 'error', duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    setCurrentPage(1);
  }, [searchTerm]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(`${API_BASE_URL}/applications/${appId}/status`, 
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast({ title: 'Success', description: 'Application status updated.', status: 'success', duration: 3000 });
        setApplications(apps => apps.map(app => app._id === appId ? { ...app, status: newStatus } : app));
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status.', status: 'error', duration: 3000 });
    }
  };

  // Pagination Logic
  const indexOfLastRecord = currentPage * entriesPerPage;
  const indexOfFirstRecord = indexOfLastRecord - entriesPerPage;
  const currentRecords = applications.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(applications.length / entriesPerPage);

  const getStatusColor = (s) => {
    switch (s) {
      case 'Applied': return '#1a83ff';
      case 'Shortlisted': return '#10b981';
      case 'Demo Scheduled': return '#ffb800';
      case 'Reschedule Requested': return '#06b6d4';
      case 'Rejected': return '#ef4444';
      case 'On Hold': return '#6366f1';
      case 'Not Interested': return '#64748b';
      case 'Hired': return '#059669';
      default: return BRAND;
    }
  };

  const renderDataField = (label, value) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <Box mb="3">
        <Text fontSize="12px" color="#64748b" fontWeight="600" textTransform="uppercase">{label}</Text>
        <Text fontSize="14px" color="#1e293b" fontWeight="500">{value}</Text>
      </Box>
    );
  };

  return (
    <Box pb="10">
      <PageHeader
        title="Total Applications Record List"
        breadcrumb="Total Applications Record List"
        actions={[
          <Button key="assign" leftIcon={<UserCheck size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>
            Assign Candidates
          </Button>,
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
          <Text fontSize="sm" fontWeight="700" color="#1e293b">Total Applications Record List</Text>
        </Flex>

        <TableControls 
          search={searchTerm} 
          onSearch={setSearchTerm} 
          entries={entriesPerPage}
          onEntriesChange={setEntriesPerPage}
          searchPlaceholder="Search by name, phone or job..." 
        />

        <Box overflowX="auto">
          {isLoading ? (
            <Flex justify="center" py="10"><Spinner color={BRAND} /></Flex>
          ) : (
            <Table variant="simple" size="sm">
              <Thead {...tableHeadStyle}>
                <Tr>
                  <Th {...thStyle} w="40px"><Checkbox colorScheme="blue" /></Th>
                  <Th {...thStyle} minW="60px">NO.</Th>
                  <Th {...thStyle} minW="150px">CANDIDATE IMAGE</Th>
                  <Th {...thStyle} minW="280px">CANDIDATE DETAILS</Th>
                  <Th {...thStyle} minW="300px">JOB DETAILS</Th>
                  <Th {...thStyle} minW="280px">APPLY DATE & STATUS</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentRecords.map((c, index) => (
                  <Tr key={c._id} {...trHover}>
                    <Td {...tdStyle} textAlign="center"><Checkbox colorScheme="blue" /></Td>
                    <Td {...tdStyle} color="#475569" fontWeight="600" textAlign="center">{indexOfFirstRecord + index + 1}</Td>
                    <Td {...tdStyle} textAlign="center">
                      <VStack spacing="3" align="center">
                        <Avatar size="lg" name={c.candidateName} src={c.profileImage ? `${apiBase}/${c.profileImage}` : ''} border="2px solid #f8faff" />
                        <HStack spacing="2">
                          <Button size="xs" leftIcon={<Eye size={12} />} bg="#43767f" color="white" _hover={{ bg: '#33666f' }} borderRadius="4px" px="4" onClick={() => setSelectedAppData(c.applicationData)}>Full Details</Button>
                          {c.candidateCV && <Button size="xs" leftIcon={<FileText size={12} />} bg="#f97316" color="white" _hover={{ bg: '#ea580c' }} borderRadius="4px" px="4" onClick={() => window.open(`${apiBase}/${c.candidateCV}`, '_blank')}>CV</Button>}
                        </HStack>
                      </VStack>
                    </Td>
                    <Td {...tdStyle}>
                      <VStack align="start" spacing="1.5">
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Name: </Box>{c.candidateName}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Gender: </Box>{c.candidateGender || 'N/A'}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Email ID: </Box>{c.candidateEmail || 'N/A'}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Phone No.: </Box>{c.candidatePhone}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">State: </Box>{c.candidateState || 'N/A'}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">City: </Box>{c.candidateCity || 'N/A'}</Text>
                        <Flex align="start" pt="1">
                          <Text fontSize="13px" fontWeight="700" color="#1e293b" mr="2" whiteSpace="nowrap">Preferred Cities:</Text>
                          <VStack align="start" spacing="1">
                            {c.candidatePreferredCities?.map(city => (
                              <Badge key={city} bg="#ff6b00" color="white" borderRadius="4px" px="2" py="1" fontSize="11px" textTransform="none" fontWeight="600" minW="80px" textAlign="center">{city}</Badge>
                            ))}
                          </VStack>
                        </Flex>
                      </VStack>
                    </Td>
                    <Td {...tdStyle}>
                      <VStack align="start" spacing="1.5">
                        <Text fontWeight="700" color="#0000ff" fontSize="15px" mb="1" _hover={{ textDecoration: 'underline', cursor: 'pointer' }}>{c.jobTitle}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Job Category: </Box>{c.jobCategory}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Job Type: </Box>{c.jobType || 'N/A'}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Job Position: </Box>{c.jobPosition || 'N/A'}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">No. Of Vacancy: </Box>{c.vacancy || 'N/A'}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Joining Type: </Box>{c.joiningType || 'N/A'}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Salary Range: </Box>{c.salaryRange || 'N/A'}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Experience Range: </Box>{c.experienceRange || 'N/A'}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">Customer/Client Name: </Box>{c.customerName}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">State: </Box>{c.jobState || 'N/A'}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569">City: </Box>{c.jobCity || 'N/A'}</Text>
                      </VStack>
                    </Td>
                    <Td {...tdStyle} textAlign="center">
                      <VStack spacing="3" align="center">
                        <Select 
                          size="sm" 
                          bg={getStatusColor(c.status)} 
                          color="white" 
                          borderColor="transparent" 
                          borderRadius="4px" 
                          fontWeight="700" 
                          value={c.status}
                          onChange={(e) => handleStatusChange(c._id, e.target.value)}
                          sx={{ '& option': { color: '#1e293b', bg: 'white' } }}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Demo Scheduled">Demo Scheduled</option>
                          <option value="Reschedule Requested">Reschedule Requested</option>
                          <option value="Hired">Hired</option>
                          <option value="Rejected">Rejected</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Not Interested">Not Interested</option>
                        </Select>
                        <Badge
                          variant="outline"
                          borderRadius="full"
                          px="4"
                          py="1.5"
                          w="full"
                          fontSize="11px"
                          display="flex"
                          alignItems="center"
                          gap="2"
                          borderColor={getStatusColor(c.status)}
                          color={getStatusColor(c.status)}
                          bg="transparent"
                          textTransform="none"
                          fontWeight="600"
                          border="1px solid"
                        >
                          <Clock size={14} /> Applied: {new Date(c.appliedDate).toLocaleDateString()}
                        </Badge>
                      </VStack>
                    </Td>
                  </Tr>
                ))}
                {!isLoading && applications.length === 0 && (
                  <Tr><Td colSpan={6} py="10" textAlign="center" color="#94a3b8">No applications found.</Td></Tr>
                )}
              </Tbody>
            </Table>
          )}
        </Box>
        <TableFooter 
          showing={`${indexOfFirstRecord + 1} to ${Math.min(indexOfLastRecord, applications.length)}`} 
          total={applications.length} 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
        />
      </TableCard>

      <Modal isOpen={!!selectedAppData} onClose={() => setSelectedAppData(null)} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={BRAND}>Application Full Details</ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py="6">
            {!selectedAppData || Object.keys(selectedAppData).length === 0 ? (
              <Text color="gray.500" textAlign="center">No additional details available for this application.</Text>
            ) : (
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                {Object.entries(selectedAppData).map(([key, value]) => {
                  if (typeof value === 'object' && value !== null) {
                    return (
                      <GridItem colSpan={2} key={key}>
                        <Box bg="gray.50" p="4" borderRadius="md">
                          <Text fontSize="12px" color="#64748b" fontWeight="600" textTransform="uppercase" mb="2">{key}</Text>
                          <pre style={{ fontSize: '13px', color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        </Box>
                      </GridItem>
                    );
                  }
                  return (
                    <GridItem key={key}>
                      {renderDataField(key.replace(/([A-Z])/g, ' $1').trim(), value)}
                    </GridItem>
                  );
                })}
              </Grid>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => setSelectedAppData(null)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <PageFooter />
    </Box>
  );
};

export default ApplicationsList;
