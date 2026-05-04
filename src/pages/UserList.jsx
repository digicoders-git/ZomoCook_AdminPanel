import { useState, useEffect } from 'react';
import { 
  Box, Flex, Text, HStack, Table, Thead, Tbody, Tr, Th, Td, Switch, 
  IconButton, Avatar, Spinner, useToast, Button, useDisclosure, Icon 
} from '@chakra-ui/react';
import { Edit3, Trash2, Filter, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PageHeader, TableCard, TableControls, TableFooter, PageFooter, BRAND, ACCENT, 
  thStyle, trHover, ConfirmationModal 
} from '../components/ui';
import axios from 'axios';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [confirmConfig, setConfirmConfig] = useState({ title: '', description: '', onConfirm: () => {}, type: 'danger' });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/admin/users`, {
        params: { search: searchTerm },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch users', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

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
          <Button key="permissions" as={Link} to="/roles/permissions" leftIcon={<Icon as={Plus} boxSize={3} />} variant="outline" borderColor="#dde6f5" color="#1e293b" borderRadius="md" size="sm" _hover={{ bg: '#f8faff' }}>Assign Permissions</Button>,
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
          <TableControls search={searchTerm} onSearch={setSearchTerm} searchPlaceholder="Search..." />
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
          showing={`${users.length > 0 ? 1 : 0} to ${users.length}`} 
          total={users.length} 
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

      <PageFooter />
    </Box>
  );
};

export default UserList;
