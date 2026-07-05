import { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, VStack, Table, Thead, Tbody, Tr, Th, Td, Avatar, Badge,
  Button, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, FormControl, FormLabel, Textarea, Select, Spinner,
  Icon, IconButton, SimpleGrid, Card, CardBody
} from '@chakra-ui/react';
import { CheckCircle, XCircle, Eye, AlertCircle, Clock } from 'lucide-react';
import { PageHeader, PageFooter, BRAND, ACCENT, TableCard, TableControls, TableFooter } from '../components/ui';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const BRAND_COLOR = '#004aad';
const ACCENT_COLOR = '#f59e0b';

const PendingCookApprovals = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cooks, setCooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCook, setSelectedCook] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // Approval/Rejection form
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [photoRejectionReason, setPhotoRejectionReason] = useState('');
  const [idRejectionReason, setIdRejectionReason] = useState('');
  const [verificationChecklist, setVerificationChecklist] = useState({
    photoAppropriate: true,
    photoClarity: true,
    idProofValid: true,
    nameMatches: true,
    ageVerified: true,
    addressVerified: true,
    backgroundCheckPassed: true
  });

  const token = localStorage.getItem('adminToken');

  const fetchPendingCooks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/pending-cook-approvals`, {
        params: { status: 'pending_approval', page: currentPage, limit: entriesPerPage },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCooks(response.data.candidates);
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to fetch pending cooks', status: 'error', duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCooks();
  }, [currentPage, entriesPerPage]);

  const handleViewCook = async (cook) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/cook-verification/${cook._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSelectedCook(response.data.candidate);
        setApprovalNotes('');
        setRejectionReason('');
        setPhotoRejectionReason('');
        setIdRejectionReason('');
        onOpen();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load cook details', status: 'error' });
    }
  };

  const handleApproveCook = async () => {
    if (!selectedCook) return;
    setIsProcessing(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/approve-cook/${selectedCook._id}`,
        { approvalNotes, verificationChecklist },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast({ title: 'Success', description: 'Cook profile approved successfully', status: 'success', duration: 2000 });
        onClose();
        fetchPendingCooks();
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to approve cook', status: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectCook = async () => {
    if (!selectedCook || !rejectionReason) {
      toast({ title: 'Error', description: 'Please provide rejection reason', status: 'error' });
      return;
    }
    setIsProcessing(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/reject-cook/${selectedCook._id}`,
        { rejectionReason, photoRejectionReason, idRejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast({ title: 'Success', description: 'Cook profile rejected', status: 'success', duration: 2000 });
        onClose();
        fetchPendingCooks();
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to reject cook', status: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredCooks = cooks.filter(cook =>
    cook.name.toLowerCase().includes(search.toLowerCase()) ||
    cook.phone.includes(search) ||
    cook.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCooks.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedCooks = filteredCooks.slice(startIndex, startIndex + entriesPerPage);

  return (
    <Box pb="10">
      <PageHeader
        title="Pending Cook Approvals"
        breadcrumb="Cook Approvals"
      />

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4" mb="6">
        <Card bg="white" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.05)">
          <CardBody>
            <VStack align="start" spacing="2">
              <HStack spacing="2">
                <Icon as={Clock} boxSize={5} color={BRAND_COLOR} />
                <Text fontSize="sm" fontWeight="700" color="#64748b">Pending Review</Text>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="#1e293b">{cooks.length}</Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center" justify="space-between" wrap="wrap" gap="4">
          <HStack><Box w="3px" h="18px" bg={BRAND_COLOR} borderRadius="full" mr="2" /><Text fontSize="sm" fontWeight="700" color="#1e293b">Pending Cook Profiles</Text></HStack>
          <TableControls
            search={search}
            onSearch={setSearch}
            entries={entriesPerPage}
            onEntriesChange={setEntriesPerPage}
            searchPlaceholder="Search by name, phone, email..."
          />
        </Flex>

        <Box overflowX="auto">
          {isLoading ? (
            <Flex justify="center" py="10"><Spinner color={BRAND_COLOR} size="lg" /></Flex>
          ) : paginatedCooks.length > 0 ? (
            <Table variant="simple" size="sm">
              <Thead bg="#f8faff">
                <Tr>
                  <Th py="4" px="4" fontSize="xs" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.5px" border="1px solid #e8edf5">Sr.No.</Th>
                  <Th py="4" px="4" fontSize="xs" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.5px" border="1px solid #e8edf5">Profile</Th>
                  <Th py="4" px="4" fontSize="xs" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.5px" border="1px solid #e8edf5">Contact</Th>
                  <Th py="4" px="4" fontSize="xs" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.5px" border="1px solid #e8edf5">Location</Th>
                  <Th py="4" px="4" fontSize="xs" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.5px" border="1px solid #e8edf5">Status</Th>
                  <Th py="4" px="4" fontSize="xs" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.5px" border="1px solid #e8edf5" textAlign="center">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedCooks.map((cook, index) => (
                  <Tr key={cook._id} _hover={{ bg: '#f8faff' }}>
                    <Td py="4" px="4" fontSize="sm" color="#64748b" fontWeight="600" border="1px solid #e8edf5">{startIndex + index + 1}</Td>
                    <Td py="4" px="4" border="1px solid #e8edf5">
                      <HStack spacing="3">
                        <Avatar size="md" src={cook.profileImage} name={cook.name} border="2px solid #e8edf5" />
                        <VStack align="start" spacing="0.5">
                          <Text fontSize="sm" fontWeight="700" color="#1e293b">{cook.name}</Text>
                          <Text fontSize="xs" color="#94a3b8">{cook.email}</Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td py="4" px="4" border="1px solid #e8edf5">
                      <VStack align="start" spacing="1">
                        <Text fontSize="xs" color="#475569"><b>Phone:</b> {cook.phone}</Text>
                        {cook.altPhone && <Text fontSize="xs" color="#475569"><b>Alt:</b> {cook.altPhone}</Text>}
                      </VStack>
                    </Td>
                    <Td py="4" px="4" border="1px solid #e8edf5">
                      <VStack align="start" spacing="1">
                        <Text fontSize="xs" color="#475569">{cook.city || 'N/A'}</Text>
                        <Text fontSize="xs" color="#94a3b8">{cook.state || 'N/A'}</Text>
                      </VStack>
                    </Td>
                    <Td py="4" px="4" border="1px solid #e8edf5">
                      <Badge
                        px="3" py="1.5"
                        borderRadius="full"
                        fontSize="11px"
                        fontWeight="700"
                        bg="#fff4e6"
                        color="#f59e0b"
                        border="1px solid #fcd34d"
                      >
                        ⏳ Pending
                      </Badge>
                    </Td>
                    <Td py="4" px="4" border="1px solid #e8edf5" textAlign="center">
                      <Button
                        size="sm"
                        leftIcon={<Eye size={14} />}
                        bg={BRAND_COLOR}
                        color="white"
                        borderRadius="lg"
                        fontSize="xs"
                        px="4"
                        _hover={{ bg: '#003d91' }}
                        onClick={() => handleViewCook(cook)}
                      >
                        Review
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Flex justify="center" py="10" direction="column" align="center">
              <Icon as={CheckCircle} boxSize={12} color="#10b981" mb="4" />
              <Text fontSize="lg" fontWeight="700" color="#1e293b">All Caught Up!</Text>
              <Text fontSize="sm" color="#64748b">No pending cook approvals at the moment.</Text>
            </Flex>
          )}
        </Box>

        {paginatedCooks.length > 0 && (
          <TableFooter
            showing={`${filteredCooks.length > 0 ? startIndex + 1 : 0} to ${Math.min(startIndex + entriesPerPage, filteredCooks.length)}`}
            total={filteredCooks.length}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </TableCard>

      {/* Cook Profile Review Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" overflow="hidden" mx="4">
          <ModalHeader bg={BRAND_COLOR} color="white" py="5" px="6">
            <HStack spacing="3">
              <Icon as={Eye} boxSize={5} />
              <VStack align="start" spacing="0">
                <Text fontSize="lg" fontWeight="800">Cook Profile Review</Text>
                <Text fontSize="xs" fontWeight="500" opacity="0.9">{selectedCook?.name}</Text>
              </VStack>
            </HStack>
          </ModalHeader>

          <ModalBody py="6" px="6">
            {selectedCook && (
              <VStack spacing="6" align="stretch">
                {/* Profile Section */}
                <Box>
                  <Text fontSize="sm" fontWeight="700" color={BRAND_COLOR} mb="4" textTransform="uppercase" letterSpacing="0.5px">Profile Information</Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                    <VStack align="start" spacing="2">
                      <Text fontSize="xs" color="#94a3b8" fontWeight="600">Name</Text>
                      <Text fontSize="sm" fontWeight="700" color="#1e293b">{selectedCook.name}</Text>
                    </VStack>
                    <VStack align="start" spacing="2">
                      <Text fontSize="xs" color="#94a3b8" fontWeight="600">Email</Text>
                      <Text fontSize="sm" fontWeight="700" color="#1e293b">{selectedCook.email}</Text>
                    </VStack>
                    <VStack align="start" spacing="2">
                      <Text fontSize="xs" color="#94a3b8" fontWeight="600">Phone</Text>
                      <Text fontSize="sm" fontWeight="700" color="#1e293b">{selectedCook.phone}</Text>
                    </VStack>
                    <VStack align="start" spacing="2">
                      <Text fontSize="xs" color="#94a3b8" fontWeight="600">Age</Text>
                      <Text fontSize="sm" fontWeight="700" color="#1e293b">{selectedCook.age || 'N/A'}</Text>
                    </VStack>
                    <VStack align="start" spacing="2">
                      <Text fontSize="xs" color="#94a3b8" fontWeight="600">Gender</Text>
                      <Text fontSize="sm" fontWeight="700" color="#1e293b" textTransform="capitalize">{selectedCook.gender || 'N/A'}</Text>
                    </VStack>
                    <VStack align="start" spacing="2">
                      <Text fontSize="xs" color="#94a3b8" fontWeight="600">Location</Text>
                      <Text fontSize="sm" fontWeight="700" color="#1e293b">{selectedCook.city}, {selectedCook.state}</Text>
                    </VStack>
                  </SimpleGrid>
                </Box>

                {/* Profile Image */}
                {selectedCook.profileImage && (
                  <Box>
                    <Text fontSize="sm" fontWeight="700" color={BRAND_COLOR} mb="3" textTransform="uppercase" letterSpacing="0.5px">Profile Photo</Text>
                    <Avatar size="2xl" src={selectedCook.profileImage} name={selectedCook.name} />
                  </Box>
                )}

                {/* Documents */}
                {selectedCook.documents && (
                  <Box>
                    <Text fontSize="sm" fontWeight="700" color={BRAND_COLOR} mb="3" textTransform="uppercase" letterSpacing="0.5px">Documents</Text>
                    <VStack align="start" spacing="2">
                      {selectedCook.documents.idProofType && (
                        <Text fontSize="xs" color="#475569"><b>ID Proof:</b> {selectedCook.documents.idProofType}</Text>
                      )}
                      {selectedCook.documents.idProof && (
                        <Button size="xs" variant="outline" colorScheme="blue" onClick={() => window.open(selectedCook.documents.idProof, '_blank')}>
                          View ID Proof
                        </Button>
                      )}
                    </VStack>
                  </Box>
                )}

                {/* Verification Checklist */}
                <Box>
                  <Text fontSize="sm" fontWeight="700" color={BRAND_COLOR} mb="3" textTransform="uppercase" letterSpacing="0.5px">Verification Checklist</Text>
                  <VStack align="start" spacing="2">
                    {Object.entries(verificationChecklist).map(([key, value]) => (
                      <HStack key={key} spacing="3" w="full">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setVerificationChecklist({ ...verificationChecklist, [key]: e.target.checked })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <Text fontSize="sm" color="#475569" textTransform="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                {/* Approval Notes */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700" color={BRAND_COLOR} textTransform="uppercase" letterSpacing="0.5px">Approval Notes (Optional)</FormLabel>
                  <Textarea
                    placeholder="Add any notes for approval..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    borderRadius="lg"
                    border="1.5px solid #dde6f5"
                    bg="#f8faff"
                    fontSize="sm"
                    rows={3}
                  />
                </FormControl>

                {/* Rejection Section */}
                <Box borderTop="2px solid #e8edf5" pt="4">
                  <Text fontSize="sm" fontWeight="700" color={ACCENT_COLOR} mb="3" textTransform="uppercase" letterSpacing="0.5px">Rejection Reason (If Rejecting)</Text>
                  <VStack spacing="3" align="stretch">
                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="700" color="#475569">Main Rejection Reason</FormLabel>
                      <Textarea
                        placeholder="Provide reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        borderRadius="lg"
                        border="1.5px solid #dde6f5"
                        bg="#f8faff"
                        fontSize="sm"
                        rows={2}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="700" color="#475569">Photo Rejection Reason (Optional)</FormLabel>
                      <Textarea
                        placeholder="Specific issues with photo..."
                        value={photoRejectionReason}
                        onChange={(e) => setPhotoRejectionReason(e.target.value)}
                        borderRadius="lg"
                        border="1.5px solid #dde6f5"
                        bg="#f8faff"
                        fontSize="sm"
                        rows={2}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="700" color="#475569">ID Rejection Reason (Optional)</FormLabel>
                      <Textarea
                        placeholder="Specific issues with ID..."
                        value={idRejectionReason}
                        onChange={(e) => setIdRejectionReason(e.target.value)}
                        borderRadius="lg"
                        border="1.5px solid #dde6f5"
                        bg="#f8faff"
                        fontSize="sm"
                        rows={2}
                      />
                    </FormControl>
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter bg="#f8faff" borderTop="1px solid #e8edf5" py="4" px="6" gap="3">
            <Button variant="ghost" onClick={onClose} color="#64748b" _hover={{ bg: '#f1f5f9' }}>
              Close
            </Button>
            <Button
              leftIcon={<XCircle size={16} />}
              bg={ACCENT_COLOR}
              color="white"
              _hover={{ bg: '#c8151c' }}
              isLoading={isProcessing}
              onClick={handleRejectCook}
            >
              Reject
            </Button>
            <Button
              leftIcon={<CheckCircle size={16} />}
              bg="#10b981"
              color="white"
              _hover={{ bg: '#059669' }}
              isLoading={isProcessing}
              onClick={handleApproveCook}
            >
              Approve
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <PageFooter />
    </Box>
  );
};

export default PendingCookApprovals;
