import React, { useState, useEffect } from 'react';
import { 
  Box, Flex, Text, HStack, Table, Thead, Tbody, Tr, Th, Td, Switch, 
  IconButton, Image, Tooltip, Spinner, useToast, Button, Badge, useDisclosure 
} from '@chakra-ui/react';
import { Edit3, Trash2, Filter, Plus, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  PageHeader, TableCard, TableControls, TableFooter, PageFooter, BRAND, ACCENT, 
  tableHeadStyle, thStyle, trHover, ConfirmationModal 
} from '../components/ui';
import axios from 'axios';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [confirmConfig, setConfirmConfig] = useState({ title: '', description: '', onConfirm: () => {}, type: 'danger' });

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/notifications`, {
        params: { search: searchTerm },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch notifications', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [searchTerm]);

  const handleToggleStatus = (id, currentStatus) => {
    setConfirmConfig({
      title: 'Update Status?',
      description: `Are you sure you want to ${currentStatus === 'active' ? 'deactivate' : 'activate'} this notification?`,
      type: 'info',
      onConfirm: async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const token = localStorage.getItem('adminToken');
          const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
          await axios.patch(`${apiUrl}/notifications/${id}/status`, { status: newStatus }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: newStatus } : n));
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
      title: 'Delete Notification?',
      description: 'Are you sure you want to delete this notification? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const token = localStorage.getItem('adminToken');
          await axios.delete(`${apiUrl}/notifications/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setNotifications(prev => prev.filter(n => n._id !== id));
          toast({ title: 'Deleted', status: 'success' });
        } catch (error) {
          toast({ title: 'Error', status: 'error' });
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
        title="Notification Record List"
        breadcrumb="Notification Record List"
        actions={[
          <Button key="refresh" onClick={fetchNotifications} leftIcon={<RefreshCcw size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ borderColor: BRAND, color: BRAND }}>Refresh</Button>,
          <Button key="add" as={Link} to="/notifications/add" leftIcon={<Plus size={14} />} size="sm" bg={BRAND} color="white" borderRadius="lg" _hover={{ bg: '#003d91' }}>Add Notification</Button>,
        ]}
      />
      <TableCard>
        <Flex px="5" py="4" borderBottom="1px solid #f1f5f9" align="center" justify="space-between">
          <HStack>
            <Box w="3px" h="18px" bg={BRAND} borderRadius="full" mr="1" />
            <Text fontSize="sm" fontWeight="700" color="#1e293b">Notification Record List</Text>
          </HStack>
          <TableControls search={searchTerm} onSearch={setSearchTerm} searchPlaceholder="Search notifications..." />
        </Flex>
        
        <Box overflowX="auto">
          {isLoading ? (
            <Flex justify="center" py="10"><Spinner color={BRAND} /></Flex>
          ) : (
            <Table variant="simple" size="sm">
              <Thead {...tableHeadStyle}>
                <Tr>
                  <Th {...thStyle}>Sr.No.</Th>
                  <Th {...thStyle}>Image</Th>
                  <Th {...thStyle}>Title & Message</Th>
                  <Th {...thStyle}>Target</Th>
                  <Th {...thStyle}>Created At</Th>
                  <Th {...thStyle}>Status</Th>
                  <Th {...thStyle}>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {notifications.map((n, i) => (
                  <Tr key={n._id} {...trHover}>
                    <Td py="4" color="#64748b" fontSize="xs" fontWeight="600">{i + 1}</Td>
                    <Td py="4">
                      <Box w="45px" h="45px" borderRadius="lg" overflow="hidden" border="1px solid #e8edf5" bg="#f8faff">
                        {n.image ? (
                          <Image src={`${apiUrl}/${n.image}`} alt={n.title} w="full" h="full" objectFit="cover" />
                        ) : (
                          <Flex w="full" h="full" align="center" justify="center" bg="#f1f5f9"><Plus size={14} color="#94a3b8" /></Flex>
                        )}
                      </Box>
                    </Td>
                    <Td py="4">
                      <Box maxW="300px">
                        <Text color="#1e293b" fontSize="xs" fontWeight="700" noOfLines={1}>{n.title}</Text>
                        <Text color="#64748b" fontSize="10px" noOfLines={1}>{n.message}</Text>
                      </Box>
                    </Td>
                    <Td py="4">
                      <Badge size="sm" variant="subtle" colorScheme={n.target === 'all' ? 'blue' : n.target === 'candidates' ? 'orange' : 'green'} fontSize="10px" px="2" borderRadius="full">
                        {n.target}
                      </Badge>
                    </Td>
                    <Td py="4" color="#64748b" fontSize="xs">{new Date(n.createdAt).toLocaleDateString()}</Td>
                    <Td py="4">
                      <Switch 
                        isChecked={n.status === 'active'} 
                        onChange={() => handleToggleStatus(n._id, n.status)}
                        sx={{ '.chakra-switch__track[data-checked]': { bg: BRAND } }} 
                      />
                    </Td>
                    <Td py="4">
                      <HStack spacing="2">
                        <Tooltip label="Delete">
                          <IconButton 
                            icon={<Trash2 size={14} />} 
                            size="xs" 
                            bg="#fff0f0" 
                            color={ACCENT} 
                            borderRadius="lg" 
                            _hover={{ bg: ACCENT, color: 'white' }} 
                            onClick={() => handleDelete(n._id)}
                            aria-label="delete" 
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {notifications.length === 0 && <Tr><Td colSpan={7} py="10" textAlign="center" color="#94a3b8">No notifications found.</Td></Tr>}
              </Tbody>
            </Table>
          )}
        </Box>
        <TableFooter showing={`1 to ${notifications.length}`} total={notifications.length} />
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

export default NotificationList;
