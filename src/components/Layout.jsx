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
  ShieldCheck, Database, Settings, LogOut, Menu as MenuIcon, X, ChevronDown,
  Menu as ListMenu, Layers, Wrench, Star, Banknote, Clock, UtensilsCrossed,
  Calendar, Heart, Building2, Gift, Image as ImageIcon, Film, Globe, MapPin,
  Plus, List as ListIcon
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import React from 'react';

const BRAND = '#004aad';
const ACCENT = '#f59e0b';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/', permission: 'Dashboard' },
  {
    name: 'Customer/Client', icon: Users, path: '/customers', permission: 'Customer/Client',
    children: [
      { name: 'Customer List', path: '/customers/list', permission: 'Customer/Client List' },
      { name: 'Add Customer', path: '/customers/add', permission: 'Add Customer/Client' },
    ]
  },
  {
    name: 'Job Management', icon: Briefcase, path: '/jobs', permission: 'Jobs',
    children: [
      { name: 'Job List', path: '/jobs/list', permission: 'Job List' },
      { name: 'Add Job', path: '/jobs/add', permission: 'Add Job' },
    ]
  },
  {
    name: 'Candidates', icon: UserSquare2, path: '/candidates', permission: 'Candidates',
    children: [
      { name: 'Candidate List', path: '/candidates/list', permission: 'Candidate List' },
      { name: 'Add Candidate', path: '/candidates/add', permission: 'Add Candidate' },
      { name: 'Applied Candidates', path: '/candidates/applied', permission: 'Applied Candidates List' },
      { name: 'Shortlisted Candidates', path: '/candidates/shortlisted', permission: 'Shortlisted Candidate List' },
      { name: 'Demo Scheduled', path: '/candidates/demo-scheduled', permission: 'Candidates' },
      { name: 'Rejected Candidates', path: '/candidates/rejected', permission: 'Candidates' },
      { name: 'On Hold Candidates', path: '/candidates/on-hold', permission: 'Candidates' },
      { name: 'Not Interested', path: '/candidates/not-interested', permission: 'Candidates' },
      { name: 'Hired Candidates', path: '/candidates/hired', permission: 'Candidates' },
    ]
  },
  {
    name: 'Notifications', icon: Bell, path: '/notifications', permission: 'Notifications',
    children: [
      { name: 'Notification List', path: '/notifications/list', permission: 'Notification List' },
      { name: 'Add Notification', path: '/notifications/add', permission: 'Add Notification' },
    ]
  },
  { name: 'Query History', icon: MessageSquare, path: '/queries', permission: 'Query History' },
  {
    name: 'Roles & Permissions', icon: ShieldCheck, path: '/roles', permission: 'Roles',
    children: [
      { name: 'Add Role', path: '/roles/add', permission: 'Add Role' },
      { name: 'Role List', path: '/roles/list', permission: 'Role List' },
      { name: 'Add User', path: '/users/add', permission: 'Add User' },
      { name: 'User List', path: '/users/list', permission: 'User List' },
    ]
  },
  {
    name: 'Masters', icon: Database, path: '/masters', permission: 'Masters',
    children: [
      { name: 'Job Menu Items', icon: ListMenu, path: '/masters/job-menu', permission: 'Menu Item', children: [{ name: 'Add Job Menu Item', icon: Plus, path: '/masters/job-menu/add', permission: 'Add Menu Item' }, { name: 'Job Menu Item List', icon: ListIcon, path: '/masters/job-menu/list', permission: 'Menu Item List' }] },
      { name: 'Skill Categories', icon: Layers, path: '/masters/skill-categories', permission: 'Skill Category', children: [{ name: 'Add Skill Category', icon: Plus, path: '/masters/skill-categories/add', permission: 'Add Skill Category' }, { name: 'Skill Category List', icon: ListIcon, path: '/masters/skill-categories/list', permission: 'Skill Category List' }] },
      { name: 'Skills', icon: Wrench, path: '/masters/skills', permission: 'Skill', children: [{ name: 'Add Skill', icon: Plus, path: '/masters/skills/add', permission: 'Add Skill' }, { name: 'Skill List', icon: ListIcon, path: '/masters/skills/list', permission: 'Skill List' }] },
      { name: 'Job Types', icon: Briefcase, path: '/masters/job-types', permission: 'Job Type', children: [{ name: 'Add Job Type', icon: Plus, path: '/masters/job-types/add', permission: 'Add Job Type' }, { name: 'Job Type List', icon: ListIcon, path: '/masters/job-types/list', permission: 'Job Type List' }] },
      { name: 'Job Positions', icon: Star, path: '/masters/job-positions', permission: 'Position', children: [{ name: 'Add Job Position', icon: Plus, path: '/masters/job-positions/add', permission: 'Add Position' }, { name: 'Job Position List', icon: ListIcon, path: '/masters/job-positions/list', permission: 'Position List' }] },
      { name: 'Experience Ranges', icon: Briefcase, path: '/masters/experience-ranges', permission: 'Experience Range', children: [{ name: 'Add Experience Range', icon: Plus, path: '/masters/experience-ranges/add', permission: 'Add Experience Range' }, { name: 'Experience Range List', icon: ListIcon, path: '/masters/experience-ranges/list', permission: 'Experience Range List' }] },
      { name: 'Salary Ranges', icon: Banknote, path: '/masters/salary-ranges', permission: 'Salary Range', children: [{ name: 'Add Salary Range', icon: Plus, path: '/masters/salary-ranges/add', permission: 'Add Salary Range' }, { name: 'Salary Range List', icon: ListIcon, path: '/masters/salary-ranges/list', permission: 'Salary Range List' }] },
      { name: 'Time Ranges', icon: Clock, path: '/masters/time-ranges', permission: 'Time Range', children: [{ name: 'Add Time Range', icon: Plus, path: '/masters/time-ranges/add', permission: 'Add Time Range' }, { name: 'Time Range List', icon: ListIcon, path: '/masters/time-ranges/list', permission: 'Time Range List' }] },
      { name: 'Cooking Categories', icon: UtensilsCrossed, path: '/masters/cooking-categories', permission: 'Cooking Category', children: [{ name: 'Add Cooking Category', icon: Plus, path: '/masters/cooking-categories/add', permission: 'Add Cooking Category' }, { name: 'Cooking Category List', icon: ListIcon, path: '/masters/cooking-categories/list', permission: 'Cooking Category List' }] },
      { name: 'Events', icon: Calendar, path: '/masters/events', permission: 'Event', children: [{ name: 'Add Event', icon: Plus, path: '/masters/events/add', permission: 'Add Event' }, { name: 'Event List', icon: ListIcon, path: '/masters/events/list', permission: 'Event List' }] },
      { name: 'Cooking Preferences', icon: Heart, path: '/masters/cooking-preferences', permission: 'Cooking Preference', children: [{ name: 'Add Cooking Preference', icon: Plus, path: '/masters/cooking-preferences/add', permission: 'Add Cooking Preference' }, { name: 'Cooking Preference List', icon: ListIcon, path: '/masters/cooking-preferences/list', permission: 'Cooking Preference List' }] },
      { name: 'Facilities', icon: Building2, path: '/masters/facilities', permission: 'Facility', children: [{ name: 'Add Facility', icon: Plus, path: '/masters/facilities/add', permission: 'Add Facility' }, { name: 'Facility List', icon: ListIcon, path: '/masters/facilities/list', permission: 'Facility List' }] },
      { name: 'Benefits', icon: Gift, path: '/masters/benefits', permission: 'Benefits', children: [{ name: 'Add Benefit', icon: Plus, path: '/masters/benefits/add', permission: 'Add Benefit' }, { name: 'Benefit List', icon: ListIcon, path: '/masters/benefits/list', permission: 'Benefit List' }] },
      { name: 'Property Categories', icon: Layers, path: '/masters/property-categories', permission: 'Property Category', children: [{ name: 'Add Property Category', icon: Plus, path: '/masters/property-categories/add', permission: 'Add Property Category' }, { name: 'Property Category List', icon: ListIcon, path: '/masters/property-categories/list', permission: 'Property Category List' }] },
      { name: 'Sliders', icon: ImageIcon, path: '/masters/sliders', permission: 'Sliders', children: [{ name: 'Add Slider', icon: Plus, path: '/masters/sliders/add', permission: 'Add Slider' }, { name: 'Slider List', icon: ListIcon, path: '/masters/sliders/list', permission: 'Slider List' }] },
      { name: 'Videos', icon: Film, path: '/masters/videos', permission: 'Videos', children: [{ name: 'Add Video', icon: Plus, path: '/masters/videos/add', permission: 'Add Video' }, { name: 'Video List', icon: ListIcon, path: '/masters/videos/list', permission: 'Video List' }] },
      { name: 'CMS', icon: Globe, path: '/masters/cms', permission: 'CMS', children: [{ name: 'Add CMS', icon: Plus, path: '/masters/cms/add', permission: 'Add CMS' }, { name: 'CMS List', icon: ListIcon, path: '/masters/cms/list', permission: 'CMS List' }] },
      {
        name: 'Location', icon: MapPin, path: '/masters/location', permission: 'States',
        children: [
          { name: 'State List', icon: ListIcon, path: '/masters/states/list', permission: 'State List' },
          { name: 'City List', icon: ListIcon, path: '/masters/cities/list', permission: 'City List' },
        ]
      },
    ]
  },
  { name: 'Web Settings', icon: Settings, path: '/settings', permission: 'Web Settings' },
];

const SidebarItem = ({ item, isCollapsed, onClose, depth = 0 }) => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.path || (hasChildren && item.children.some(child =>
    pathname === child.path || (child.children && child.children.some(sub => pathname === sub.path))
  ));

  const itemContent = (
    <Flex
      align="center"
      py="2.5"
      px="3"
      mx={depth === 0 ? '3' : '0'}
      borderRadius="lg"
      cursor="pointer"
      onClick={hasChildren ? () => setIsOpen(!isOpen) : (onClose || undefined)}
      as={hasChildren ? 'div' : Link}
      to={hasChildren ? undefined : item.path}
      position="relative"
      bg={isActive && !hasChildren ? `${BRAND}18` : 'transparent'}
      transition="all 0.18s"
      role="group"
      _hover={{ bg: isActive && !hasChildren ? `${BRAND}22` : `${BRAND}10` }}
      justifyContent={isCollapsed && depth === 0 ? 'center' : 'flex-start'}
      pl={depth === 0 ? 3 : depth === 1 ? 10 : 14}
    >
      {/* Active left bar indicator */}
      {isActive && !hasChildren && depth === 0 && (
        <Box
          position="absolute"
          left="-3px"
          top="20%"
          bottom="20%"
          w="3px"
          borderRadius="full"
          bg={ACCENT}
        />
      )}

      {item.icon && (
        <Icon
          as={item.icon}
          boxSize={depth === 0 ? 5 : 4}
          mr={isCollapsed && depth === 0 ? 0 : 2.5}
          color={isActive ? BRAND : '#94a3b8'}
          transition="color 0.18s"
          _groupHover={{ color: BRAND }}
          flexShrink={0}
        />
      )}

      {!(isCollapsed && depth === 0) && (
        <>
          <Text
            fontSize={depth === 0 ? 'sm' : 'xs'}
            fontWeight={isActive ? '700' : '500'}
            color={isActive ? BRAND : '#475569'}
            flex="1"
            noOfLines={1}
            _groupHover={{ color: BRAND }}
            transition="color 0.18s"
          >
            {item.name}
          </Text>
          {hasChildren && (
            <Icon
              as={ChevronDown}
              boxSize={3.5}
              color="#94a3b8"
              transition="transform 0.2s"
              transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
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
        <Tooltip label={item.name} placement="right" hasArrow bg={BRAND} color="white" fontSize="xs">
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
            borderColor={isActive ? `${BRAND}40` : '#e2e8f0'}
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
    bg="white"
    borderRight="1px solid #e8edf5"
    boxShadow="4px 0 24px rgba(0,74,173,0.06)"
    zIndex="100"
    overflow="hidden"
    {...rest}
  >
    {/* Logo Header */}
    <Box
      bg={`linear-gradient(135deg, ${BRAND} 0%, #0062e6 100%)`}
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
          <img src="/logo.jpg" alt="ZomoCook" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </Box>
        {!isCollapsed && (
          <Box>
            <Text fontSize="lg" fontWeight="800" color="white" lineHeight="1.1" letterSpacing="-0.3px">
              ZomoCook
            </Text>
            <Text fontSize="10px" fontWeight="500" color="rgba(255,255,255,0.7)" letterSpacing="0.5px">
              Admin Panel
            </Text>
          </Box>
        )}
      </Link>
    </Box>

    {/* Red accent strip */}
    <Box h="3px" bg={`linear-gradient(90deg, ${ACCENT} 0%, #ff4d53 100%)`} flexShrink={0} />

    {/* Menu Label */}
    {!isCollapsed && (
      <Box px="6" pt="4" pb="1" flexShrink={0}>
        <Text fontSize="9px" fontWeight="800" color="#94a3b8" textTransform="uppercase" letterSpacing="1.5px">
          Navigation
        </Text>
      </Box>
    )}

    {/* Scrollable Nav */}
    <Box
      flex="1"
      overflowY="auto"
      overflowX="hidden"
      py="2"
      px={isCollapsed ? '1' : '0'}
      css={{
        '&::-webkit-scrollbar': { width: '3px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: '#e2e8f0', borderRadius: '10px' },
        '&::-webkit-scrollbar-thumb:hover': { background: '#cbd5e1' },
      }}
    >
      <VStack align="stretch" spacing="0.5">
        {navItems.map((item) => {
          const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
          const userPermissions = adminData.role?.permissions || [];
          const isSuperAdmin = adminData.type === 'admin';

          if (isSuperAdmin) {
            return <SidebarItem key={item.name} item={item} isCollapsed={isCollapsed} onClose={onClose} />;
          }

          // Function to check if user has permission for item or any of its children recursively
          const hasAccess = (navItem) => {
            // Check direct permission
            if (navItem.permission && userPermissions.includes(navItem.permission)) return true;
            
            // Check if any child has permission
            if (navItem.children) {
              return navItem.children.some(child => hasAccess(child));
            }
            
            // If no permission specified, it might be public or dependent on others
            // For now, if no permission is set, we can decide to show or hide
            return false;
          };

          if (!hasAccess(item)) return null;

          // Recursively filter children to only show those the user has access to
          const getFilteredChildren = (children) => {
            return children
              .filter(child => hasAccess(child))
              .map(child => ({
                ...child,
                children: child.children ? getFilteredChildren(child.children) : undefined
              }));
          };

          const filteredItem = {
            ...item,
            children: item.children ? getFilteredChildren(item.children) : undefined
          };

          return <SidebarItem key={item.name} item={filteredItem} isCollapsed={isCollapsed} onClose={onClose} />;
        })}
      </VStack>
    </Box>

    {/* Logout Footer */}
    <Box
      flexShrink={0}
      borderTop="1px solid #f1f5f9"
      px={isCollapsed ? '1' : '3'}
      py="3"
      bg="#fafbfc"
    >
      {isCollapsed ? (
        <Tooltip label="Logout" placement="right" hasArrow bg={ACCENT} color="white" fontSize="xs">
          <Flex
            align="center"
            justify="center"
            p="2.5"
            borderRadius="lg"
            cursor="pointer"
            color={ACCENT}
            onClick={onLogoutOpen}
            _hover={{ bg: '#fff0f0' }}
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
          color={ACCENT}
          onClick={onLogoutOpen}
          _hover={{ bg: '#fff0f0' }}
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

  // Get current page title from pathname
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.includes('/customers')) return 'Customer Management';
    if (pathname.includes('/jobs')) return 'Job Management';
    if (pathname.includes('/candidates')) return 'Candidate Management';
    if (pathname.includes('/notifications')) return 'Notifications';
    if (pathname.includes('/queries')) return 'Query History';
    if (pathname.includes('/roles') || pathname.includes('/users')) return 'Roles & Permissions';
    if (pathname.includes('/masters')) return 'Master Data';
    if (pathname.includes('/settings')) return 'Web Settings';
    if (pathname.includes('/profile')) return 'Profile';
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
