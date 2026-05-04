import React, { useState, useEffect } from 'react';
import {
  Box, SimpleGrid, Text, Flex, Icon, HStack, VStack,
  Table, Thead, Tbody, Tr, Th, Td, Button, Select, Input,
  FormControl, FormLabel, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  Badge, IconButton, Skeleton, useToast, Spinner, Collapse,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  useDisclosure, Divider
} from '@chakra-ui/react';
import {
  LayoutDashboard, Users, Briefcase, Calendar, CalendarClock,
  XCircle, PauseCircle, CircleSlash, UserCheck, Search, RotateCcw,
  ChevronRight, Filter, FileText, UserPlus, Clock, Eye,
  Activity, PieChart as PieIcon, BarChart2, TrendingUp, AlertCircle, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';
import axios from 'axios';

const BRAND = '#004aad';
const ACCENT = '#ed1c24';

const StatCard = ({ title, value, icon, color, iconBg, link }) => (
  <Box
    bg="white"
    p={{ base: '4', md: '5' }}
    borderRadius="xl"
    border="1px solid #e8edf5"
    boxShadow="0 2px 8px rgba(0,74,173,0.05)"
    transition="all 0.2s"
    _hover={{ transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,74,173,0.1)', borderColor: '#c0d0f0' }}
    position="relative"
    overflow="hidden"
  >
    <Box position="absolute" top="0" left="0" right="0" h="3px" bg={color} borderRadius="xl xl 0 0" />
    <Flex align="center" justify="space-between" mt="1">
      <VStack align="start" spacing="0.5" flex="1" pr="2">
        <Text color="#64748b" fontSize={{ base: '10px', md: '11px' }} fontWeight="700" letterSpacing="0.5px" textTransform="uppercase" noOfLines={2}>
          {title}
        </Text>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" color="#1e293b" lineHeight="1.1">{value}</Text>
      </VStack>
      <Box p={{ base: '2.5', md: '3' }} bg={iconBg} borderRadius="xl" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
        <Icon as={icon} color={color} boxSize={{ base: 4, md: 5 }} />
      </Box>
    </Flex>
    <Box mt="3" pt="3" borderTop="1px solid #f1f5f9">
      <Link to={link || "#"}>
        <Text fontSize="11px" color={BRAND} fontWeight="700" display="inline-flex" alignItems="center" gap="1"
          _hover={{ color: ACCENT }}>
          View Details <Icon as={ChevronRight} boxSize={3} />
        </Text>
      </Link>
    </Box>
  </Box>
);

const SectionHeader = ({ icon, title, badge }) => (
  <Flex align="center" justify="space-between" mb="5">
    <HStack spacing="3">
      <Box w="3px" h="20px" bg={BRAND} borderRadius="full" />
      <Icon as={icon} boxSize={4} color={BRAND} />
      <Text fontSize="sm" fontWeight="700" color="#1e293b">{title}</Text>
    </HStack>
    {badge}
  </Flex>
);

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [positions, setPositions] = useState([]);
  
  // Modal States
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [positionJobs, setPositionJobs] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    category: '',
    customer: '',
    position: '',
    date: ''
  });

  const toast = useToast();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('adminToken');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.customer) params.append('customer', filters.customer);
      if (filters.position) params.append('position', filters.position);
      if (filters.date) params.append('date', filters.date);

      const response = await axios.get(`${API_BASE_URL}/dashboard?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setData(response.data);
      }
    } catch (error) {
      toast({ title: 'Error fetching dashboard data', status: 'error', duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMasters = async () => {
    try {
      const [custRes, posRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/customers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/masters/job-positions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (custRes.data.success) setCustomers(custRes.data.customers);
      if (posRes.data.success) setPositions(posRes.data.masters);
    } catch (error) {
      console.error('Error fetching masters:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMasters();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    fetchData();
  };

  const handleReset = () => {
    setFilters({ category: '', customer: '', position: '', date: '' });
    setIsLoading(true);
    axios.get(`${API_BASE_URL}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data.success) setData(res.data); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  const handleViewPositionJobs = async (positionName) => {
    setSelectedPosition(positionName);
    onOpen();
    setIsModalLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/position-jobs`, {
        params: { position: positionName },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setPositionJobs(response.data.tableData);
      }
    } catch (error) {
      toast({ title: 'Error fetching job details', status: 'error', duration: 3000 });
    } finally {
      setIsModalLoading(false);
    }
  };

  if (isLoading && !data) {
    return (
      <Flex h="80vh" align="center" justify="center">
        <Spinner size="xl" color={BRAND} thickness="4px" />
      </Flex>
    );
  }

  const { stats, charts, tableData } = data || {};

  const statCards = [
    { title: 'Total Jobs', value: stats?.totalJobs || 0, icon: Briefcase, iconBg: '#e6eeff', color: BRAND, link: '/jobs/list' },
    { title: 'New Applied', value: stats?.newApplied || 0, icon: UserPlus, iconBg: '#eff6ff', color: '#3b82f6', link: '/candidates/applied' },
    { title: 'Total Applications', value: stats?.totalApplications || 0, icon: FileText, iconBg: '#f5f3ff', color: '#7c3aed', link: '/candidates/applied' },
    { title: 'Assigned Candidates', value: stats?.shortlisted || 0, icon: UserCheck, iconBg: '#f0fdf4', color: '#16a34a', link: '/candidates/shortlisted' },
    { title: 'Demo Scheduled', value: stats?.demoScheduled || 0, icon: Calendar, iconBg: '#ecfdf5', color: '#10b981', link: '/candidates/demo-scheduled' },
    { title: 'Reschedule Requests', value: stats?.rescheduleRequested || 0, icon: CalendarClock, iconBg: '#ecfeff', color: '#06b6d4', link: '/candidates/reschedule-requests' },
    { title: 'Rejected Candidates', value: stats?.rejected || 0, icon: XCircle, iconBg: '#fff0f0', color: ACCENT, link: '/candidates/rejected' },
    { title: 'On Hold Candidates', value: stats?.onHold || 0, icon: PauseCircle, iconBg: '#fffbeb', color: '#f59e0b', link: '/candidates/on-hold' },
    { title: 'Not Interested', value: stats?.notInterested || 0, icon: CircleSlash, iconBg: '#f8fafc', color: '#64748b', link: '/candidates/not-interested' },
    { title: 'Hired Candidates', value: stats?.hired || 0, icon: UserCheck, iconBg: '#e6eeff', color: BRAND, link: '/candidates/hired' },
    { title: 'Total Candidates', value: stats?.totalCandidates || 0, icon: Users, iconBg: '#e6eeff', color: BRAND, link: '/candidates/list' },
    { title: 'Pending Candidates', value: stats?.pendingCandidates || 0, icon: Clock, iconBg: '#fff0f0', color: ACCENT, link: '/candidates/list' },
  ];

  // Chart Data Formatting
  const catNames = { hotel: 'Hotel Jobs', home: 'Home Cooks', daily: 'Daily Pay' };
  const categoryLabels = charts?.categoryDistribution?.map(c => catNames[c._id] || c._id) || [];
  const categorySeries = charts?.categoryDistribution?.map(c => c.count) || [];

  const growthLabels = charts?.applicationGrowth?.map(g => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[g._id.month - 1]} ${g._id.year}`;
  }) || [];
  const growthSeries = charts?.applicationGrowth?.map(g => g.count) || [];

  const statusLabels = charts?.statusOverview?.map(s => s._id) || [];
  const statusSeries = charts?.statusOverview?.map(s => s.count) || [];

  // ApexCharts Options
  const pieChartOptions = {
    chart: { type: 'donut', height: 260, fontFamily: 'Outfit, sans-serif' },
    labels: categoryLabels.length ? categoryLabels : ['No Data'],
    colors: [BRAND, ACCENT, '#0062e6', '#94a3b8'],
    legend: { position: 'bottom', fontSize: '11px' },
    dataLabels: { enabled: true, style: { fontSize: '11px' } },
    plotOptions: { pie: { donut: { size: '65%' } } }
  };

  const lineChartOptions = {
    chart: { type: 'line', height: 260, toolbar: { show: false }, fontFamily: 'Outfit, sans-serif' },
    colors: [BRAND],
    stroke: { width: 3, curve: 'smooth' },
    xaxis: { categories: growthLabels.length ? growthLabels : ['No Data'], labels: { style: { colors: '#64748b', fontSize: '11px' } } },
    yaxis: { labels: { style: { colors: '#64748b', fontSize: '11px' } } },
    grid: { borderColor: '#f1f5f9' },
    markers: { size: 4, colors: ['#fff'], strokeColors: BRAND, strokeWidth: 2, hover: { size: 6 } }
  };

  const columnChartOptions = {
    chart: { type: 'bar', height: 260, toolbar: { show: false }, fontFamily: 'Outfit, sans-serif' },
    colors: [ACCENT],
    plotOptions: { bar: { borderRadius: 6, columnWidth: '40%' } },
    xaxis: { categories: statusLabels.length ? statusLabels : ['No Data'], labels: { style: { colors: '#64748b', fontSize: '11px' } } },
    yaxis: { labels: { style: { colors: '#64748b', fontSize: '11px' } } },
    grid: { borderColor: '#f1f5f9' }
  };

  const sparklineOptions = (color, dataArr) => ({
    series: [{ data: dataArr && dataArr.length ? dataArr : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }],
    options: {
      chart: { type: 'line', width: 100, height: 35, sparkline: { enabled: true } },
      stroke: { width: 2, curve: 'smooth' },
      colors: [color],
      tooltip: { fixed: { enabled: false } },
    }
  });

  return (
    <Box pb="10">
      <Flex align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} justify="space-between" mb="6" gap="4">
        <VStack align="start" spacing="1">
          <Breadcrumb spacing="6px" separator={<ChevronRight size={11} color="#94a3b8" />} fontSize="xs" color="#94a3b8">
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/" display="flex" alignItems="center" gap="1" _hover={{ color: BRAND }}>
                <Icon as={LayoutDashboard} boxSize={3} /> Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink color={BRAND} fontWeight="600">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <HStack spacing="3" align="center">
            <Box w="4px" h="24px" bg={`linear-gradient(180deg, ${BRAND}, ${ACCENT})`} borderRadius="full" />
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" color="#1e293b">System Dashboard</Text>
          </HStack>
        </VStack>
        <HStack spacing="2" w={{ base: 'full', md: 'auto' }} justify={{ base: 'flex-start', md: 'flex-end' }}>
          <Button onClick={fetchData} isLoading={isLoading} leftIcon={<RotateCcw size={14} />} variant="ghost" size="sm" color="#64748b" borderRadius="lg" _hover={{ bg: '#f8faff', color: BRAND }} flex={{ base: 1, md: 'none' }}>
            Refresh
          </Button>
          <Button onClick={() => setShowFilters(!showFilters)} leftIcon={<Filter size={14} />} size="sm" variant={showFilters ? "solid" : "outline"} bg={showFilters ? BRAND : 'transparent'} color={showFilters ? 'white' : BRAND} borderColor={BRAND} borderRadius="lg" _hover={{ bg: showFilters ? '#003d91' : '#f0f5ff' }} flex={{ base: 1, md: 'none' }}>
            Filters
          </Button>
        </HStack>
      </Flex>

      <Collapse in={showFilters} animateOpacity>
        <Box bg="white" p={{ base: '4', md: '6' }} borderRadius="xl" mb="6" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
          <Flex align="center" gap="2" mb="5">
            <Box w="3px" h="18px" bg={BRAND} borderRadius="full" />
            <Text fontSize="sm" fontWeight="700" color="#1e293b">Filter & Search</Text>
          </Flex>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="4" mb="5">
            <FormControl>
              <FormLabel fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.8px" mb="1.5">Job Category</FormLabel>
              <Select name="category" value={filters.category} onChange={handleFilterChange} placeholder="Select Category" size="sm" bg="#f8faff" border="1.5px solid #dde6f5" borderRadius="lg" fontSize="sm">
                <option value="hotel">Hotel Job</option>
                <option value="home">Home Cook</option>
                <option value="daily">Daily Pay</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.8px" mb="1.5">Customer/Client</FormLabel>
              <Select name="customer" value={filters.customer} onChange={handleFilterChange} placeholder="Select Client" size="sm" bg="#f8faff" border="1.5px solid #dde6f5" borderRadius="lg" fontSize="sm">
                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.8px" mb="1.5">Job Position</FormLabel>
              <Select name="position" value={filters.position} onChange={handleFilterChange} placeholder="Select Position" size="sm" bg="#f8faff" border="1.5px solid #dde6f5" borderRadius="lg" fontSize="sm">
                {positions.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.8px" mb="1.5">Date</FormLabel>
              <Input name="date" value={filters.date} onChange={handleFilterChange} type="date" size="sm" bg="#f8faff" border="1.5px solid #dde6f5" borderRadius="lg" fontSize="sm" />
            </FormControl>
          </SimpleGrid>
          <HStack spacing="3">
            <Button onClick={handleSearch} isLoading={isLoading} leftIcon={<Search size={15} />} size="sm" bg={BRAND} color="white" px="6" borderRadius="lg" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Search</Button>
            <Button onClick={handleReset} leftIcon={<RotateCcw size={15} />} size="sm" variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" _hover={{ bg: '#f8faff', borderColor: BRAND, color: BRAND }}>Reset</Button>
          </HStack>
        </Box>
      </Collapse>

      <SimpleGrid columns={{ base: 2, sm: 2, md: 3, lg: 4 }} spacing={{ base: '3', md: '4' }} mb="8">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </SimpleGrid>

      {/* Position Distribution Table */}
      <Box bg="white" borderRadius="xl" overflow="hidden" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)" mb="8">
        <Flex align="center" justify="space-between" px={{ base: '4', md: '6' }} py="4" borderBottom="1px solid #f1f5f9">
          <HStack spacing="3">
            <Box w="3px" h="20px" bg={BRAND} borderRadius="full" />
            <Icon as={TrendingUp} boxSize={4} color={BRAND} />
            <Text fontSize="sm" fontWeight="700" color="#1e293b">Position Distribution Table</Text>
          </HStack>
          <Badge px="3" py="1" borderRadius="full" fontSize="10px" fontWeight="700" bg="#ecfdf5" color="#16a34a" border="1px solid #bbf7d0">
            ● Live
          </Badge>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr bg="#f8faff">
                {['Position', 'Jobs', 'Vacancy', 'Applied', 'Assigned', 'Demo', 'Reschedule', 'Rejected', 'On Hold', 'Hired', 'Action'].map((h, i) => (
                  <Th key={h} py="3.5" fontSize="10px" fontWeight="700" color="#64748b" letterSpacing="0.5px" textTransform="uppercase" isNumeric={i > 0 && i < 10} borderBottom="2px solid #e8edf5" textAlign={i === 10 ? 'center' : undefined}>
                    {h}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <Tr key={i}>
                    {Array(11).fill(0).map((__, idx) => (
                      <Td key={idx} py="4"><Skeleton height="14px" borderRadius="md" /></Td>
                    ))}
                  </Tr>
                ))
              ) : tableData?.length > 0 ? (
                tableData.map((row, index) => (
                  <Tr key={index} _hover={{ bg: '#f8faff' }} transition="background 0.15s" borderBottom="1px solid #f1f5f9">
                    <Td py="3.5" fontWeight="600" color="#1e293b" fontSize="sm">{row.position}</Td>
                    <Td isNumeric color="#475569" fontSize="sm">{row.jobs}</Td>
                    <Td isNumeric color="#475569" fontSize="sm">{row.vacancy}</Td>
                    <Td isNumeric fontSize="sm">
                      <Badge bg={row.applied > 0 ? '#e6eeff' : '#f8fafc'} color={row.applied > 0 ? BRAND : '#94a3b8'} borderRadius="md" px="2" fontSize="11px" fontWeight="700">{row.applied}</Badge>
                    </Td>
                    <Td isNumeric fontSize="sm">
                      <Badge bg={row.assigned > 0 ? '#f0fdf4' : '#f8fafc'} color={row.assigned > 0 ? '#16a34a' : '#94a3b8'} borderRadius="md" px="2" fontSize="11px" fontWeight="700">{row.assigned}</Badge>
                    </Td>
                    <Td isNumeric fontSize="sm">
                      <Badge bg={row.demo > 0 ? '#ecfdf5' : '#f8fafc'} color={row.demo > 0 ? '#10b981' : '#94a3b8'} borderRadius="md" px="2" fontSize="11px" fontWeight="700">{row.demo}</Badge>
                    </Td>
                    <Td isNumeric fontSize="sm">
                      <Badge bg={row.reschedule > 0 ? '#ecfeff' : '#f8fafc'} color={row.reschedule > 0 ? '#06b6d4' : '#94a3b8'} borderRadius="md" px="2" fontSize="11px" fontWeight="700">{row.reschedule}</Badge>
                    </Td>
                    <Td isNumeric fontSize="sm">
                      <Badge bg={row.rejected > 0 ? '#fff0f0' : '#f8fafc'} color={row.rejected > 0 ? ACCENT : '#94a3b8'} borderRadius="md" px="2" fontSize="11px" fontWeight="700">{row.rejected}</Badge>
                    </Td>
                    <Td isNumeric fontSize="sm" color="#94a3b8">{row.onHold}</Td>
                    <Td isNumeric fontSize="sm">
                      <Badge bg={row.hired > 0 ? '#f0fdf4' : '#f8fafc'} color={row.hired > 0 ? '#16a34a' : '#94a3b8'} borderRadius="md" px="2" fontSize="11px" fontWeight="700">{row.hired}</Badge>
                    </Td>
                    <Td textAlign="center">
                      <Button onClick={() => handleViewPositionJobs(row.position)} size="xs" bg={BRAND} color="white" borderRadius="md" _hover={{ bg: '#003d91' }} fontSize="10px" px="3">View Jobs</Button>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={11} py="10">
                    <VStack spacing="2">
                      <Icon as={AlertCircle} boxSize={8} color="#94a3b8" />
                      <Text color="#94a3b8" fontWeight="600">No matching records found for current filters</Text>
                      <Button size="xs" variant="link" color={BRAND} onClick={handleReset}>Clear all filters</Button>
                    </VStack>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
        <Flex justify="space-between" align="center" px={{ base: '4', md: '6' }} py="3" borderTop="1px solid #f1f5f9" bg="#fafbfc">
          <Text fontSize="xs" color="#94a3b8">Showing {tableData?.length || 0} entries</Text>
          <HStack spacing="1">
            <Button size="xs" variant="ghost" color="#64748b" borderRadius="md" _hover={{ bg: '#f0f5ff', color: BRAND }}>Prev</Button>
            <Button size="xs" bg={BRAND} color="white" borderRadius="md" _hover={{ bg: '#003d91' }} minW="7">1</Button>
            <Button size="xs" variant="ghost" color="#64748b" borderRadius="md" _hover={{ bg: '#f0f5ff', color: BRAND }}>Next</Button>
          </HStack>
        </Flex>
      </Box>

      {/* Performance Metrics Row */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: '4', md: '5' }} mb={{ base: '4', md: '5' }}>
        <Box bg="white" p={{ base: '4', md: '6' }} borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
          <SectionHeader icon={Activity} title="Success Percentage" />
          <Chart
            options={{
              chart: { type: 'donut', height: 220, fontFamily: 'Outfit, sans-serif' },
              colors: [BRAND, '#f1f5f9'],
              dataLabels: { enabled: false },
              legend: { show: false },
              plotOptions: {
                pie: {
                  donut: {
                    size: '80%',
                    labels: {
                      show: true,
                      total: {
                        show: true,
                        label: 'Success',
                        formatter: () => `${charts?.successPercentage ?? 0}%`
                      }
                    }
                  }
                }
              }
            }}
            series={[charts?.successPercentage ?? 0, Math.max(0, 100 - (charts?.successPercentage ?? 0))]}
            type="donut"
            height={220}
          />
        </Box>
        <Box bg="white" p={{ base: '4', md: '6' }} borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
          <SectionHeader icon={PieIcon} title="Application Status Overview" />
          <Chart options={{ ...columnChartOptions, xaxis: { categories: statusLabels } }} series={[{ name: 'Count', data: statusSeries }]} type="bar" height={220} />
        </Box>
        <Box bg="white" p={{ base: '4', md: '6' }} borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
          <SectionHeader icon={TrendingUp} title="Median Ratio" />
          <Chart
            options={{
              chart: { type: 'radialBar', height: 220, fontFamily: 'Outfit, sans-serif' },
              plotOptions: {
                radialBar: {
                  startAngle: -135,
                  endAngle: 135,
                  dataLabels: {
                    name: { show: true, color: '#64748b', fontSize: '12px' },
                    value: { formatter: (v) => v + '%', color: BRAND, fontSize: '20px', fontWeight: 700 }
                  }
                }
              },
              labels: ['Shortlisted']
            }}
            series={[charts?.medianRatio ?? 0]}
            type="radialBar"
            height={220}
          />
        </Box>
      </SimpleGrid>

      {/* Modal for Job Wise Details */}
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '6xl' }}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius={{ base: '0', md: 'xl' }} overflow="hidden" mx={{ base: '0', md: '4' }} my={{ base: '0', md: '4' }}>
          <ModalHeader bg="white" borderBottom="1px solid #f1f5f9" py="4" px={{ base: '4', md: '6' }}>
            <HStack justify="space-between">
              <HStack spacing="3">
                <Box w="3px" h="18px" bg={BRAND} borderRadius="full" />
                <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="800" color="#1e293b">Job Wise Details - {selectedPosition}</Text>
              </HStack>
              <IconButton icon={<X size={18} />} size="sm" variant="ghost" onClick={onClose} aria-label="close" />
            </HStack>
          </ModalHeader>
          <ModalBody p="0">
            <Box overflowX="auto" p={{ base: '3', md: '5' }}>
              <Table variant="simple" size="sm" border="1px solid #e8edf5" borderRadius="lg">
                <Thead>
                  <Tr bg="#f8faff">
                    {['Job Title', 'Vacancy', 'Applied', 'Assigned', 'Demo', 'Reschedule', 'Rejected', 'On Hold', 'Not Interested', 'Hired'].map((h, i) => (
                      <Th key={h} py="4" fontSize="10px" fontWeight="800" color="#1e293b" letterSpacing="0.5px" borderBottom="1px solid #e8edf5" isNumeric={i > 0}>
                        {h}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {isModalLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <Tr key={i}>
                        {Array(10).fill(0).map((__, idx) => (
                          <Td key={idx} py="4"><Skeleton height="12px" /></Td>
                        ))}
                      </Tr>
                    ))
                  ) : positionJobs.length > 0 ? (
                    positionJobs.map((job, index) => (
                      <Tr key={index} _hover={{ bg: '#f8faff' }}>
                        <Td py="4" fontWeight="600" color="#475569" fontSize="xs">{job.title}</Td>
                        <Td isNumeric fontSize="xs" color="#64748b" textAlign="center">{job.vacancy}</Td>
                        <Td isNumeric fontSize="xs" textAlign="center">{job.applied}</Td>
                        <Td isNumeric fontSize="xs" color="#16a34a" fontWeight="700" textAlign="center">{job.assigned}</Td>
                        <Td isNumeric fontSize="xs" color="#f59e0b" fontWeight="700" textAlign="center">{job.demo}</Td>
                        <Td isNumeric fontSize="xs" color="#ef4444" fontWeight="700" textAlign="center">{job.reschedule}</Td>
                        <Td isNumeric fontSize="xs" color="#ef4444" fontWeight="700" textAlign="center">{job.rejected}</Td>
                        <Td isNumeric fontSize="xs" color="#f59e0b" fontWeight="700" textAlign="center">{job.onHold}</Td>
                        <Td isNumeric fontSize="xs" color="#64748b" fontWeight="700" textAlign="center">{job.notInterested}</Td>
                        <Td isNumeric fontSize="xs" color="#16a34a" fontWeight="700" textAlign="center">{job.hired}</Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr><Td colSpan={10} py="8" textAlign="center" color="#94a3b8" fontSize="sm">No jobs found for this position.</Td></Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
            <Flex justify="flex-end" px={{ base: '4', md: '6' }} py="4" borderTop="1px solid #f1f5f9" bg="#fafbfc">
               <HStack spacing="1">
                  <Button size="xs" variant="outline" color="#64748b" borderRadius="md">Previous</Button>
                  <Button size="xs" bg={BRAND} color="white" borderRadius="md" px="3">1</Button>
                  <Button size="xs" variant="outline" color="#64748b" borderRadius="md">Next</Button>
               </HStack>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Advanced Trends & Growth Analysis */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: '4', md: '5' }} mb={{ base: '4', md: '5' }}>
        <Box bg="white" p={{ base: '4', md: '6' }} borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
          <SectionHeader icon={Activity} title="Application Growth" />
          <Chart options={lineChartOptions} series={[{ name: 'Applications', data: growthSeries }]} type="line" height={220} />
        </Box>
        <Box bg="white" p={{ base: '4', md: '6' }} borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
          <SectionHeader icon={Activity} title="Sparkline Trends" />
          <VStack spacing="4" align="stretch" pt="4">
            {[
              { label: 'Daily Visitors',      color: '#3b82f6', data: charts?.sparklines?.dailyCandidates    },
              { label: 'Total Applications',  color: '#10b981', data: charts?.sparklines?.dailyApplications  },
              { label: 'Interview Success',   color: '#f59e0b', data: charts?.sparklines?.dailyDemo          },
              { label: 'Hiring Rate',         color: '#ef4444', data: charts?.sparklines?.dailyHired         },
            ].map(({ label, color, data }) => (
              <Flex key={label} justify="space-between" align="center">
                <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="600" color="#475569">{label}</Text>
                <Chart
                  options={sparklineOptions(color, data).options}
                  series={sparklineOptions(color, data).series}
                  type="line"
                  width={100}
                  height={40}
                />
              </Flex>
            ))}
          </VStack>
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: '4', md: '5' }} mb={{ base: '4', md: '5' }}>
        <Box bg="white" p={{ base: '4', md: '6' }} borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
          <SectionHeader icon={PieIcon} title="Category Analysis" />
          <Chart options={pieChartOptions} series={categorySeries.length ? categorySeries : [1]} type="donut" height={220} />
        </Box>
        <Box bg="white" p={{ base: '4', md: '6' }} borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
          <SectionHeader icon={Activity} title="Performance" />
          <Chart
            options={{
              chart: { type: 'radialBar', height: 220, fontFamily: 'Outfit, sans-serif' },
              plotOptions: {
                radialBar: {
                  dataLabels: {
                    name: { show: true, color: '#64748b', fontSize: '12px' },
                    value: { formatter: (v) => v + '%', color: BRAND, fontSize: '22px', fontWeight: 700 }
                  }
                }
              },
              colors: [BRAND],
              labels: ['Growth']
            }}
            series={[charts?.performanceScore ?? 0]}
            type="radialBar"
            height={220}
          />
        </Box>
        <Box bg="#111827" p={{ base: '4', md: '6' }} borderRadius="xl" border="1px solid #1f2937" boxShadow="0 2px 8px rgba(0,0,0,0.2)">
          <Flex align="center" justify="space-between" mb="4">
            <HStack spacing="3">
              <Box w="3px" h="20px" bg="#3b82f6" borderRadius="full" />
              <Icon as={Activity} boxSize={4} color="white" />
              <Text fontSize="sm" fontWeight="700" color="white">Radar Analysis</Text>
            </HStack>
          </Flex>
          <Chart
            options={{
              chart: { type: 'radar', toolbar: { show: false }, fontFamily: 'Outfit, sans-serif' },
              colors: ['#3b82f6'],
              xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                labels: { style: { colors: '#fff', fontSize: '12px' } }
              },
              yaxis: { show: false },
              fill: { opacity: 0.2 },
              stroke: { width: 2 },
              markers: { size: 4 }
            }}
            series={[{ name: 'Applications', data: charts?.radarData?.length ? charts.radarData : [0, 0, 0, 0, 0, 0] }]}
            type="radar"
            height={220}
          />
        </Box>
      </SimpleGrid>

    </Box>
  );
};

export default Dashboard;
