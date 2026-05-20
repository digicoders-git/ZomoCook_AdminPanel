import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, HStack, Table, Thead, Tbody, Tr, Th, Td, Switch,
  IconButton, Tooltip, Spinner, useToast, Button, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, SimpleGrid, Checkbox, Icon, VStack
} from '@chakra-ui/react';
import { Edit3, RefreshCcw, Trash2, Plus, ShieldCheck, Save, Layers, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PageHeader, TableCard, TableControls, TableFooter, PageFooter, BRAND, ACCENT,
  tableHeadStyle, thStyle, trHover, ConfirmationModal
} from '../components/ui';
import axios from 'axios';

const PERMISSION_MODULES = [
  { name: 'Dashboard', permissions: [] },
  { name: 'States', permissions: ['Add State', 'State List'] },
  { name: 'Roles', permissions: ['Add Role', 'Role List'] },
  { name: 'Permissions', permissions: ['Add Permission', 'Permission List'] },
  { name: 'Users', permissions: ['Add User', 'User List'] },
  { name: 'Cities', permissions: ['Add City', 'City List'] },
  { name: 'Facility', permissions: ['Add Facility', 'Facility List'] },
  { name: 'Property Category', permissions: ['Add Property Category', 'Property Category List'] },
  { name: 'Customer/Client', permissions: ['Add Customer/Client', 'Customer/Client List'] },
  { name: 'Position', permissions: ['Add Position', 'Position List'] },
  { name: 'Salary Range', permissions: ['Add Salary Range', 'Salary Range List'] },
  { name: 'Experience Range', permissions: ['Add Experience Range', 'Experience Range List'] },
  { name: 'Profile', permissions: [] },
  { name: 'Web Settings', permissions: [] },
  { name: 'Cooking Preference', permissions: ['Add Cooking Preference', 'Cooking Preference List'] },
  { name: 'Job Type', permissions: ['Add Job Type', 'Job Type List'] },
  { name: 'Event', permissions: ['Add Event', 'Event List'] },
  { name: 'Cooking Category', permissions: ['Add Cooking Category', 'Cooking Category List'] },
  { name: 'Time Range', permissions: ['Add Time Range', 'Time Range List'] },
  { name: 'Logout', permissions: [] },
  { name: 'Outlet Status', permissions: ['Add Outlet Status', 'Outlet Status List'] },
  { name: 'Jobs', permissions: ['Add Job', 'Job List'] },
  { name: 'Benefits', permissions: ['Add Benefit', 'Benefit List'] },
  { name: 'Outlets', permissions: ['Add Outlet', 'Outlet List'] },
  { name: 'Notifications', permissions: ['Add Notification', 'Notification List'] },
  { name: 'Candidates', permissions: ['Add Candidate', 'Candidate List', 'Shortlisted Candidate List', 'Applied Candidates List'] },
  { name: 'CMS', permissions: ['Add CMS', 'CMS List'] },
  { name: 'Sliders', permissions: ['Add Slider', 'Slider List'] },
  { name: 'Videos', permissions: ['Add Video', 'Video List'] },
  { name: 'Menu Item', permissions: ['Add Menu Item', 'Menu Item List'] },
  { name: 'Skill Category', permissions: ['Add Skill Category', 'Skill Category List'] },
  { name: 'Skill', permissions: ['Add Skill', 'Skill List'] },
  { name: 'Query History', permissions: [] },
];

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  // Confirm modal
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const [confirmConfig, setConfirmConfig] = useState({ title: '', description: '', onConfirm: () => {}, type: 'danger' });

  // Permission modal
  const { isOpen: isPermOpen, onOpen: onPermOpen, onClose: onPermClose } = useDisclosure();
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // View modal
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const [viewRole, setViewRole] = useState(null);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/roles`, {
        params: { search: searchTerm },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) setRoles(response.data.roles);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch roles', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, [searchTerm]);

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
        onConfirmClose();
      }
    });
    onConfirmOpen();
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
        onConfirmClose();
      }
    });
    onConfirmOpen();
  };

  const handleViewPermissions = (role) => {
    setViewRole(role);
    onViewOpen();
  };

  // Open permission modal for a role
  const handleOpenPermissions = async (role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions || []);
    onPermOpen();
  };

  const handlePermissionToggle = (perm) => {
    setSelectedPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleModuleToggle = (module) => {
    const modulePerms = [module.name, ...module.permissions];
    const allSelected = modulePerms.every(p => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(p => !modulePerms.includes(p)));
    } else {
      setSelectedPermissions(prev => {
        const newPerms = [...prev];
        modulePerms.forEach(p => { if (!newPerms.includes(p)) newPerms.push(p); });
        return newPerms;
      });
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allPerms = [];
      PERMISSION_MODULES.forEach(m => {
        allPerms.push(m.name);
        m.permissions.forEach(p => allPerms.push(p));
      });
      setSelectedPermissions(allPerms);
    } else {
      setSelectedPermissions([]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setIsSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      await axios.put(`${apiUrl}/roles/${selectedRole._id}`, {
        permissions: selectedPermissions
      }, { headers: { 'Authorization': `Bearer ${token}` } });

      setRoles(prev => prev.map(r => r._id === selectedRole._id ? { ...r, permissions: selectedPermissions } : r));
      toast({ title: 'Permissions saved successfully', status: 'success' });
      onPermClose();
    } catch (error) {
      toast({ title: 'Error saving permissions', status: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const isAllSelected = selectedPermissions.length > 0 &&
    PERMISSION_MODULES.every(m => [m.name, ...m.permissions].every(p => selectedPermissions.includes(p)));

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
                  <Th {...thStyle}>Permissions</Th>
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
                      <Text fontSize="xs" color="#64748b">
                        {role.permissions?.length > 0 ? `${role.permissions.length} permissions` : 'No permissions'}
                      </Text>
                    </Td>
                    <Td py="4">
                      <Switch
                        isChecked={role.status === 'active'}
                        onChange={() => handleToggleStatus(role._id, role.status)}
                        sx={{ '.chakra-switch__track[data-checked]': { bg: BRAND } }}
                      />
                    </Td>
                    <Td py="4">
                      <HStack spacing="1.5">
                        <Tooltip label="View Permissions">
                          <IconButton
                            icon={<Eye size={13} />}
                            size="xs"
                            bg="#f0fff4"
                            color="#16a34a"
                            borderRadius="lg"
                            _hover={{ bg: '#16a34a', color: 'white' }}
                            onClick={() => handleViewPermissions(role)}
                            aria-label="view permissions"
                          />
                        </Tooltip>
                        <Tooltip label="Assign Permissions">
                          <IconButton
                            icon={<ShieldCheck size={13} />}
                            size="xs"
                            bg="#f0f7ff"
                            color={BRAND}
                            borderRadius="lg"
                            _hover={{ bg: BRAND, color: 'white' }}
                            onClick={() => handleOpenPermissions(role)}
                            aria-label="assign permissions"
                          />
                        </Tooltip>
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
                {roles.length === 0 && <Tr><Td colSpan={5} py="10" textAlign="center" color="#94a3b8">No roles found.</Td></Tr>}
              </Tbody>
            </Table>
          )}
        </Box>
        <TableFooter showing={`1 to ${roles.length}`} total={roles.length} />
      </TableCard>

      {/* View Permissions Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" border="1px solid #e8edf5">
          <ModalHeader borderBottom="1px solid #f1f5f9" py="4" px="6">
            <HStack spacing="3">
              <Box w="32px" h="32px" bg="#f0fff4" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                <Eye size={16} color="#16a34a" />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="800" color="#1e293b">View Permissions</Text>
                <Text fontSize="xs" color="#64748b" fontWeight="500">Role: {viewRole?.name} &nbsp;•&nbsp; {viewRole?.permissions?.length || 0} total permissions</Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top="4" right="4" />
          <ModalBody py="5" px="6">
            {viewRole?.permissions?.length === 0 ? (
              <Flex direction="column" align="center" py="10" color="#94a3b8">
                <XCircle size={32} />
                <Text mt="2" fontSize="sm">No permissions assigned to this role.</Text>
              </Flex>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="3">
                {PERMISSION_MODULES.map((module, idx) => {
                  const allModulePerms = [module.name, ...module.permissions];
                  const grantedPerms = allModulePerms.filter(p => viewRole?.permissions?.includes(p));
                  if (grantedPerms.length === 0) return null;
                  return (
                    <Box key={idx} p="3" border="1px solid #dcfce7" borderRadius="lg" bg="#f0fff4">
                      <HStack mb="2" spacing="1.5">
                        <Icon as={Layers} color="#16a34a" boxSize={3.5} />
                        <Text fontSize="xs" fontWeight="700" color="#15803d">{module.name}</Text>
                      </HStack>
                      <VStack align="start" spacing="1">
                        {grantedPerms.map((perm, pIdx) => (
                          <HStack key={pIdx} spacing="1.5">
                            <CheckCircle2 size={11} color="#16a34a" />
                            <Text fontSize="xs" color="#374151">{perm}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid #f1f5f9" py="3" px="6">
            <Button size="sm" bg={BRAND} color="white" borderRadius="lg" px="6" _hover={{ bg: '#003d91' }} onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Assign Permissions Modal */}
      <Modal isOpen={isPermOpen} onClose={onPermClose} size="5xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" border="1px solid #e8edf5">
          <ModalHeader borderBottom="1px solid #f1f5f9" py="4" px="6">
            <HStack spacing="3">
              <Box w="32px" h="32px" bg="#f0f7ff" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                <ShieldCheck size={16} color={BRAND} />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="800" color="#1e293b">Assign Permissions</Text>
                <Text fontSize="xs" color="#64748b" fontWeight="500">Role: {selectedRole?.name}</Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top="4" right="4" />

          <ModalBody py="5" px="6">
            {/* Select All */}
            <Flex mb="5" align="center" p="3" bg="#f8faff" borderRadius="lg" border="1px solid #e8edf5">
              <Checkbox
                size="sm"
                colorScheme="orange"
                isChecked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <Text ml="3" fontSize="sm" fontWeight="700" color="#1e293b">Select All Permissions</Text>
              <Text ml="auto" fontSize="xs" color="#64748b">{selectedPermissions.length} selected</Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="3">
              {PERMISSION_MODULES.map((module, idx) => {
                const modulePerms = [module.name, ...module.permissions];
                const isModuleSelected = modulePerms.every(p => selectedPermissions.includes(p));
                const isAnySelected = modulePerms.some(p => selectedPermissions.includes(p));

                return (
                  <Box
                    key={idx}
                    p="3"
                    border="1px solid"
                    borderColor={isAnySelected ? '#dde6f5' : '#f1f5f9'}
                    borderRadius="lg"
                    bg={isAnySelected ? '#f8faff' : '#ffffff'}
                    transition="all 0.2s"
                  >
                    <Flex align="center" mb={module.permissions.length > 0 ? "2" : "0"}>
                      <Checkbox
                        size="sm"
                        colorScheme="orange"
                        isChecked={isModuleSelected}
                        isIndeterminate={isAnySelected && !isModuleSelected}
                        onChange={() => handleModuleToggle(module)}
                      />
                      <HStack ml="2" spacing="1.5">
                        <Icon as={Layers} color="#f97316" boxSize={3} />
                        <Text fontSize="xs" fontWeight="700" color="#1e293b">{module.name}</Text>
                      </HStack>
                    </Flex>

                    {module.permissions.length > 0 && (
                      <VStack align="start" pl="6" spacing="1.5">
                        {module.permissions.map((perm, pIdx) => (
                          <Flex key={pIdx} align="center">
                            <Checkbox
                              size="sm"
                              colorScheme="orange"
                              isChecked={selectedPermissions.includes(perm)}
                              onChange={() => handlePermissionToggle(perm)}
                            />
                            <Text ml="2" fontSize="xs" color="#64748b">{perm}</Text>
                          </Flex>
                        ))}
                      </VStack>
                    )}
                  </Box>
                );
              })}
            </SimpleGrid>
          </ModalBody>

          <ModalFooter borderTop="1px solid #f1f5f9" py="4" px="6">
            <HStack spacing="3">
              <Button size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" onClick={onPermClose}>Cancel</Button>
              <Button
                size="sm"
                bg={BRAND}
                color="white"
                borderRadius="lg"
                px="6"
                leftIcon={<Save size={13} />}
                isLoading={isSaving}
                _hover={{ bg: '#003d91' }}
                onClick={handleSavePermissions}
              >
                Save Permissions
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={onConfirmClose}
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
