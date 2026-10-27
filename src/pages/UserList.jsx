import { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, Table, Thead, Tbody, Tr, Th, Td, Switch,
  IconButton, Avatar, Spinner, useToast, Button, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Badge, Divider, VStack, SimpleGrid,
  Input, InputGroup, InputRightElement, FormControl, FormLabel, Tooltip
} from '@chakra-ui/react';
import { Edit3, Trash2, Filter, Plus, Eye, Key, EyeOff, Copy, Check, RefreshCw } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  PageHeader, TableCard, TableControls, TableFooter, PageFooter, BRAND, ACCENT,
  thStyle, trHover, ConfirmationModal
} from '../components/ui';
import axios from 'axios';

const UserList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFilter = searchParams.get('role');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure();
  const [confirmConfig, setConfirmConfig] = useState({ title: '', description: '', onConfirm: () => { }, type: 'danger' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetUserTarget, setResetUserTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleOpenResetCredentials = (user) => {
    setResetUserTarget(user);
    setNewPassword('');
    setShowNewPassword(true);
    setIsCopied(false);
    onResetOpen();
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let pass = 'Zomo@';
    for (let i = 0; i < 4; i++) {
      pass += Math.floor(Math.random() * 10);
    }
    pass += '!';
    setNewPassword(pass);
    setIsCopied(false);
  };

  const handleCopyPassword = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setIsCopied(true);
    toast({ title: 'Password Copied', status: 'info', duration: 2000, isClosable: true });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmitResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast({ title: 'Invalid Password', description: 'Password must be at least 6 characters', status: 'warning' });
      return;
    }

    setIsResettingPassword(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      
      let res;
      try {
        res = await axios.put(`${apiUrl}/admin/users/${resetUserTarget._id}/reset-password`, {
          password: newPassword
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (firstErr) {
        // Fallback to standard user update route if dedicated route doesn't match
        res = await axios.put(`${apiUrl}/admin/users/${resetUserTarget._id}`, {
          password: newPassword
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (res.data?.success) {
        toast({
          title: 'Credentials Updated',
          description: `Password for ${resetUserTarget.name} has been reset successfully.`,
          status: 'success',
          duration: 4000,
          isClosable: true
        });
        onResetClose();
      }
    } catch (err) {
      toast({
        title: 'Reset Failed',
        description: err.response?.data?.message || 'Failed to update credentials',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    } finally {
      setIsResettingPassword(false);
    }
  };
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState('10');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const params = { search: searchTerm, page: currentPage, limit: entriesPerPage };
      if (roleFilter) params.role = roleFilter;
      
      const response = await axios.get(`${apiUrl}/admin/users`, {
        params,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setUsers(response.data.users);
        setTotalUsers(response.data.total || response.data.users.length);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch users', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset page on search or limit change
  }, [searchTerm, entriesPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, currentPage, entriesPerPage, roleFilter]);

  const handleToggleStatus = (id, currentStatus) => {
    const isCurrentlyActive = currentStatus === 'Active';
    setConfirmConfig({
      title: 'Update User Status?',
      description: `Are you sure you want to ${isCurrentlyActive ? 'deactivate' : 'activate'} this system user?`,
      type: 'info',
      onConfirm: async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const token = localStorage.getItem('adminToken');
          const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
          await axios.put(`${apiUrl}/admin/users/${id}`, { status: newStatus }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setUsers(prev => prev.map(u => u._id === id ? { ...u, status: newStatus } : u));
          toast({ title: 'Status Updated', status: 'success', size: 'sm' });
        } catch (error) {
          toast({ title: 'Error', status: 'error' });
        }
        onClose();
      }
    });
    onOpen();
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      title: 'Delete System User?',
      description: 'Are you sure you want to delete this system user? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const token = localStorage.getItem('adminToken');
          await axios.delete(`${apiUrl}/admin/users/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setUsers(prev => prev.filter(u => u._id !== id));
          toast({ title: 'User Deleted', status: 'success' });
        } catch (error) {
          toast({ title: 'Error', status: 'error' });
        }
        onClose();
      }
    });
    onOpen();
  };

  const apiUrl = import.meta.env.VITE_API_URL;
  const apiBase = apiUrl.replace('/api', '');

  return (
    <Box pb="10">
      <PageHeader
        title="User Record List"
        breadcrumb="User Record List"
        actions={[
          <Button key="filter" leftIcon={<Filter size={14} />} size="sm" bg="#4a707e" color="white" borderRadius="md" _hover={{ bg: '#3a5a66' }}>Filter</Button>,
          <Button key="add" as={Link} to="/users/add" leftIcon={<Plus size={14} />} size="sm" bg={BRAND} color="white" borderRadius="md" _hover={{ bg: '#ea580c' }}>Add</Button>,
        ]}
      />
      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center" justify="space-between">
          <HStack>
            <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="1" />
            <Text fontSize="sm" fontWeight="700" color="#1e293b">User Record List</Text>
          </HStack>
          <TableControls 
            search={searchTerm} 
            onSearch={setSearchTerm} 
            searchPlaceholder="Search..." 
            entries={entriesPerPage}
            onEntriesChange={setEntriesPerPage}
          />
        </Flex>

        <Box overflowX="auto">
          {isLoading ? (
            <Flex justify="center" py="10"><Spinner color={BRAND} /></Flex>
          ) : (
            <Table variant="simple" size="sm">
              <Thead bg="#f8faff">
                <Tr>
                  {['Sr.No.', 'Profile Image', 'Role Name', 'Name', 'Status', 'Action'].map(h => (
                    <Th key={h} {...thStyle} borderRight="1px solid #edf2f7" textAlign={h === 'Sr.No.' || h === 'Status' || h === 'Action' ? 'center' : 'left'}>{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user, i) => (
                  <Tr key={user._id} {...trHover}>
                    <Td py="4" border="1px solid #edf2f7" textAlign="center" color="#64748b" fontSize="xs" fontWeight="600">{i + 1}</Td>
                    <Td py="4" border="1px solid #edf2f7" textAlign="center">
                      <Flex justify="center">
                        <Avatar
                          size="md"
                          src={user.profilePic ? `${apiBase}/${user.profilePic}` : ''}
                          name={user.name}
                          border="1px solid #e8edf5"
                        />
                      </Flex>
                    </Td>
                    <Td py="4" border="1px solid #edf2f7">
                      <Text color="#475569" fontSize="xs" fontWeight="600">{user.role?.name || 'N/A'}</Text>
                    </Td>
                    <Td py="4" border="1px solid #edf2f7">
                      <Text color="#475569" fontSize="xs" fontWeight="600">{user.name}</Text>
                    </Td>
                    <Td py="4" border="1px solid #edf2f7" textAlign="center">
                      <Switch
                        isChecked={user.status === 'Active'}
                        onChange={() => handleToggleStatus(user._id, user.status)}
                        sx={{ '.chakra-switch__track[data-checked]': { bg: BRAND } }}
                      />
                    </Td>
                    <Td py="4" border="1px solid #edf2f7" textAlign="center">
                      <HStack spacing="2" justify="center">
                        <Tooltip label="View Details" hasArrow>
                          <IconButton
                            icon={<Eye size={16} />}
                            size="sm"
                            bg="#3b82f6"
                            color="white"
                            borderRadius="md"
                            _hover={{ bg: '#2563eb' }}
                            onClick={() => {
                              setSelectedUser(user);
                              onViewOpen();
                            }}
                            aria-label="view"
                          />
                        </Tooltip>
                        <Tooltip label="Reset Credentials / Password" hasArrow>
                          <IconButton
                            icon={<Key size={16} />}
                            size="sm"
                            bg="#8b5cf6"
                            color="white"
                            borderRadius="md"
                            _hover={{ bg: '#7c3aed' }}
                            onClick={() => handleOpenResetCredentials(user)}
                            aria-label="reset-credentials"
                          />
                        </Tooltip>
                        <Tooltip label="Edit User" hasArrow>
                          <IconButton
                            icon={<Edit3 size={16} />}
                            size="sm"
                            bg="#f97316"
                            color="white"
                            borderRadius="md"
                            _hover={{ bg: '#ea580c' }}
                            onClick={() => navigate(`/users/edit/${user._id}`)}
                            aria-label="edit"
                          />
                        </Tooltip>
                        <Tooltip label="Delete User" hasArrow>
                          <IconButton
                            icon={<Trash2 size={16} />}
                            size="sm"
                            bg="#e11d48"
                            color="white"
                            borderRadius="md"
                            _hover={{ bg: '#be123c' }}
                            onClick={() => handleDelete(user._id)}
                            aria-label="delete"
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {users.length === 0 && <Tr><Td colSpan={6} py="10" textAlign="center" color="#94a3b8">No records found.</Td></Tr>}
              </Tbody>
            </Table>
          )}
        </Box>
        <TableFooter
          showing={`${users.length > 0 ? (currentPage - 1) * parseInt(entriesPerPage) + 1 : 0} to ${(currentPage - 1) * parseInt(entriesPerPage) + users.length}`}
          total={totalUsers}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
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

      {/* View User Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="#1e293b">User Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedUser && (
              <VStack align="stretch" spacing={4}>
                <Flex align="center" gap="4">
                  <Avatar size="xl" src={selectedUser.profilePic ? `${apiBase}/${selectedUser.profilePic}` : ''} name={selectedUser.name} />
                  <Box>
                    <Text fontSize="xl" fontWeight="bold" color="#1e293b">{selectedUser.name}</Text>
                    <Text fontSize="md" color="#64748b">{selectedUser.email}</Text>
                    <Badge mt="1" colorScheme={selectedUser.status === 'Active' ? 'green' : 'red'}>{selectedUser.status}</Badge>
                  </Box>
                </Flex>
                
                <Divider />
                
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="#94a3b8" fontWeight="600">Phone No</Text>
                    <Text fontSize="md" color="#334155">{selectedUser.phone || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="#94a3b8" fontWeight="600">Role</Text>
                    <Text fontSize="md" color="#334155">{selectedUser.role?.name || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="#94a3b8" fontWeight="600">Job Actions</Text>
                    <Text fontSize="md" color="#334155">{selectedUser.jobActions || 'N/A'}</Text>
                  </Box>
                </SimpleGrid>

                <Divider />

                <Box>
                  <Text fontSize="sm" color="#94a3b8" fontWeight="600" mb="2">Access Permissions</Text>
                  <Flex wrap="wrap" gap="2">
                    {selectedUser.role?.permissions && selectedUser.role.permissions.length > 0 ? (
                      selectedUser.role.permissions.map((perm, idx) => (
                        <Badge key={idx} colorScheme="blue" variant="subtle" px="2" py="1" borderRadius="md">
                          {perm}
                        </Badge>
                      ))
                    ) : (
                      <Text fontSize="sm" color="#94a3b8">No permissions assigned.</Text>
                    )}
                  </Flex>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter bg="#f8faff" borderTop="1px solid #edf2f7" py="3">
            <HStack spacing="3" justify="space-between" w="full">
              <Button
                leftIcon={<Key size={15} />}
                size="sm"
                bg="#8b5cf6"
                color="white"
                _hover={{ bg: '#7c3aed' }}
                onClick={() => {
                  onViewClose();
                  handleOpenResetCredentials(selectedUser);
                }}
              >
                Reset Credentials
              </Button>
              <Button size="sm" variant="ghost" onClick={onViewClose}>Close</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Reset User Credentials Modal ── */}
      <Modal isOpen={isResetOpen} onClose={onResetClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" overflow="hidden" boxShadow="2xl">
          <ModalHeader bg="#f8faff" borderBottom="1px solid #edf2f7" py="4">
            <HStack spacing="3">
              <Flex w="36px" h="36px" borderRadius="lg" bg="#8b5cf615" align="center" justify="center">
                <Key size={18} color="#8b5cf6" />
              </Flex>
              <Box>
                <Text fontSize="md" fontWeight="bold" color="#1e293b">Reset User Credentials</Text>
                <Text fontSize="xs" color="#64748b" fontWeight="normal">Set a new login password for this staff user</Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton mt="1" />

          <ModalBody py="5">
            {resetUserTarget && (
              <VStack spacing="4" align="stretch">
                <Box p="3" bg="#f8faff" borderRadius="lg" border="1px solid #e8edf5">
                  <HStack spacing="3">
                    <Avatar size="sm" name={resetUserTarget.name} />
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="#1e293b">{resetUserTarget.name}</Text>
                      <Text fontSize="xs" color="#64748b">{resetUserTarget.email || resetUserTarget.phone}</Text>
                    </Box>
                    <Badge ml="auto" colorScheme="purple">{resetUserTarget.role?.name || 'Staff'}</Badge>
                  </HStack>
                </Box>

                <FormControl isRequired>
                  <Flex justify="space-between" align="center" mb="1.5">
                    <FormLabel mb="0" fontSize="xs" fontWeight="700" color="#475569" textTransform="uppercase" letterSpacing="0.5px">
                      New Password
                    </FormLabel>
                    <Button
                      size="xs"
                      variant="link"
                      color="#8b5cf6"
                      fontWeight="600"
                      leftIcon={<RefreshCw size={12} />}
                      onClick={generateRandomPassword}
                    >
                      Generate Strong Password
                    </Button>
                  </Flex>

                  <InputGroup>
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setIsCopied(false);
                      }}
                      placeholder="Enter minimum 6 characters"
                      h="42px"
                      fontSize="14px"
                      borderRadius="8px"
                      border="1.5px solid #dde6f5"
                      pr="72px"
                      _focus={{ borderColor: '#8b5cf6', boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.2)' }}
                    />
                    <InputRightElement h="42px" w="70px">
                      <HStack spacing="1" pr="2">
                        {newPassword && (
                          <IconButton
                            aria-label="Copy password"
                            icon={isCopied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                            size="xs"
                            variant="ghost"
                            color="#64748b"
                            onClick={handleCopyPassword}
                            title="Copy Password"
                          />
                        )}
                        <IconButton
                          aria-label="Toggle password visibility"
                          icon={showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          size="xs"
                          variant="ghost"
                          color="#64748b"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          title={showNewPassword ? 'Hide Password' : 'See Password'}
                        />
                      </HStack>
                    </InputRightElement>
                  </InputGroup>
                  <Text fontSize="11px" color="#94a3b8" mt="1">
                    Click the eye icon to see or hide the password as you type.
                  </Text>
                </FormControl>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter bg="#f8faff" borderTop="1px solid #edf2f7" py="3">
            <HStack spacing="3" justify="flex-end" w="full">
              <Button size="sm" variant="ghost" onClick={onResetClose} isDisabled={isResettingPassword}>
                Cancel
              </Button>
              <Button
                size="sm"
                bg="#8b5cf6"
                color="white"
                px="6"
                _hover={{ bg: '#7c3aed' }}
                onClick={handleSubmitResetPassword}
                isLoading={isResettingPassword}
                loadingText="Updating..."
              >
                Update Credentials
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <PageFooter />
    </Box>
  );
};

export default UserList;
