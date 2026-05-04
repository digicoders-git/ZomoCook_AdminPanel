import React, { useState, useEffect } from 'react';
import { 
  Box, Flex, Text, HStack, Table, Thead, Tbody, Tr, Th, Td, Switch, 
  IconButton, Tooltip, Spinner, useToast, Button, useDisclosure 
} from '@chakra-ui/react';
import { Edit3, RefreshCcw, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  PageHeader, TableCard, TableControls, TableFooter, PageFooter, BRAND, ACCENT, 
  tableHeadStyle, thStyle, trHover, ConfirmationModal 
} from '../components/ui';
import axios from 'axios';

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [confirmConfig, setConfirmConfig] = useState({ title: '', description: '', onConfirm: () => {}, type: 'danger' });

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/roles`, {
        params: { search: searchTerm },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setRoles(response.data.roles);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch roles', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [searchTerm]);

  const handleToggleStatus = (id, currentStatus) => {
    setConfirmConfig({
      title: 'Update Role Status?',
      description: `Are you sure you want to ${currentStatus === 'active' ? 'deactivate' : 'activate'} this role?`,
      type: 'info',
      onConfirm: async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const token = localStorage.getItem('adminToken');
          const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
          await axios.put(`${apiUrl}/roles/${id}`, { status: newStatus }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setRoles(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
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
      title: 'Delete Role?',
      description: 'Are you sure you want to delete this role? This will permanently remove it from the system.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const token = localStorage.getItem('adminToken');
          await axios.delete(`${apiUrl}/roles/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setRoles(prev => prev.filter(r => r._id !== id));
          toast({ title: 'Role Deleted', status: 'success' });
        } catch (error) {
          toast({ title: 'Error', status: 'error' });
        }
        onClose();
      }
    });
    onOpen();
  };

  return (
    <Box pb="10">
      <PageHeader
        title="Role Record List"
        breadcrumb="Role Record List"
        actions={[
          <Button key="refresh" onClick={fetchRoles} leftIcon={<RefreshCcw size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>Refresh</Button>,
          <Button key="add" as={Link} to="/roles/add" leftIcon={<Plus size={14} />} size="sm" bg={BRAND} color="white" borderRadius="lg" _hover={{ bg: '#003d91' }}>Add Role</Button>,
        ]}
      />
      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center" justify="space-between">
          <HStack>
            <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="1" />
            <Text fontSize="sm" fontWeight="700" color="#1e293b">Role Record List</Text>
          </HStack>
          <TableControls search={searchTerm} onSearch={setSearchTerm} searchPlaceholder="Search roles..." />
        </Flex>
        
        <Box overflowX="auto">
          {isLoading ? (
            <Flex justify="center" py="10"><Spinner color={BRAND} /></Flex>
          ) : (
            <Table variant="simple" size="sm">
              <Thead {...tableHeadStyle}>
                <Tr>
                  <Th {...thStyle}>Sr.No.</Th>
                  <Th {...thStyle}>Role Name</Th>
                  <Th {...thStyle}>Status</Th>
                  <Th {...thStyle}>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {roles.map((role, i) => (
                  <Tr key={role._id} {...trHover}>
                    <Td py="4" color="#64748b" fontSize="xs" fontWeight="600">{i + 1}</Td>
                    <Td py="4" color="#1e293b" fontSize="xs" fontWeight="700">{role.name}</Td>
                    <Td py="4">
                      <Switch 
                        isChecked={role.status === 'active'} 
                        onChange={() => handleToggleStatus(role._id, role.status)}
                        sx={{ '.chakra-switch__track[data-checked]': { bg: BRAND } }} 
                      />
                    </Td>
                    <Td py="4">
                      <HStack spacing="1.5">
                        <Tooltip label="Delete Role">
                          <IconButton 
                            icon={<Trash2 size={13} />} 
                            size="xs" 
                            bg="#fff0f0" 
                            color={ACCENT} 
                            borderRadius="lg" 
                            _hover={{ bg: ACCENT, color: 'white' }} 
                            onClick={() => handleDelete(role._id)}
                            aria-label="delete" 
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {roles.length === 0 && <Tr><Td colSpan={4} py="10" textAlign="center" color="#94a3b8">No roles found.</Td></Tr>}
              </Tbody>
            </Table>
          )}
        </Box>
        <TableFooter showing={`1 to ${roles.length}`} total={roles.length} />
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

export default RoleList;
