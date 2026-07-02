import { useState, useEffect } from 'react';
import {
  Box, Flex, Text, VStack, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Button, Avatar, Spinner, useToast, Icon, HStack
} from '@chakra-ui/react';
import {
  FileText, ArrowLeft, Calendar, Clock, CheckCircle2, XCircle, PauseCircle, Ban, CheckCircle, CalendarClock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PageHeader, TableCard, TableControls, TableFooter, PageFooter,
  BRAND, tableHeadStyle, thStyle, tdStyle, trHover,
} from '../components/ui';
import axios from 'axios';

import API_BASE_URL from '../apiConfig';

const CandidateStatusList = ({ status, title }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const apiBase = API_BASE_URL.replace('/api', '');

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/candidates/applications`, {
        params: { status, search: searchTerm },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      console.error(`Error fetching ${status} candidates:`, error);
      toast({ title: 'Error', description: `Failed to load ${status} candidates.`, status: 'error', duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    setCurrentPage(1); // Reset to first page on search/status change
  }, [status, searchTerm]);

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

  const getStatusIcon = (s) => {
    switch (s) {
      case 'Applied': return Clock;
      case 'Shortlisted': return CheckCircle2;
      case 'Demo Scheduled': return Calendar;
      case 'Reschedule Requested': return CalendarClock;
      case 'Rejected': return XCircle;
      case 'On Hold': return PauseCircle;
      case 'Not Interested': return Ban;
      case 'Hired': return CheckCircle;
      default: return CheckCircle2;
    }
  };

  // Pagination Logic
  const indexOfLastRecord = currentPage * entriesPerPage;
  const indexOfFirstRecord = indexOfLastRecord - entriesPerPage;
  const currentRecords = applications.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(applications.length / entriesPerPage);

  return (
    <Box pb="10">
      <PageHeader
        title={title}
        breadcrumb={title}
        actions={[
          <Button key="back" as={Link} to="/candidates/list" leftIcon={<ArrowLeft size={14} />} size="sm" variant="outline" borderColor={BRAND} color={BRAND} borderRadius="lg">Back</Button>,
        ]}
      />

      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center" justify="space-between">
          <HStack spacing="3">
            <Box w="3px" h="18px" bg={BRAND} borderRadius="full" />
            <Text fontSize="sm" fontWeight="700" color="#1e293b">{title}</Text>
          </HStack>
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
                  <Th {...thStyle} w="60px">NO.</Th>
                  <Th {...thStyle} minW="150px">CANDIDATE IMAGE</Th>
                  <Th {...thStyle} minW="280px">CANDIDATE DETAILS</Th>
                  <Th {...thStyle} minW="300px">JOB DETAILS</Th>
                  <Th {...thStyle} minW="280px">STATUS & DATES</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentRecords.map((app, index) => (
                  <Tr key={app._id} {...trHover}>
                    <Td {...tdStyle} color="#475569" fontWeight="600" textAlign="center">{indexOfFirstRecord + index + 1}</Td>
                    <Td {...tdStyle} textAlign="center">
                      <VStack spacing="3" align="center">
                        <Avatar size="lg" name={app.candidateName} src={`${apiBase}/${app.profileImage}`} border="2px solid #f8faff" />
                        <Button size="xs" leftIcon={<FileText size={12} />} bg="#f97316" color="white" _hover={{ bg: '#ea580c' }} borderRadius="4px" px="6" py="3" onClick={() => window.open(`${apiBase}/${app.candidateCV}`, '_blank')}>CV</Button>
                      </VStack>
                    </Td>
                    <Td {...tdStyle}>
                      <VStack align="start" spacing="1.5">
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569" fontWeight="600">Name: </Box>{app.candidateName}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569" fontWeight="600">Phone No.: </Box>{app.candidatePhone}</Text>
                        <Text fontSize="13px" color="#1e293b"><Box as="span" color="#475569" fontWeight="600">City: </Box>{app.candidateCity}</Text>
                      </VStack>
                    </Td>
                    <Td {...tdStyle}>
                      <VStack align="start" spacing="1.5">
                        <Text fontWeight="700" color="#0000ff" fontSize="15px" mb="1" onClick={() => navigate(`/jobs/view/${app.jobId}`)} cursor="pointer" _hover={{ textDecoration: 'underline' }}>{app.jobTitle}</Text>
                        <Badge colorScheme="blue" variant="subtle" fontSize="10px">{app.jobCategory}</Badge>
                      </VStack>
                    </Td>
                    <Td {...tdStyle} textAlign="center">
                      <VStack spacing="3" align="center">
                        <Button leftIcon={<Icon as={getStatusIcon(app.status)} size={14} fill="white" />} size="sm" bg={getStatusColor(app.status)} color="white" borderRadius="4px" px="10" py="4" fontSize="13px" fontWeight="700">
                          {app.status}
                        </Button>
                        <Badge variant="outline" borderRadius="full" px="4" py="1.5" fontSize="10px" borderColor={getStatusColor(app.status)} color={getStatusColor(app.status)} border="1px solid">
                          Applied: {new Date(app.appliedDate).toLocaleDateString()}
                        </Badge>
                      </VStack>
                    </Td>
                  </Tr>
                ))}
                {!isLoading && applications.length === 0 && (
                  <Tr><Td colSpan={5} py="10" textAlign="center" color="#94a3b8">No candidates found for this category.</Td></Tr>
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
      <PageFooter />
    </Box>
  );
};

export default CandidateStatusList;
