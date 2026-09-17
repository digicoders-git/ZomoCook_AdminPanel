import { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td, Badge,
  Button, Menu, MenuButton, MenuList, MenuItem, Icon, Spinner, useToast,
  Select, Avatar, useDisclosure, MenuDivider, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  FormControl, FormLabel
} from '@chakra-ui/react';
import {
  Plus, Settings, ChevronDown,
  Briefcase, CalendarDays, FileType, Edit3, CheckCircle, UserCircle, Trash2, UserCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PageHeader, TableCard, TableControls, TableFooter, PageFooter, BRAND, ACCENT,
  thStyle, ConfirmationModal
} from '../components/ui';
import CandidateCVModal from '../components/CandidateCVModal';
import PageContentLoader from '../components/PageContentLoader';
import axios from 'axios';
import API_BASE_URL, { UPLOAD_BASE_URL } from '../apiConfig';

const CandidateList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidateForCV, setSelectedCandidateForCV] = useState(null);
  const { isOpen: isCVModalOpen, onOpen: onOpenCVModal, onClose: onCloseCVModal } = useDisclosure();
  const [statusFilter, setStatusFilter] = useState('');
  const [leadManagerFilter, setLeadManagerFilter] = useState('');

  // Admin role detection
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const roleName = (adminData?.role?.name || '').toLowerCase();
  const isSuperAdmin =
    adminData?.email?.toLowerCase() === 'zomocookadmin@gmail.com' ||
    adminData?.isSuperAdmin === true ||
    (adminData?.type === 'admin' && !adminData?.role) ||
    roleName === 'super admin';

  const isLeadManager = !isSuperAdmin && (adminData?.type === 'user' || (adminData?.type === 'admin' && !!adminData?.role && roleName !== 'super admin'));

  // Lead Managers state
  const [leadManagers, setLeadManagers] = useState([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedLeadManager, setSelectedLeadManager] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Confirmation State
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [confirmConfig, setConfirmConfig] = useState({ title: '', description: '', onConfirm: () => { }, type: 'danger' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/candidates`, {
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

  const fetchLeadManagers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/users?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setLeadManagers(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching lead managers:', error);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchLeadManagers();
  }, [searchTerm, statusFilter]);

  const getLeadManagerName = (candidate) => {
    if (!candidate || !candidate.leadManager) return 'Not Assigned';
    const lm = String(candidate.leadManager).toLowerCase().trim();
    const found = leadManagers.find(m =>
      String(m._id).toLowerCase() === lm ||
      String(m.name || '').toLowerCase().trim() === lm ||
      String(m.email || '').toLowerCase().trim() === lm
    );
    return found ? found.name : candidate.leadManager;
  };

  const handleAssignLeadManager = async () => {
    if (!selectedCandidate) return;
    setIsAssigning(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_BASE_URL}/candidates/${selectedCandidate._id}`, {
        leadManager: selectedLeadManager
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setCandidates(prev => prev.map(c => c._id === selectedCandidate._id ? { ...c, leadManager: selectedLeadManager } : c));
        toast({ title: 'Success', description: 'Lead Manager assigned successfully.', status: 'success', duration: 2000 });
        setIsAssignModalOpen(false);
      }
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to assign lead manager', status: 'error', duration: 2000 });
    } finally {
      setIsAssigning(false);
    }
  };

  // Filter and Pagination Logic
  const filteredCandidates = candidates.filter(c => {
    if (isLeadManager) {
      const myId = String(adminData?.id || adminData?._id || '').toLowerCase().trim();
      const myName = String(adminData?.name || '').toLowerCase().trim();
      const myEmail = String(adminData?.email || '').toLowerCase().trim();
      const lm = String(c.leadManager || '').toLowerCase().trim();
      const isAssigned = (myId && lm === myId) || 
                         (myName && lm === myName) || 
                         (myEmail && lm === myEmail);
      if (!isAssigned) return false;
    }
    if (leadManagerFilter && c.leadManager !== leadManagerFilter) return false;
    return true;
  });

  const indexOfLastRecord = currentPage * entriesPerPage;
  const indexOfFirstRecord = indexOfLastRecord - entriesPerPage;
  const currentRecords = filteredCandidates.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredCandidates.length / entriesPerPage);

  const handleDeleteCandidate = (id) => {
    setConfirmConfig({
      title: 'Delete Candidate?',
      description: 'Are you sure you want to delete this candidate? This action cannot be undone and all application history will be lost.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('adminToken');
          const response = await axios.delete(`${API_BASE_URL}/candidates/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (response.data.success) {
            setCandidates(prev => prev.filter(c => c._id !== id));
            toast({ title: 'Candidate Deleted', status: 'success' });
          }
        } catch (error) {
          toast({ title: 'Error', description: error.response?.data?.message || 'Failed to delete candidate.', status: 'error' });
        }
        onClose();
      }
    });
    onOpen();
  };

  const handleKycStatusChange = async (candidateId, newKycStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(`${API_BASE_URL}/candidates/${candidateId}/status`,
        { type: 'kyc', value: newKycStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast({ title: 'Success', description: 'Candidate KYC status updated.', status: 'success', duration: 3000 });
        setCandidates(prev => prev.map(c => c._id === candidateId ? { ...c, kycStatus: newKycStatus } : c));
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update KYC status.', status: 'error', duration: 3000 });
    }
  };

  const getKycColor = (s) => {
    switch (s?.toLowerCase()) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#f59e0b';
    }
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
          <HStack spacing="3" flexWrap="wrap">
            {!isLeadManager && (
              <Select size="sm" w="170px" borderRadius="lg" value={leadManagerFilter} onChange={(e) => setLeadManagerFilter(e.target.value)} fontSize="xs">
                <option value="">All Lead Managers</option>
                {leadManagers.map(lm => (
                  <option key={lm._id} value={lm._id}>{lm.name}</option>
                ))}
              </Select>
            )}
            <Select size="sm" w="130px" borderRadius="lg" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} fontSize="xs">
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
            <PageContentLoader />
          ) : (
            <Table variant="simple" size="sm" border="1px solid #edf2f7">
              <Thead bg="#f8faff">
                <Tr>
                  <Th {...thStyle} border="1px solid #edf2f7">Sr.No.</Th>
                  <Th {...thStyle} border="1px solid #edf2f7">Profile Image</Th>
                  <Th {...thStyle} border="1px solid #edf2f7">Basic Details</Th>
                  <Th {...thStyle} border="1px solid #edf2f7">Job Preference</Th>
                  <Th {...thStyle} border="1px solid #edf2f7">Lead Manager</Th>
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
                        <Avatar size="md" src={`${UPLOAD_BASE_URL}/${c.profileImage}`} name={c.name} border="2px solid #f0f5ff" />
                        <Button
                          size="xs" bg="#ff6b00" color="white" leftIcon={<Icon as={FileType} size={12} />}
                          px="3" borderRadius="md" fontSize="10px"
                          onClick={() => {
                            setSelectedCandidateForCV(c._id);
                            onOpenCVModal();
                          }}
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
                        <Text fontSize="xs" color="#475569"><b>Job Type :</b> {c.jobPreference?.jobType?.join(', ') || 'N/A'}</Text>
                        <HStack spacing="2" align="center">
                          <Text fontSize="xs" color="#475569"><b>Job Position :</b> {c.jobPreference?.jobPositions?.[0] || 'N/A'}</Text>
                          {c.jobPreference?.jobPositions?.length > 1 && <Badge bg="#ff6b00" color="white" fontSize="9px" px="1">+{c.jobPreference.jobPositions.length - 1}</Badge>}
                        </HStack>
                        <Text fontSize="xs" color="#475569"><b>Preferred Cities :</b> {c.jobPreference?.preferredCities?.join(', ')}</Text>
                      </VStack>
                    </Td>
                    <Td py="4" border="1px solid #edf2f7" verticalAlign="top">
                      <VStack align="start" spacing="1.5">
                        <Badge
                          px="2.5"
                          py="0.5"
                          borderRadius="full"
                          fontSize="11px"
                          fontWeight="700"
                          bg={c.leadManager ? '#eff6ff' : '#f8fafc'}
                          color={c.leadManager ? '#1d4ed8' : '#94a3b8'}
                          border={`1px solid ${c.leadManager ? '#bfdbfe' : '#e2e8f0'}`}
                          textTransform="none"
                        >
                          {getLeadManagerName(c)}
                        </Badge>
                        {!isLeadManager && (
                          <Button
                            size="xs"
                            variant="outline"
                            colorScheme="blue"
                            leftIcon={<UserCheck size={12} />}
                            fontSize="10px"
                            h="24px"
                            onClick={() => {
                              setSelectedCandidate(c);
                              setSelectedLeadManager(c.leadManager || '');
                              setIsAssignModalOpen(true);
                            }}
                          >
                            Assign
                          </Button>
                        )}
                      </VStack>
                    </Td>
                    <Td py="4" border="1px solid #edf2f7" verticalAlign="top">
                      <Text fontSize="xs" color="#475569">
                        {c.workExperience?.lastCompany?.name ? (
                          <>
                            <b>Company:</b> {c.workExperience.lastCompany.name}<br />
                            {c.workExperience.lastCompany.role && <><b>Role:</b> {c.workExperience.lastCompany.role}</>}
                          </>
                        ) : 'N/A'}
                      </Text>
                    </Td>
                    <Td py="4" border="1px solid #edf2f7" verticalAlign="top">
                      <VStack align="start" spacing="1">
                        <Text fontSize="11px" fontWeight="600" color="#64748b" mb="-1">KYC Status:</Text>
                        <Select
                          size="sm"
                          bg={getKycColor(c.kycStatus)}
                          color="white"
                          borderColor="transparent"
                          borderRadius="4px"
                          fontWeight="700"
                          value={c.kycStatus?.toLowerCase() || 'pending'}
                          onChange={(e) => handleKycStatusChange(c._id, e.target.value)}
                          sx={{ '& option': { color: '#1e293b', bg: 'white' } }}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </Select>
                        <Text fontSize="11px" fontWeight="600" color="#64748b" mb="-1" mt="2">Profile Status:</Text>
                        <Badge bg={c.profileStatus === 'active' ? '#10b981' : '#ef4444'} color="white" borderRadius="4px" px="2" py="1" fontSize="11px">{c.profileStatus}</Badge>
                      </VStack>
                    </Td>
                    <Td py="4" border="1px solid #edf2f7" textAlign="center" verticalAlign="middle">
                      <Menu>
                        <MenuButton as={Button} size="sm" bg="#ff6b00" color="white" rightIcon={<ChevronDown size={14} />} leftIcon={<Settings size={14} />} fontSize="xs" px="4" borderRadius="md" _hover={{ bg: '#e65f00' }}>
                          Manage Profile
                        </MenuButton>
                        <MenuList borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 10px 25px rgba(0,0,0,0.08)" p="2" minW="220px">
                          {!isLeadManager && (
                            <MenuItem icon={<UserCheck size={16} color="#0f62fe" />} borderRadius="lg" fontSize="sm" fontWeight="600" color="#475569" _hover={{ bg: '#f0f7ff', color: '#0f62fe' }} onClick={() => {
                              setSelectedCandidate(c);
                              setSelectedLeadManager(c.leadManager || '');
                              setIsAssignModalOpen(true);
                            }}>
                              Assign Lead Manager
                            </MenuItem>
                          )}
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
                {!isLoading && filteredCandidates.length === 0 && <Tr><Td colSpan={8} py="10" textAlign="center" color="#94a3b8">No records found.</Td></Tr>}
              </Tbody>
            </Table>
          )}
        </Box>
        <TableFooter showing={`${indexOfFirstRecord + 1} to ${Math.min(indexOfLastRecord, filteredCandidates.length)}`} total={filteredCandidates.length} onPageChange={setCurrentPage} currentPage={currentPage} totalPages={totalPages} />
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

      <CandidateCVModal
        isOpen={isCVModalOpen}
        onClose={() => {
          onCloseCVModal();
          setSelectedCandidateForCV(null);
        }}
        candidateId={selectedCandidateForCV}
      />

      {/* Assign Lead Manager Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} isCentered size="md">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(3px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader fontSize="md" fontWeight="bold" color="#0B1A30" pb="2">
            Assign Lead Manager
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py="4">
            <Text fontSize="xs" color="#64748b" mb="3">
              Assign a Lead Manager to <strong>{selectedCandidate?.name}</strong>. Only this manager and Super Admin will have access to this candidate.
            </Text>
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="700" color="#475569">Select Manager</FormLabel>
              <Select
                size="sm"
                h="40px"
                borderRadius="lg"
                bg="#f8faff"
                border="1.5px solid #dde6f5"
                value={selectedLeadManager}
                onChange={(e) => setSelectedLeadManager(e.target.value)}
              >
                <option value="">-- Unassigned --</option>
                {leadManagers.map(lm => (
                  <option key={lm._id} value={lm._id}>
                    {lm.name} ({lm.role?.name || 'Staff'})
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter pt="2">
            <Button size="sm" variant="ghost" mr="3" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              bg={BRAND}
              color="white"
              _hover={{ bg: '#003d91' }}
              isLoading={isAssigning}
              onClick={handleAssignLeadManager}
            >
              Save Assignment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <PageFooter />
    </Box>
  );
};

export default CandidateList;
