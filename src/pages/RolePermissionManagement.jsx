import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Button, Input, InputGroup, InputLeftElement,
  VStack, HStack, Badge, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  IconButton, Spinner, useToast, Checkbox, Icon, Divider, Tab, TabList, Tabs, TabPanels, TabPanel,
  Menu, MenuButton, MenuList, MenuItem
} from '@chakra-ui/react';
import { Search, Plus, MoreVertical, Copy, Edit, Check, X, Minus, Users } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { useNavigate } from 'react-router-dom';

const modules = [
  { id: 'dashboard', name: 'Dashboard', desc: 'View dashboard and analytics' },
  { id: 'customer_client', name: 'Customer / Client', desc: 'Manage customers and inquiries' },
  { id: 'job_management', name: 'Job Management', desc: 'Create and manage job posts' },
  { id: 'candidates', name: 'Candidates', desc: 'View and manage candidates' },
  { id: 'hiring_processing_fee', name: 'Hiring Processing Fee', desc: 'Manage hiring processing fee' },
  { id: 'service_packages', name: 'Service Packages', desc: 'Manage service packages' },
  { id: 'offer_management', name: 'Offer Management', desc: 'Create and manage offers' },
  { id: 'banner_management', name: 'Banner Management', desc: 'Manage banners and promotions' },
  { id: 'cook_approvals', name: 'Cook Approvals', desc: 'Approve / reject cook profiles' },
  { id: 'query_management', name: 'Query Management', desc: 'Manage customer queries' },
  { id: 'reports_analytics', name: 'Reports & Analytics', desc: 'View reports and analytics' },
  { id: 'finance_revenue', name: 'Finance / Revenue', desc: 'Manage revenue and transactions' },
  { id: 'role_permission', name: 'Role & Permission', desc: 'Manage roles and permissions' },
  { id: 'settings', name: 'Settings', desc: 'System settings and configuration' },
  { id: 'masters', name: 'Master Data', desc: 'Manage all system master data' },
  { id: 'notifications', name: 'Notifications', desc: 'Manage push notifications' },
];

const actions = [
  { id: 'view', name: 'VIEW' },
  { id: 'add', name: 'ADD' },
  { id: 'edit', name: 'EDIT' },
  { id: 'delete', name: 'DELETE' },
  { id: 'approve', name: 'APPROVE' },
  { id: 'export', name: 'EXPORT' },
  { id: 'manage', name: 'MANAGE' }
];

export default function RolePermissionManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchRole, setSearchRole] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [localPermissions, setLocalPermissions] = useState([]);
  
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setRoles(response.data.roles);
        if (response.data.roles.length > 0 && !selectedRole) {
          handleSelectRole(response.data.roles[0]);
        } else if (selectedRole) {
           const updated = response.data.roles.find(r => r._id === selectedRole._id);
           if(updated) handleSelectRole(updated);
        }
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to fetch roles', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setLocalPermissions(role.permissions || []);
    setIsEditing(false);
  };

  const togglePermission = (moduleId, actionId) => {
    if (!isEditing) return;
    const permString = `${moduleId}:${actionId}`;
    if (localPermissions.includes(permString)) {
      setLocalPermissions(localPermissions.filter(p => p !== permString));
    } else {
      setLocalPermissions([...localPermissions, permString]);
    }
  };

  const hasPermission = (moduleId, actionId) => {
    return localPermissions.includes(`${moduleId}:${actionId}`);
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`${API_BASE_URL}/roles/${selectedRole._id}`, 
        { permissions: localPermissions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast({ title: 'Permissions updated!', status: 'success', duration: 2000 });
        setIsEditing(false);
        fetchRoles(); 
      }
    } catch (error) {
       console.error(error);
       toast({ title: 'Failed to update permissions', status: 'error', duration: 3000 });
    }
  };

  const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(searchRole.toLowerCase()));

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="6">
        <Box>
          <Text fontSize="2xl" fontWeight="800" color="#1e293b">Role & Permission Management</Text>
          <Text fontSize="sm" color="#64748b" mt="1" fontWeight="500">Create user roles and manage permissions for different modules in the system.</Text>
        </Box>
        <Flex gap="3">
          <Button variant="outline" color="#004aad" borderColor="#004aad" leftIcon={<Icon as={Plus} size={16} />}>
            Add Role
          </Button>
          <Button bg="#004aad" color="white" _hover={{ bg: '#003a8c' }}>
            Assign Role to User
          </Button>
        </Flex>
      </Flex>

      <Flex gap="6" direction={{ base: 'column', lg: 'row' }} align="start">
        {/* Left Panel: Roles List */}
        <Box w={{ base: 'full', lg: '300px' }} flexShrink="0" bg="white" borderRadius="xl" border="1px solid #e2e8f0" p="4">
          <Text fontSize="md" fontWeight="700" color="#1e293b" mb="4">Roles</Text>
          <Flex gap="2" mb="4">
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none"><Icon as={Search} color="gray.400" size={14} /></InputLeftElement>
              <Input placeholder="Search role..." value={searchRole} onChange={(e) => setSearchRole(e.target.value)} borderRadius="md" />
            </InputGroup>
            <Button size="sm" bg="#004aad" color="white" _hover={{ bg: '#003a8c' }} px="4" borderRadius="md" minW="100px">
              + New Role
            </Button>
          </Flex>

          <VStack spacing="3" align="stretch" maxH="600px" overflowY="auto" css={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px' } }}>
            {loading ? <Spinner mx="auto" my="4" color="#004aad" /> : filteredRoles.map((role) => {
              const isSelected = selectedRole?._id === role._id;
              return (
                <Flex 
                  key={role._id} 
                  p="3" 
                  borderRadius="lg" 
                  border="1px solid" 
                  borderColor={isSelected ? '#004aad' : '#e2e8f0'}
                  bg={isSelected ? '#eff6ff' : 'white'}
                  cursor="pointer"
                  onClick={() => handleSelectRole(role)}
                  _hover={{ borderColor: '#004aad', bg: '#eff6ff' }}
                  justify="space-between"
                  align="center"
                  transition="all 0.2s"
                >
                  <Box>
                    <Flex align="center" gap="2">
                      <Text fontSize="sm" fontWeight="700" color={isSelected ? '#004aad' : '#1e293b'}>{role.name}</Text>
                      {role.name === 'Super Admin' && <Text fontSize="sm">👑</Text>}
                    </Flex>
                    <Text fontSize="xs" fontWeight="500" color="#64748b" mt="1">{role.userCount || 0} User{role.userCount !== 1 ? 's' : ''}</Text>
                  </Box>
                  <Flex align="center" gap="2">
                    <Badge 
                      bg={role.name === 'Super Admin' ? '#ecfdf5' : role.status === 'active' ? '#ecfdf5' : '#f1f5f9'} 
                      color={role.name === 'Super Admin' ? '#10b981' : role.status === 'active' ? '#10b981' : '#64748b'} 
                      textTransform="none" fontSize="10px" px="2" py="0.5" borderRadius="md"
                    >
                      {role.name === 'Super Admin' ? 'System Role' : role.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        size="xs"
                        variant="ghost"
                        icon={<Icon as={MoreVertical} size={14} />}
                        aria-label="options"
                        color="#94a3b8"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <MenuList minW="150px" boxShadow="lg" border="1px solid #e2e8f0" zIndex="10">
                        <MenuItem 
                          fontSize="sm" 
                          icon={<Icon as={Users} size={14} />} 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleSelectRole(role); 
                          }}
                        >
                          View Details
                        </MenuItem>
                        <MenuItem 
                          fontSize="sm" 
                          icon={<Icon as={Edit} size={14} />} 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleSelectRole(role);
                            setIsEditing(true);
                          }}
                        >
                          Edit Role
                        </MenuItem>
                        <MenuItem 
                          fontSize="sm" 
                          color="red.500"
                          icon={<Icon as={X} size={14} />} 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            toast({ title: 'Delete Role functionality not yet implemented.', status: 'info', duration: 2000 });
                          }}
                        >
                          Delete Role
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>
                </Flex>
              );
            })}
          </VStack>
          <Text fontSize="xs" color="#94a3b8" fontWeight="500" mt="4">Showing {filteredRoles.length} of {roles.length} roles</Text>
        </Box>

        {/* Right Panel: Permissions Matrix */}
        <Box flex="1" bg="white" borderRadius="xl" border="1px solid #e2e8f0" overflow="hidden" w="full">
          {selectedRole ? (
            <>
              <Flex justify="space-between" align="center" p="5" borderBottom="1px solid #e2e8f0">
                <Flex align="center" gap="3">
                  <Text fontSize="md" fontWeight="700" color="#1e293b">Permissions for: {selectedRole.name}</Text>
                  {selectedRole.name === 'Super Admin' && <Badge bg="#ecfdf5" color="#10b981" textTransform="none" fontSize="10px" px="2" py="1" borderRadius="md">System Role</Badge>}
                </Flex>
                <Flex gap="3">
                  <Button size="sm" variant="outline" leftIcon={<Icon as={Copy} size={14} />} borderRadius="md">
                    Copy Permissions
                  </Button>
                  {isEditing ? (
                    <Button size="sm" bg="#10b981" color="white" _hover={{ bg: '#059669' }} onClick={savePermissions} borderRadius="md" leftIcon={<Icon as={Check} size={14} />}>
                      Save Permissions
                    </Button>
                  ) : (
                    <Button size="sm" bg="#004aad" color="white" _hover={{ bg: '#003a8c' }} onClick={() => setIsEditing(true)} borderRadius="md" leftIcon={<Icon as={Edit} size={14} />}>
                      Edit Permissions
                    </Button>
                  )}
                </Flex>
              </Flex>
              
              <Tabs colorScheme="blue" size="sm">
                <TabList px="5" pt="2" borderBottom="1px solid #e2e8f0">
                  <Tab fontWeight="600" color="#475569" _selected={{ color: '#004aad', borderColor: '#004aad', borderBottomWidth: '2px' }}>Module Permissions</Tab>
                  <Tab fontWeight="600" color="#475569" _selected={{ color: '#004aad', borderColor: '#004aad', borderBottomWidth: '2px' }}>Global Permissions</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel p={0}>
                    <TableContainer>
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th py="4" fontSize="10px" fontWeight="800" color="#64748b" borderColor="#f1f5f9">MODULE</Th>
                      {actions.map(act => (
                        <Th key={act.id} textAlign="center" fontSize="10px" fontWeight="800" color="#64748b" borderColor="#f1f5f9">{act.name}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {modules.map((mod) => (
                      <Tr key={mod.id} _hover={{ bg: '#f8fafc' }}>
                        <Td py="3" borderColor="#f1f5f9">
                          <Flex align="center" gap="3">
                            <Flex align="center" justify="center" w="8" h="8" borderRadius="md" bg="#eff6ff" color="#004aad">
                              <Icon as={Search} size={14} />
                            </Flex>
                            <Box>
                              <Text fontSize="13px" fontWeight="700" color="#1e293b">{mod.name}</Text>
                              <Text fontSize="11px" color="#94a3b8" fontWeight="500">{mod.desc}</Text>
                            </Box>
                          </Flex>
                        </Td>
                        {actions.map(act => {
                           const hasPerm = hasPermission(mod.id, act.id);
                           return (
                            <Td key={act.id} textAlign="center" borderColor="#f1f5f9">
                                {isEditing ? (
                                    <Checkbox 
                                      colorScheme="green" 
                                      isChecked={hasPerm} 
                                      onChange={() => togglePermission(mod.id, act.id)}
                                      size="lg"
                                    />
                                ) : (
                                    hasPerm ? (
                                        <Flex align="center" justify="center" w="6" h="6" borderRadius="md" bg="#ecfdf5" color="#10b981" mx="auto">
                                            <Icon as={Check} boxSize={4} />
                                        </Flex>
                                    ) : (
                                        <Flex align="center" justify="center" w="6" h="6" borderRadius="md" bg="#fef2f2" color="#ef4444" mx="auto">
                                            <Icon as={X} boxSize={4} />
                                        </Flex>
                                    )
                                )}
                            </Td>
                           );
                        })}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              <Flex justify="center" gap="6" p="4" borderTop="1px solid #e2e8f0" bg="#f8fafc">
                <Flex align="center" gap="2"><Flex align="center" justify="center" w="5" h="5" borderRadius="sm" bg="#ecfdf5" color="#10b981"><Icon as={Check} boxSize={3} /></Flex><Text fontSize="xs" fontWeight="600" color="#475569">Allowed</Text></Flex>
                <Flex align="center" gap="2"><Flex align="center" justify="center" w="5" h="5" borderRadius="sm" bg="#fef2f2" color="#ef4444"><Icon as={X} boxSize={3} /></Flex><Text fontSize="xs" fontWeight="600" color="#475569">Denied</Text></Flex>
                <Flex align="center" gap="2"><Flex align="center" justify="center" w="5" h="5" borderRadius="sm" bg="#f1f5f9" color="#94a3b8"><Icon as={Minus} boxSize={3} /></Flex><Text fontSize="xs" fontWeight="600" color="#475569">Not Applicable</Text></Flex>
                <Text fontSize="xs" color="#94a3b8" ml="auto">ⓘ Changes will be saved automatically</Text>
              </Flex>
                  </TabPanel>

                  <TabPanel p={5}>
                    <Flex direction="column" gap="4">
                      <Flex p="4" border="1px solid #e2e8f0" borderRadius="md" justify="space-between" align="center">
                        <Box>
                          <Text fontSize="sm" fontWeight="700" color="#1e293b">Full System Access</Text>
                          <Text fontSize="xs" color="#64748b">Grants full control over all modules and features.</Text>
                        </Box>
                        {isEditing ? (
                          <Checkbox colorScheme="green" size="lg" isChecked={hasPermission('global', 'full_access')} onChange={() => togglePermission('global', 'full_access')} />
                        ) : (
                          hasPermission('global', 'full_access') ? 
                            <Badge colorScheme="green">Enabled</Badge> : <Badge colorScheme="red">Disabled</Badge>
                        )}
                      </Flex>
                      <Flex p="4" border="1px solid #e2e8f0" borderRadius="md" justify="space-between" align="center">
                        <Box>
                          <Text fontSize="sm" fontWeight="700" color="#1e293b">Export All Data</Text>
                          <Text fontSize="xs" color="#64748b">Allow exporting data across all modules regardless of individual settings.</Text>
                        </Box>
                        {isEditing ? (
                          <Checkbox colorScheme="green" size="lg" isChecked={hasPermission('global', 'export_all')} onChange={() => togglePermission('global', 'export_all')} />
                        ) : (
                          hasPermission('global', 'export_all') ? 
                            <Badge colorScheme="green">Enabled</Badge> : <Badge colorScheme="red">Disabled</Badge>
                        )}
                      </Flex>
                    </Flex>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </>
          ) : (
            <Flex justify="center" align="center" h="full" minH="400px">
              <Text color="#94a3b8" fontWeight="500">Select a role to view permissions</Text>
            </Flex>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
