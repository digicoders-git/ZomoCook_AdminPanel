import { useState, useEffect } from 'react';
import { 
  Box, Flex, Text, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td, Badge, 
  Button, Menu, MenuButton, MenuList, MenuItem, Icon, Spinner, useToast, 
  Select, Avatar, useDisclosure, MenuDivider } from '@chakra-ui/react';
import { 
  Plus, Settings, ChevronDown, 
  Briefcase, CalendarDays, FileType, Edit3, CheckCircle, UserCircle, Trash2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PageHeader, TableCard, TableControls, TableFooter, PageFooter, BRAND, ACCENT,
  thStyle, trHover, ConfirmationModal } from '../components/ui';
import axios from 'axios';

const CandidateList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Confirmation State
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [confirmConfig, setConfirmConfig] = useState({ title: '', description: '', onConfirm: () => {}, type: 'danger' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/candidates`, {
        params: { search: searchTerm, profileStatus: statusFilter },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setCandidates(response.data.candidates);
      }
    } catch (error) {
      toast({ title: 'Error', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [searchTerm, statusFilter]);

  // Pagination Logic
  const indexOfLastRecord = currentPage * entriesPerPage;
  const indexOfFirstRecord = indexOfLastRecord - entriesPerPage;
  const currentRecords = candidates.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(candidates.length / entriesPerPage);

  const handleDeleteCandidate = (id) => {
    setConfirmConfig({
      title: 'Delete Candidate?',
      description: 'Are you sure you want to delete this candidate? This action cannot be undone and all application history will be lost.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const token = localStorage.getItem('adminToken');
          await axios.delete(`${apiUrl}/candidates/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
          setCandidates(prev => prev.filter(c => c._id !== id));
          toast({ title: 'Candidate Deleted', status: 'success' });
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to delete candidate.', status: 'error' });
        }
        onClose();
      }
    });
    onOpen();
  };

  const apiUrl = import.meta.env.VITE_API_URL;

  return (
    <Box pb="10">
      <PageHeader
        title="Candidate Records"
        actions={[
          <Button key="add" as={Link} to="/candidates/add" leftIcon={<Plus size={14} />} size="sm" bg={BRAND} color="white" borderRadius="lg" fontSize="xs" px="4">Add Candidate</Button>
        ]}
      />

      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center" justify="space-between" flexWrap="wrap" gap="4">
          <HStack><Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="2" /><Text fontSize="sm" fontWeight="700" color="#1e293b">Candidate Record List</Text></HStack>
          <HStack spacing="3">
            <Select size="sm" w="150px" borderRadius="lg" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} fontSize="xs">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </Select>
            <TableControls 
              search={searchTerm} 
              onSearch={setSearchTerm} 
              entries={entriesPerPage} 
              onEntriesChange={setEntriesPerPage} 
              searchPlaceholder="Search candidates..." 
            />
          </HStack>
        </Flex>

        <Box overflowX="auto">
          {isLoading ? (
            <Flex justify="center" py="10"><Spinner color={BRAND} /></Flex>
          ) : (
            <Table variant="simple" size="sm" border="1px solid #edf2f7">
              <Thead bg="#f8faff">
                <Tr>
                  <Th {...thStyle} border="1px solid #edf2f7">Sr.No.</Th>
                  <Th {...thStyle} border="1px solid #edf2f7">Profile Image</Th>
                  <Th {...thStyle} border="1px solid #edf2f7">Basic Details</Th>
                  <Th {...thStyle} border="1px solid #edf2f7">Job Preference</Th>
                  <Th {...thStyle} border="1px solid #edf2f7">Job History</Th>
                  <Th {...thStyle} border="1px solid #edf2f7">Status</Th>
                  <Th {...thStyle} border="1px solid #edf2f7" textAlign="center">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentRecords.map((c, index) => (
                  <Tr key={c._id} _hover={{ bg: '#fcfdfe' }}>
                    <Td py="4" border="1px solid #edf2f7" verticalAlign="top" fontSize="xs" color="#475569">{indexOfFirstRecord + index + 1}</Td>
                    <Td py="4" border="1px solid #edf2f7" verticalAlign="middle" textAlign="center">
                      <VStack spacing="3">
                        <Avatar size="md" src={`${apiUrl}/${c.profileImage}`} name={c.name} border="2px solid #f0f5ff" />
                        <Button 
                            size="xs" bg="#ff6b00" color="white" leftIcon={<Icon as={FileType} size={12} />} 
                            px="3" borderRadius="md" fontSize="10px"
                            isDisabled={!c.cv} onClick={() => c.cv && window.open(`${apiUrl}/${c.cv}`, '_blank')}
                        >CV</Button>
                      </VStack>
                    </Td>
                    <Td py="4" border="1px solid #edf2f7" verticalAlign="top">
                      <VStack align="start" spacing="1">
                        <Text fontSize="xs" color="#475569"><b>Name :</b> {c.name}</Text>
                        <Text fontSize="xs" color="#475569"><b>Gender :</b> {c.gender}</Text>
                        <Text fontSize="xs" color="#475569"><b>Email ID :</b> {c.email}</Text>
                        <Text fontSize="xs" color="#475569"><b>Phone No. :</b> {c.phone}</Text>
                        <Text fontSize="xs" color="#475569"><b>State Name :</b> {c.state}</Text>
                        <Text fontSize="xs" color="#475569"><b>City Name :</b> {c.city}</Text>
                        <Text fontSize="xs" color="#475569"><b>Address :</b> {c.address}</Text>
                      </VStack>
                    </Td>
                    <Td py="4" border="1px solid #edf2f7" verticalAlign="top">
                      <VStack align="start" spacing="2">
                        <Text fontSize="xs" color="#475569"><b>Job Category :</b> {c.jobPreference?.jobCategory?.join(', ') || 'N/A'}</Text>
                        <Text fontSize="xs" color="#475569"><b>Job Type :</b> {c.jobType?.join(', ') || 'N/A'}</Text>
                        <HStack spacing="2" align="center">
                            <Text fontSize="xs" color="#475569"><b>Job Position :</b> {c.jobPreference?.jobPositions?.[0]}</Text>
                            {c.jobPreference?.jobPositions?.length > 1 && <Badge bg="#ff6b00" color="white" fontSize="9px" px="1">+{c.jobPreference.jobPositions.length - 1}</Badge>}
                        </HStack>
                        <Text fontSize="xs" color="#475569"><b>Preferred Cities :</b> {c.jobPreference?.preferredCities?.join(', ')}</Text>
                      </VStack>
                    </Td>
                    <Td py="4" border="1px solid #edf2f7" verticalAlign="top"><Text fontSize="xs" color="#94a3b8">N/A</Text></Td>
                    <Td py="4" border="1px solid #edf2f7" verticalAlign="top">
                      <VStack align="start" spacing="1">
                        <Text fontSize="xs" color="#475569"><b>KYC Status :</b> {c.kycStatus}</Text>
                        <Text fontSize="xs" color="#475569"><b>Profile Status :</b> {c.profileStatus}</Text>
                      </VStack>
                    </Td>
                    <Td py="4" border="1px solid #edf2f7" textAlign="center" verticalAlign="middle">
                      <Menu>
                        <MenuButton as={Button} size="sm" bg="#ff6b00" color="white" rightIcon={<ChevronDown size={14} />} leftIcon={<Settings size={14} />} fontSize="xs" px="4" borderRadius="md" _hover={{ bg: '#e65f00' }}>
                          Manage Profile
                        </MenuButton>
                        <MenuList borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 10px 25px rgba(0,0,0,0.08)" p="2" minW="220px">
                          <MenuItem icon={<Edit3 size={16} color="#ff6b00" />} borderRadius="lg" fontSize="sm" fontWeight="600" color="#475569" _hover={{ bg: '#fff5f0', color: '#ff6b00' }} onClick={() => navigate(`/candidates/edit/${c._id}`)}>
                            Edit Profile
                          </MenuItem>
                          <MenuItem icon={<Briefcase size={16} color="#3b82f6" />} borderRadius="lg" fontSize="sm" fontWeight="600" color="#475569" _hover={{ bg: '#f0f7ff', color: '#3b82f6' }} onClick={() => navigate(`/candidates/view/${c._id}?view=applied`)}>
                            Applied Jobs
                          </MenuItem>
                          <MenuItem icon={<CheckCircle size={16} color="#10b981" />} borderRadius="lg" fontSize="sm" fontWeight="600" color="#475569" _hover={{ bg: '#f0fdf4', color: '#10b981' }} onClick={() => navigate(`/candidates/view/${c._id}?view=shortlisted`)}>
                            Shortlisted Jobs
                          </MenuItem>
                          <MenuItem icon={<CalendarDays size={16} color="#f59e0b" />} borderRadius="lg" fontSize="sm" fontWeight="600" color="#475569" _hover={{ bg: '#fffbeb', color: '#f59e0b' }} onClick={() => navigate(`/candidates/view/${c._id}?view=demo`)}>
                            Demo Scheduled Jobs
                          </MenuItem>
                          <MenuItem icon={<UserCircle size={16} color="#6366f1" />} borderRadius="lg" fontSize="sm" fontWeight="600" color="#475569" _hover={{ bg: '#f5f3ff', color: '#6366f1' }} onClick={() => navigate(`/candidates/view/${c._id}`)}>
                            Candidate Details
                          </MenuItem>
                          <MenuDivider />
                          <MenuItem icon={<Trash2 size={16} color={ACCENT} />} borderRadius="lg" fontSize="sm" fontWeight="600" color={ACCENT} _hover={{ bg: '#fff0f0', color: ACCENT }} onClick={() => handleDeleteCandidate(c._id)}>
                            Delete Candidate
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
                {!isLoading && candidates.length === 0 && <Tr><Td colSpan={7} py="10" textAlign="center" color="#94a3b8">No records found.</Td></Tr>}
              </Tbody>
            </Table>
          )}
        </Box>
        <TableFooter showing={`${indexOfFirstRecord + 1} to ${Math.min(indexOfLastRecord, candidates.length)}`} total={candidates.length} onPageChange={setCurrentPage} currentPage={currentPage} totalPages={totalPages} />
      </TableCard>

      <ConfirmationModal 
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        type={confirmConfig.type}
        confirmColor={confirmConfig.type === 'danger' ? ACCENT : BRAND}
      />

      <PageFooter />
    </Box>
  );
};

export default CandidateList;
