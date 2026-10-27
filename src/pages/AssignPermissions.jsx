import React, { useState, useEffect } from 'react';
import { 
  Box, Flex, Text, Checkbox, SimpleGrid, Select, Button, useToast, 
  HStack, Spinner, Divider, Switch, Icon, IconButton
} from '@chakra-ui/react';
import { Save, X, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, FormCard, PageFooter, BRAND, ACCENT, selectStyle, Loading } from '../components/ui';
import axios from 'axios';

const PERMISSION_MODULES = [
  { name: 'Dashboard', permissions: ['Dashboard Analytics', 'Live Activity'] },
  { 
    name: 'Quick Bookings & Events', 
    permissions: [
      'Booking Dashboard', 
      'Bookings List', 
      'Daily Basis Jobs', 
      'Chef for Party', 
      'Staff Assignments', 
      'Live / Ongoing Bookings', 
      'Completed Bookings', 
      'Cancelled & Refunds', 
      'Booking Reviews', 
      'Booking Reports'
    ] 
  },
  { 
    name: 'Party Menu Catalog', 
    permissions: ['Add Menu Item', 'Menu Item List'] 
  },
  { 
    name: 'Jobs', 
    permissions: ['Add Job', 'Job List', 'Pending Jobs', 'Replacements'] 
  },
  { 
    name: 'Candidates', 
    permissions: [
      'Add Candidate', 
      'Candidate List', 
      'All Applications', 
      'Applied Candidates', 
      'Shortlisted Candidates', 
      'Demo Scheduled', 
      'Reschedule Requests', 
      'Hired Candidates', 
      'Rejected Candidates', 
      'On Hold Candidates', 
      'Not Interested'
    ] 
  },
  { 
    name: 'Cook Approvals', 
    permissions: ['Pending Approvals', 'Document Verification'] 
  },
  { 
    name: 'Customer/Client', 
    permissions: ['Add Customer/Client', 'Customer/Client List'] 
  },
  { 
    name: 'Subscription Plans', 
    permissions: [
      'Platform Fees Settings', 
      'Daily Basis Charges', 
      'Hiring & Support Packages', 
      'Subscription Plans List', 
      'Add Subscription Plan', 
      'Subscription History'
    ] 
  },
  { 
    name: 'Finance / Revenue', 
    permissions: ['Transaction History', 'Revenue Overview', 'Payouts'] 
  },
  { 
    name: 'Offers', 
    permissions: ['Add Offer', 'Offer List'] 
  },
  { 
    name: 'Banners', 
    permissions: ['Add Banner', 'Banner List'] 
  },
  { 
    name: 'Notifications', 
    permissions: ['Add Notification', 'Notification List'] 
  },
  { 
    name: 'Query History', 
    permissions: ['Query History', 'Contact Enquiries'] 
  },
  { 
    name: 'Roles & Permissions', 
    permissions: ['Add Role', 'Role List', 'Manage Roles', 'Add User', 'User List', 'Assign Permissions'] 
  },
  { 
    name: 'Masters', 
    permissions: [
      'Job Menu Items',
      'Job Categories',
      'Skill Categories',
      'Skills',
      'Job Types',
      'Job Positions',
      'Experience Ranges',
      'Salary Ranges',
      'Time Ranges',
      'Joining Types',
      'Leaves / Month',
      'Cooking Categories',
      'Events',
      'Family Members',
      'Cooking Preferences',
      'Cook Preferences',
      'Food Preferences',
      'Gender Preferences',
      'Service Durations',
      'Facilities',
      'Benefits',
      'Property Categories',
      'Sliders',
      'Videos',
      'CMS',
      'States',
      'Cities'
    ] 
  },
  { 
    name: 'Web Settings', 
    permissions: ['General Settings', 'Contact Information', 'CMS Settings'] 
  },
];

const AssignPermissions = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setRoles(response.data.roles);
      }
    } catch (error) {
      toast({ title: 'Error fetching roles', status: 'error' });
    } finally {
      setIsFetching(false);
    }
  };

  const fetchRolePermissions = async (roleId) => {
    if (!roleId) {
      setSelectedPermissions([]);
      return;
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/roles/${roleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setSelectedPermissions(response.data.role.permissions || []);
      }
    } catch (error) {
      toast({ title: 'Error fetching permissions', status: 'error' });
    }
  };

  const handleRoleChange = (e) => {
    const roleId = e.target.value;
    setSelectedRole(roleId);
    fetchRolePermissions(roleId);
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
        modulePerms.forEach(p => {
          if (!newPerms.includes(p)) newPerms.push(p);
        });
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

  const handleSave = async () => {
    if (!selectedRole) return toast({ title: 'Please select a role', status: 'warning' });
    
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`${apiUrl}/roles/${selectedRole}`, {
        permissions: selectedPermissions
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast({ title: 'Permissions assigned successfully', status: 'success' });
      }
    } catch (error) {
      toast({ title: 'Error saving permissions', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <Loading message="Loading permissions..." />;

  const isAllSelected = selectedPermissions.length > 0 && 
    PERMISSION_MODULES.every(m => [m.name, ...m.permissions].every(p => selectedPermissions.includes(p)));

  return (
    <Box pb="10">
      <PageHeader 
        title="Assign Permissions" 
        breadcrumb="Assign Permissions" 
      />
      
      <FormCard headerTitle="Assign Permissions">
        <Box mb="6">
          <Text fontSize="sm" fontWeight="700" color="#1e293b" mb="2">Select Role</Text>
          <Select 
            placeholder="-- Select Role --" 
            value={selectedRole} 
            onChange={handleRoleChange}
            {...selectStyle}
            maxW="400px"
            borderColor="#dde6f5"
          >
            {roles.map(role => (
              <option key={role._id} value={role._id}>{role.name}</option>
            ))}
          </Select>
        </Box>

        <Flex mb="6" align="center">
          <Switch 
            size="sm" 
            id="select-all" 
            colorScheme="orange" 
            isChecked={isAllSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
          <Text as="label" htmlFor="select-all" ml="2" fontSize="sm" fontWeight="700" color="#1e293b">Select All Permissions</Text>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="4" mb="8">
          {PERMISSION_MODULES.map((module, idx) => {
            const modulePerms = [module.name, ...module.permissions];
            const isModuleSelected = modulePerms.every(p => selectedPermissions.includes(p));
            const isAnySelected = modulePerms.some(p => selectedPermissions.includes(p));

            return (
              <Box 
                key={idx} 
                p="4" 
                border="1px solid" 
                borderColor="#f1f5f9" 
                borderRadius="lg" 
                bg="#ffffff"
                transition="all 0.2s"
                _hover={{ boxShadow: 'sm', borderColor: '#e2e8f0' }}
              >
                <Flex align="center" mb={module.permissions.length > 0 ? "3" : "0"}>
                  <Checkbox 
                    size="sm" 
                    colorScheme="orange"
                    isChecked={isModuleSelected}
                    isIndeterminate={isAnySelected && !isModuleSelected}
                    onChange={() => handleModuleToggle(module)}
                  />
                  <HStack ml="3" spacing="2">
                    <Icon as={Layers} color="#f97316" boxSize={3.5} />
                    <Text fontSize="sm" fontWeight="700" color="#1e293b">{module.name}</Text>
                  </HStack>
                </Flex>
                
                {module.permissions.length > 0 && (
                  <VStack align="start" pl="7" spacing="2">
                    {module.permissions.map((perm, pIdx) => (
                      <Flex key={pIdx} align="center">
                        <Checkbox 
                          size="sm" 
                          colorScheme="orange"
                          isChecked={selectedPermissions.includes(perm)}
                          onChange={() => handlePermissionToggle(perm)}
                        />
                        <HStack ml="3" spacing="2">
                          <Icon viewBox="0 0 24 24" boxSize={3} color="#f97316">
                            <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,11A1,1 0 0,1 13,12A1,1 0 0,1 12,13A1,1 0 0,1 11,12A1,1 0 0,1 12,11M11,8H13V10H11V8M11,14H13V16H11V14Z" />
                          </Icon>
                          <Text fontSize="xs" fontWeight="500" color="#64748b">{perm}</Text>
                        </HStack>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </Box>
            );
          })}
        </SimpleGrid>

        <HStack justify="flex-end" spacing="3" pt="6" borderTop="1px solid" borderColor="#f1f5f9">
          <Button 
            bg="#4a707e" 
            color="white" 
            borderRadius="md" 
            size="sm" 
            px="6"
            _hover={{ bg: '#3a5a66' }} 
            onClick={() => navigate('/users/list')}
          >
            Cancel
          </Button>
          <Button 
            isLoading={isLoading} 
            leftIcon={<Save size={16} />} 
            bg="#00c853" 
            color="white" 
            borderRadius="md" 
            size="sm" 
            px="8" 
            _hover={{ bg: '#00a846' }}
            onClick={handleSave}
          >
            Assign
          </Button>
        </HStack>
      </FormCard>
      <PageFooter />
    </Box>
  );
};

const VStack = ({ children, ...props }) => <Flex direction="column" {...props}>{children}</Flex>;

export default AssignPermissions;
