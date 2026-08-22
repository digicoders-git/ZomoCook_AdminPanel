import { useState, useRef } from 'react';
import {
  Box, Flex, Icon, Text, IconButton, Avatar, VStack, HStack, Collapse,
  useDisclosure, Drawer, DrawerContent, DrawerOverlay,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, Button, Tooltip
} from '@chakra-ui/react';
import {
  LayoutDashboard, Users, Briefcase, UserSquare2, Bell, MessageSquare,
  ShieldCheck, Database, Settings, LogOut, Menu as MenuIcon, X, ChevronDown, ChevronRight,
  Menu as ListMenu, Layers, Wrench, Star, Banknote, Clock, UtensilsCrossed,
  Calendar, Heart, Building2, Gift, Image as ImageIcon, Film, Globe, MapPin,
  Plus, List as ListIcon
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import logo from '../assets/logo.png';

const BRAND = '#2D2B75';
const ACCENT = '#4C49ED';
const RED_ACCENT = '#ED1C24';

const navCategories = [
  {
    category: '',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/', permission: 'dashboard:view' },
    ]
  },
  {
    category: 'USER MANAGEMENT',
    items: [
      {
        name: 'Customers / Clients', icon: Users, path: '/customers', permission: 'customer_client:view',
        children: [
          { name: 'Customer List', path: '/customers/list', permission: 'customer_client:view' },
          { name: 'Add Customer', path: '/customers/add', permission: 'customer_client:add' },
        ]
      },
      {
        name: 'Candidates', icon: UserSquare2, path: '/candidates', permission: 'candidates:view',
        children: [
          { name: 'Candidate List', path: '/candidates/list', permission: 'candidates:view' },
          { name: 'Add Candidate', path: '/candidates/add', permission: 'candidates:add' },
          { name: 'All Applications', path: '/applications/all', permission: 'candidates:view' },
          { name: 'Applied Candidates', path: '/candidates/applied', permission: 'candidates:view' },
          { name: 'Shortlisted Candidates', path: '/candidates/shortlisted', permission: 'candidates:view' },
          { name: 'Demo Scheduled', path: '/candidates/demo-scheduled', permission: 'candidates:view' },
          { name: 'Rejected Candidates', path: '/candidates/rejected', permission: 'candidates:view' },
          { name: 'On Hold Candidates', path: '/candidates/on-hold', permission: 'candidates:view' },
          { name: 'Not Interested', path: '/candidates/not-interested', permission: 'candidates:view' },
          { name: 'Hired Candidates', path: '/candidates/hired', permission: 'candidates:view' },
        ]
      },
      { name: 'Cook Approvals', icon: ShieldCheck, path: '/cook-approvals', permission: 'cook_approvals:view' },
    ]
  },
  {
    category: 'RECRUITMENT & JOBS',
    items: [
      {
        name: 'Job Management', icon: Briefcase, path: '/jobs', permission: 'job_management:view',
        children: [
          { name: 'Job List', path: '/jobs/list', permission: 'job_management:view' },
          { name: 'Pending Jobs', path: '/pending-jobs', permission: 'job_management:view' },
          { name: 'Add Job', path: '/jobs/add', permission: 'job_management:add' },
          { name: 'Replacements', path: '/replacements', permission: 'job_management:view' },
        ]
      },
      { name: 'Assignments', icon: ListMenu, path: '/replacements', permission: 'job_management:view' },
      { name: 'Query History', icon: MessageSquare, path: '/queries', permission: 'query_management:view' },
    ]
  },
  {
    category: 'FINANCE',
    items: [
      { name: 'Finance / Revenue', icon: Banknote, path: '/finance', permission: 'finance_revenue:view' },
      {
        name: 'Subscription Plans', icon: Star, path: '/plans/list?tab=packages', permission: 'service_packages:view',
        children: [
          { name: 'Platform Fees Settings', path: '/plans/list?tab=fee', permission: 'service_packages:view' },
          { name: 'Daily Basis Charges', path: '/plans/list?tab=service_packages', permission: 'service_packages:view' },
          { name: 'Subscription Plans', path: '/plans/list?tab=packages', permission: 'service_packages:view' },
          { name: 'Add Subscription Plan', path: '/plans/add', permission: 'service_packages:add' },
          { name: 'Subscription History', path: '/plans/subscriptions', permission: 'service_packages:view' },
        ]
      },
      { name: 'Offers', icon: Gift, path: '/offers', permission: 'offer_management:view' },
    ]
  },
  {
    category: 'MARKETING',
    items: [
      { name: 'Banners', icon: ImageIcon, path: '/banners', permission: 'banner_management:view' },
      {
        name: 'Notifications', icon: Bell, path: '/notifications', permission: 'notifications:view',
        children: [
          { name: 'Notification List', path: '/notifications/list', permission: 'notifications:view' },
          { name: 'Add Notification', path: '/notifications/add', permission: 'notifications:add' },
        ]
      },
    ]
  },
  {
    category: 'ADMINISTRATION',
    items: [
      {
        name: 'Roles & Permissions', icon: ShieldCheck, path: '/roles', permission: 'role_permission:view',
        children: [
          { name: 'Add Role', path: '/roles/add', permission: 'role_permission:add' },
          { name: 'Manage Roles', path: '/roles/list', permission: 'role_permission:manage' },
          { name: 'Add User', path: '/users/add', permission: 'role_permission:add' },
          { name: 'User List', path: '/users/list', permission: 'role_permission:view' },
        ]
      },
      {
        name: 'Masters', icon: Database, path: '/masters', permission: 'masters:view',
        children: [
          { name: 'Job Menu Items', icon: ListMenu, path: '/masters/job-menu', permission: 'masters:view' },
          { name: 'Job Categories', icon: Layers, path: '/masters/job-categories', permission: 'masters:view' },
          { name: 'Skill Categories', icon: Layers, path: '/masters/skill-categories', permission: 'masters:view' },
          { name: 'Skills', icon: Wrench, path: '/masters/skills', permission: 'masters:view' },
          { name: 'Job Types', icon: Briefcase, path: '/masters/job-types', permission: 'masters:view' },
          { name: 'Job Positions', icon: Star, path: '/masters/job-positions', permission: 'masters:view' },
          { name: 'Experience Ranges', icon: Briefcase, path: '/masters/experiences', permission: 'masters:view' },
          { name: 'Salary Ranges', icon: Banknote, path: '/masters/salaries', permission: 'masters:view' },
          { name: 'Time Ranges', icon: Clock, path: '/masters/time-ranges', permission: 'masters:view' },
          { name: 'Cooking Categories', icon: UtensilsCrossed, path: '/masters/cooking-categories', permission: 'masters:view' },
          { name: 'Events', icon: Calendar, path: '/masters/events', permission: 'masters:view' },
          { name: 'Cooking Preferences', icon: Heart, path: '/masters/cooking-preferences', permission: 'masters:view' },
          { name: 'Cook Preferences', icon: Heart, path: '/masters/cook-preferences', permission: 'masters:view' },
          { name: 'Food Preferences', icon: Heart, path: '/masters/food-preferences', permission: 'masters:view' },
          { name: 'Gender Preferences', icon: Users, path: '/masters/gender-preferences', permission: 'masters:view' },
          { name: 'Service Durations', icon: Clock, path: '/masters/service-durations', permission: 'masters:view' },
          { name: 'Facilities', icon: Building2, path: '/masters/facilities', permission: 'masters:view' },
          { name: 'Benefits', icon: Gift, path: '/masters/benefits', permission: 'masters:view' },
          { name: 'Property Categories', icon: Layers, path: '/masters/property-categories', permission: 'masters:view' },
          { name: 'Sliders', icon: ImageIcon, path: '/masters/sliders', permission: 'masters:view' },
          { name: 'Videos', icon: Film, path: '/masters/videos', permission: 'masters:view' },
          { name: 'CMS', icon: Globe, path: '/masters/cms', permission: 'masters:view' },
          {
            name: 'Location', icon: MapPin, path: '/masters/location', permission: 'masters:view',
            children: [
              { name: 'State List', icon: ListIcon, path: '/masters/states/list', permission: 'masters:view' },
              { name: 'City List', icon: ListIcon, path: '/masters/cities/list', permission: 'masters:view' },
            ]
          },
        ]
      },
      { name: 'Web Settings', icon: Settings, path: '/settings', permission: 'settings:view' },
    ]
  }
];

const SidebarItem = ({ item, isCollapsed, onClose, depth = 0 }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.path || (hasChildren && item.children.some(child =>
    pathname === child.path || (child.children && child.children.some(sub => pathname === sub.path))
  ));

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      navigate(item.path);
      if (onClose) onClose();
    }
  };

  const itemContent = (
    <Flex
      align="center"
      py="2.5"
      px="3"
      mx={depth === 0 ? '3' : '0'}
      borderRadius="lg"
      cursor="pointer"
      onClick={handleClick}
      position="relative"
      bg={isActive && !hasChildren ? '#ffffff' : 'transparent'}
      transition="all 0.18s"
      role="group"
      _hover={{ bg: isActive && !hasChildren ? '#ffffff' : 'rgba(255, 255, 255, 0.08)' }}
      justifyContent={isCollapsed && depth === 0 ? 'center' : 'flex-start'}
      pl={depth === 0 ? 3 : depth === 1 ? 10 : 14}
    >
      {item.icon && (
        <Icon
          as={item.icon}
          boxSize={depth === 0 ? 5 : 4}
          mr={isCollapsed && depth === 0 ? 0 : 2.5}
          color={isActive ? '#2D2B75' : 'rgba(255, 255, 255, 0.8)'}
          transition="color 0.18s"
          _groupHover={{ color: isActive ? '#2D2B75' : '#ffffff' }}
          flexShrink={0}
        />
      )}

      {!(isCollapsed && depth === 0) && (
        <>
          <Text
            fontSize={depth === 0 ? 'sm' : 'xs'}
            fontWeight={isActive ? '700' : '500'}
            color={isActive ? '#2D2B75' : 'rgba(255, 255, 255, 0.85)'}
            flex="1"
            noOfLines={1}
            _groupHover={{ color: isActive ? '#2D2B75' : '#ffffff' }}
            transition="color 0.18s"
          >
            {item.name}
          </Text>
          {(depth === 0 && item.name !== 'Dashboard') && (
            <Icon
              as={ChevronRight}
              boxSize={3.5}
              color={isActive ? '#2D2B75' : 'rgba(255, 255, 255, 0.8)'}
              transition="transform 0.2s"
              transform={hasChildren && isOpen ? 'rotate(90deg)' : 'rotate(0deg)'}
              flexShrink={0}
            />
          )}
        </>
      )}
    </Flex>
  );

  return (
    <Box w="full">
      {isCollapsed && depth === 0 && item.icon ? (
        <Tooltip label={item.name} placement="right" hasArrow bg="#ffffff" color="#2D2B75" fontSize="xs">
          {itemContent}
        </Tooltip>
      ) : itemContent}

      {hasChildren && !isCollapsed && (
        <Collapse in={isOpen} animateOpacity>
          <Box
            ml={depth === 0 ? '6' : '4'}
            mt="0.5"
            mb="0.5"
            borderLeft="2px solid"
            borderColor={isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.2)'}
            pl="2"
          >
            {item.children.map((child) => (
              <SidebarItem
                key={child.path}
                item={child}
                isCollapsed={false}
                onClose={onClose}
                depth={depth + 1}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

const SidebarContent = ({ isCollapsed, onClose, onLogoutOpen, ...rest }) => (
  <Box
    w={{ base: 'full', md: isCollapsed ? '72px' : '268px' }}
    pos={{ base: 'relative', md: 'fixed' }}
    h="full"
    transition="width 0.25s cubic-bezier(0.4,0,0.2,1)"
    display="flex"
    flexDirection="column"
    bg="#2D2B75"
    borderRight="1px solid rgba(255, 255, 255, 0.1)"
    zIndex="100"
    overflow="hidden"
    {...rest}
  >
    {/* Logo Header */}
    <Box
      bg="#2D2B75"
      borderBottom="1px solid rgba(255, 255, 255, 0.1)"
      px={isCollapsed ? '0' : '5'}
      py="4"
      minH="72px"
      display="flex"
      alignItems="center"
      justifyContent={isCollapsed ? 'center' : 'flex-start'}
      flexShrink={0}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <Box
          w={isCollapsed ? '36px' : '40px'}
          h={isCollapsed ? '36px' : '40px'}
          borderRadius="10px"
          overflow="hidden"
          bg="white"
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="0 2px 8px rgba(0,0,0,0.15)"
        >
          <img src={logo} alt="ZomoCook" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </Box>
        {!isCollapsed && (
          <Box>
            <Text fontSize="lg" fontWeight="800" color="white" lineHeight="1.1" letterSpacing="-0.3px">
              ZomoCook
            </Text>
            <Text fontSize="10px" fontWeight="500" color="rgba(255, 255, 255, 0.7)" letterSpacing="0.5px">
              Admin Panel
            </Text>
          </Box>
        )}
      </Link>
    </Box>

    {/* Red accent strip */}
    <Box h="3px" bg={`linear-gradient(90deg, ${ACCENT} 0%, ${RED_ACCENT} 100%)`} flexShrink={0} />

    {/* Scrollable Nav */}
    <Box
      flex="1"
      overflowY="auto"
      overflowX="hidden"
      py="4"
      px={isCollapsed ? '1' : '0'}
      css={{
        '&::-webkit-scrollbar': { width: '3px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px' },
        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255, 255, 255, 0.3)' },
      }}
    >
      <VStack align="stretch" spacing="5">
        {navCategories.map((cat, catIdx) => {
          const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
          const userPermissions = adminData.role?.permissions || [];
          const isSuperAdmin = adminData.type === 'admin' || userPermissions.includes('global:full_access');

          // Helper to check access for an item or its children
          const hasAccess = (navItem) => {
            if (userPermissions.includes('global:full_access')) return true;
            const checkPermission = (permToCheck) => {
              if (!permToCheck) return false;
              if (userPermissions.includes(permToCheck)) return true;
              
              // Legacy normalization mapping
              const mapping = {
                'dashboard:view': ['Dashboard', 'dashboard'],
                'customer_client:view': ['Customer/Client', 'Customer/Client List', 'Customer List', 'customer_client'],
                'customer_client:add': ['Add Customer/Client', 'Add Customer', 'customer_client'],
                'customer_client:edit': ['Edit Customer', 'customer_client'],
                'job_management:view': ['Jobs', 'Job List', 'Pending Jobs', 'job_management'],
                'job_management:add': ['Add Job', 'job_management'],
                'candidates:view': ['Candidates', 'Candidate List', 'All Applications', 'Applied Candidates List', 'Shortlisted Candidate List', 'candidates'],
                'candidates:add': ['Add Candidate', 'candidates'],
                'service_packages:view': ['Subscription Plans', 'Plan List', 'Subscription History', 'service_packages'],
                'service_packages:add': ['Add Plan', 'service_packages'],
                'offer_management:view': ['Offers', 'offer_management'],
                'banner_management:view': ['Banners', 'banner_management'],
                'cook_approvals:view': ['Cook Approvals', 'cook_approvals'],
                'notifications:view': ['Notifications', 'Notification List', 'notifications'],
                'notifications:add': ['Add Notification', 'notifications'],
                'query_management:view': ['Query History', 'query_management'],
                'finance_revenue:view': ['Finance / Revenue', 'finance_revenue'],
                'role_permission:view': ['Roles & Permissions', 'User List', 'role_permission'],
                'role_permission:add': ['Add Role', 'Add User', 'role_permission'],
                'role_permission:manage': ['Manage Roles', 'role_permission'],
                'masters:view': ['Masters', 'masters'],
                'settings:view': ['Web Settings', 'settings']
              };

              const legacyNames = mapping[permToCheck];
              if (legacyNames) {
                return legacyNames.some(name => 
                  userPermissions.includes(name) || 
                  userPermissions.some(up => String(up).toLowerCase() === name.toLowerCase())
                );
              }
              return false;
            };

            if (navItem.permission && checkPermission(navItem.permission)) return true;
            if (navItem.children) {
              return navItem.children.some(child => hasAccess(child));
            }
            return false;
          };

          // Filter items user has access to
          const filteredItems = cat.items.filter(item => isSuperAdmin || hasAccess(item)).map(item => {
            if (item.children) {
              return {
                ...item,
                children: item.children.filter(child => isSuperAdmin || hasAccess(child))
              };
            }
            return item;
          });

          if (filteredItems.length === 0) return null;

          return (
            <VStack key={catIdx} align="stretch" spacing="1">
              {!isCollapsed && cat.category && (
                <Box px="6" pt="2" pb="1">
                  <Text fontSize="9px" fontWeight="800" color="rgba(255, 255, 255, 0.5)" textTransform="uppercase" letterSpacing="1.5px">
                    {cat.category}
                  </Text>
                </Box>
              )}
              {filteredItems.map(item => (
                <SidebarItem key={item.name} item={item} isCollapsed={isCollapsed} onClose={onClose} />
              ))}
            </VStack>
          );
        })}
      </VStack>
    </Box>

    {/* Logout Footer */}
    <Box
      flexShrink={0}
      borderTop="1px solid rgba(255, 255, 255, 0.1)"
      px={isCollapsed ? '1' : '3'}
      py="3"
      bg="#172554"
    >
      {isCollapsed ? (
        <Tooltip label="Logout" placement="right" hasArrow bg="#ef4444" color="white" fontSize="xs">
          <Flex
            align="center"
            justify="center"
            p="2.5"
            borderRadius="lg"
            cursor="pointer"
            color="#f87171"
            onClick={onLogoutOpen}
            _hover={{ bg: 'rgba(255, 255, 255, 0.08)' }}
            transition="all 0.18s"
          >
            <Icon as={LogOut} boxSize={5} />
          </Flex>
        </Tooltip>
      ) : (
        <Flex
          align="center"
          p="2.5"
          px="3"
          borderRadius="lg"
          cursor="pointer"
          color="#f87171"
          onClick={onLogoutOpen}
          _hover={{ bg: 'rgba(255, 255, 255, 0.08)' }}
          transition="all 0.18s"
          gap="2.5"
        >
          <Icon as={LogOut} boxSize={5} flexShrink={0} />
          <Text fontSize="sm" fontWeight="600">Logout</Text>
        </Flex>
      )}
    </Box>
  </Box>
);

const Navbar = ({ onOpen, toggleCollapse, isCollapsed, onLogoutOpen }) => {
  const [time, setTime] = React.useState(new Date());
  const { pathname } = useLocation();

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.includes('/customers')) return 'Customer Management';
    if (pathname.includes('/jobs')) return 'Job Management';
    if (pathname.includes('/candidates')) return 'Candidate Management';
    if (pathname.includes('/cook-approvals')) return 'Cook Profile Approvals';
    if (pathname.includes('/notifications')) return 'Notifications';
    if (pathname.includes('/queries')) return 'Query History';
    if (pathname.includes('/roles') || pathname.includes('/users')) return 'Roles & Permissions';
    if (pathname.includes('/masters')) return 'Master Data';
    if (pathname.includes('/settings')) return 'Web Settings';
    if (pathname.includes('/profile')) return 'Profile';
    if (pathname.includes('/offers')) return 'Manage Offers';
    if (pathname.includes('/banners')) return 'Manage Banners';
    if (pathname.includes('/subscriptions')) return 'Subscription History';
    if (pathname.includes('/plans')) return 'Plans Management';
    if (pathname.includes('/finance')) return 'Finance / Revenue';
    return 'ZomoCook Admin';
  };

  return (
    <Flex
      ml={{ base: 0, md: isCollapsed ? '72px' : '268px' }}
      px={{ base: '4', md: '6' }}
      height="16"
      alignItems="center"
      justifyContent="space-between"
      transition="margin-left 0.25s cubic-bezier(0.4,0,0.2,1)"
      position="sticky"
      top="0"
      zIndex="50"
      bg="white"
      borderBottom="2px solid"
      borderColor="#e8edf5"
      boxShadow="0 2px 16px rgba(0,74,173,0.06)"
    >
      {/* Left Section */}
      <HStack spacing="4">
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          variant="solid"
          aria-label="open menu"
          icon={<MenuIcon size={20} />}
          bg={BRAND}
          color="white"
          size="md"
          borderRadius="xl"
          _hover={{ bg: '#003d91', transform: 'scale(1.05)' }}
          _active={{ bg: '#003080', transform: 'scale(0.95)' }}
          boxShadow={`0 4px 12px ${BRAND}40`}
        />

        {/* Desktop Toggle Button */}
        <IconButton
          display={{ base: 'none', md: 'flex' }}
          onClick={toggleCollapse}
          variant="ghost"
          aria-label="toggle sidebar"
          icon={isCollapsed ? <MenuIcon size={18} /> : <X size={18} />}
          color={BRAND}
          size="sm"
          borderRadius="lg"
          _hover={{ bg: `${BRAND}10` }}
          _active={{ bg: `${BRAND}18` }}
        />

        {/* Page Title - Hidden on mobile */}
        <VStack align="start" spacing="0" display={{ base: 'none', md: 'flex' }}>
          <Text fontSize="sm" fontWeight="800" color="#1e293b" lineHeight="1.2">
            {getPageTitle()}
          </Text>
          <Text fontSize="10px" fontWeight="600" color="#94a3b8" letterSpacing="0.5px">
            Welcome back, Admin
          </Text>
        </VStack>
      </HStack>

      {/* Right Section */}
      <HStack spacing="3">
        {/* Date & Time Display */}
        <HStack
          display={{ base: 'none', lg: 'flex' }}
          spacing="2.5"
          bg="#f8faff"
          px="3.5"
          py="2"
          borderRadius="lg"
          border="1.5px solid #e0e8f5"
        >
          <HStack spacing="1.5">
            <Icon as={Calendar} boxSize={3.5} color={BRAND} />
            <Text fontSize="11px" fontWeight="700" color={BRAND}>{formatDate(time)}</Text>
          </HStack>
          <Box w="1px" h="4" bg="#d0daf0" />
          <HStack spacing="1.5">
            <Icon as={Clock} boxSize={3.5} color="#64748b" />
            <Text fontSize="11px" fontWeight="700" color="#64748b">{formatTime(time)}</Text>
          </HStack>
        </HStack>

        {/* User Profile Menu */}
        <Menu>
          <MenuButton
            py="1"
            transition="all 0.2s"
            _focus={{ boxShadow: 'none' }}
            _hover={{ bg: `${BRAND}08` }}
            borderRadius="lg"
            px="2"
          >
            <HStack spacing="2.5">
              <Avatar
                size="sm"
                name="Admin User"
                src="https://images.unsplash.com/photo-1619946769363-107e822026a7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80"
                border="2.5px solid"
                borderColor={BRAND}
                boxShadow={`0 0 0 2px ${BRAND}20`}
              />
              <VStack display={{ base: 'none', md: 'flex' }} alignItems="flex-start" spacing="0" ml="0.5">
                <Text fontSize="sm" fontWeight="700" color="#1e293b" lineHeight="1.2">
                  {JSON.parse(localStorage.getItem('adminData') || '{}').name || 'Admin User'}
                </Text>
                <Text fontSize="10px" color="#64748b" fontWeight="600" letterSpacing="0.3px">
                  {JSON.parse(localStorage.getItem('adminData') || '{}').type === 'admin' ? 'Super Admin' : (JSON.parse(localStorage.getItem('adminData') || '{}').role?.name || 'Staff User')}
                </Text>
              </VStack>
              <Box display={{ base: 'none', md: 'flex' }} color="#94a3b8">
                <ChevronDown size={14} />
              </Box>
            </HStack>
          </MenuButton>
          <MenuList
            bg="white"
            borderColor="#e8edf5"
            boxShadow="0 8px 30px rgba(0,74,173,0.12)"
            p="2"
            borderRadius="xl"
            minW="180px"
            border="1.5px solid #e8edf5"
          >
            <MenuItem
              as={Link}
              to="/profile"
              icon={<Icon as={Users} boxSize={3.5} />}
              _hover={{ bg: `${BRAND}08`, color: BRAND }}
              borderRadius="md"
              color="#475569"
              fontSize="sm"
              fontWeight="600"
            >
              Profile
            </MenuItem>
            <MenuItem
              as={Link}
              to="/settings"
              icon={<Icon as={Settings} boxSize={3.5} />}
              _hover={{ bg: `${BRAND}08`, color: BRAND }}
              borderRadius="md"
              color="#475569"
              fontSize="sm"
              fontWeight="600"
            >
              Settings
            </MenuItem>
            <MenuDivider borderColor="#f1f5f9" my="1" />
            <MenuItem
              onClick={onLogoutOpen}
              icon={<Icon as={LogOut} boxSize={3.5} />}
              _hover={{ bg: '#fff0f0', color: ACCENT }}
              borderRadius="md"
              color={ACCENT}
              fontSize="sm"
              fontWeight="600"
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
};

const Layout = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isLogoutOpen, onOpen: onLogoutOpen, onClose: onLogoutClose } = useDisclosure();
  const cancelRef = useRef();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    onLogoutClose();
    navigate('/login');
  };

  return (
    <Box minH="100vh" bg="#f4f7fb">
      <SidebarContent
        onClose={onClose}
        display={{ base: 'none', md: 'flex' }}
        isCollapsed={isCollapsed}
        onLogoutOpen={onLogoutOpen}
      />

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} returnFocusOnClose={false} onOverlayClick={onClose} size="xs">
        <DrawerOverlay bg="rgba(0,0,0,0.4)" />
        <DrawerContent p="0" maxW="268px">
          <SidebarContent onClose={onClose} isCollapsed={false} onLogoutOpen={onLogoutOpen} />
        </DrawerContent>
      </Drawer>

      <Navbar onOpen={onOpen} toggleCollapse={() => setIsCollapsed(!isCollapsed)} isCollapsed={isCollapsed} onLogoutOpen={onLogoutOpen} />

      <Box ml={{ base: 0, md: isCollapsed ? '72px' : '268px' }} p={{ base: '4', md: '8' }} transition="margin-left 0.25s cubic-bezier(0.4,0,0.2,1)">
        <Box maxW="1600px" mx="auto" className="animate-slide-in">
          {children}
        </Box>
      </Box>

      <AlertDialog isOpen={isLogoutOpen} leastDestructiveRef={cancelRef} onClose={onLogoutClose} isCentered>
        <AlertDialogOverlay backdropFilter="blur(6px)" bg="rgba(0,0,0,0.3)">
          <AlertDialogContent bg="white" borderRadius="2xl" boxShadow="0 20px 60px rgba(0,74,173,0.15)" border="1px solid #e8edf5" mx="4">
            <AlertDialogHeader fontSize="lg" fontWeight="800" color="#1e293b" pb="2">
              Confirm Logout
            </AlertDialogHeader>
            <AlertDialogBody color="#64748b" fontSize="sm">
              Are you sure you want to log out? You will need to sign in again to access the admin panel.
            </AlertDialogBody>
            <AlertDialogFooter gap="3" pt="4">
              <Button ref={cancelRef} onClick={onLogoutClose} variant="ghost" color="#64748b" _hover={{ bg: '#f1f5f9' }}>
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                bg={ACCENT}
                color="white"
                px="8"
                _hover={{ bg: '#c8151c' }}
                boxShadow={`0 4px 15px ${ACCENT}40`}
              >
                Logout
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Layout;
