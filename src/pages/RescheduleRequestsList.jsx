import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, VStack, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Button, Checkbox, Avatar, Spinner, useToast, Icon
} from '@chakra-ui/react';
import {
  Filter, FileText, ArrowLeft, Calendar, Clock, CheckCircle2, CalendarClock,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PageHeader, TableCard, TableControls, TableFooter, PageFooter,
  BRAND, tableHeadStyle, thStyle, tdStyle, trHover,
} from '../components/ui';
import axios from 'axios';

const RescheduleRequestsList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/candidates/applications`, {
        params: { status: 'Reschedule Requested', search: searchTerm },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load reschedule requests.', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [searchTerm]);

  const apiUrl = import.meta.env.VITE_API_URL;

  return (
    <Box pb="10">
      <PageHeader
        title="Reschedule Requests Candidates Records"
        breadcrumb="Reschedule Requests Candidates Records"
        actions={[
          <Button key="back" as={Link} to="/candidates/list" leftIcon={<ArrowLeft size={14} />} size="sm" variant="outline" borderColor={BRAND} color={BRAND} borderRadius="lg" _hover={{ bg: '#f0f5ff' }}>
            Back
          </Button>,
        ]}
      />

      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center">
          <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="3" />
          <Text fontSize="sm" fontWeight="700" color="#1e293b">Reschedule Requests Candidates Records</Text>
        </Flex>

        <TableControls searchPlaceholder="Search..." onSearch={setSearchTerm} />

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
                  <Th {...thStyle} minW="280px">APPLY DATE & STATUS</Th>
                </Tr>
              </Thead>
              <Tbody>
                {applications.map((app, index) => (
                  <Tr key={app._id} {...trHover}>
                    <Td {...tdStyle} color="#475569" fontWeight="600" textAlign="center">{index + 1}</Td>
                    <Td {...tdStyle} textAlign="center">
                      <VStack spacing="3" align="center">
                        <Avatar size="lg" name={app.candidateName} src={`${apiUrl}/${app.profileImage}`} border="2px solid #f8faff" />
                        <Button size="xs" leftIcon={<FileText size={12} />} bg="#f97316" color="white" _hover={{ bg: '#ea580c' }} borderRadius="4px" px="6" py="3" onClick={() => window.open(`${apiUrl}/${app.candidateCV}`, '_blank')}>CV</Button>
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
                        <Button leftIcon={<CalendarClock size={14} fill="white" />} size="sm" bg="#06b6d4" color="white" borderRadius="4px" px="6" py="4" fontSize="12px" fontWeight="700">
                          Reschedule Requested
                        </Button>
                        <Badge variant="outline" borderRadius="full" px="4" py="1.5" fontSize="10px" borderColor="#06b6d4" color="#06b6d4" border="1px solid">
                          Applied: {new Date(app.appliedDate).toLocaleDateString()}
                        </Badge>
                      </VStack>
                    </Td>
                  </Tr>
                ))}
                {!isLoading && applications.length === 0 && (
                  <Tr><Td colSpan={5} py="10" textAlign="center" color="#94a3b8">No reschedule requests found.</Td></Tr>
                )}
              </Tbody>
            </Table>
          )}
        </Box>
        <TableFooter showing={`1 to ${applications.length}`} total={applications.length} />
      </TableCard>
      <PageFooter />
    </Box>
  );
};

export default RescheduleRequestsList;
