import { useState, useEffect } from 'react';
import {
  Box, SimpleGrid, Text, Flex, Icon, HStack, VStack,
  Table, Thead, Tbody, Tr, Th, Td, Button, Select, Input,
  FormControl, FormLabel, Badge, IconButton, Skeleton, useToast, Spinner, Collapse,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  useDisclosure, Grid, GridItem
} from '@chakra-ui/react';
import {
  LayoutDashboard, Users, Briefcase, Calendar, CalendarClock,
  Search, RotateCcw, ChevronRight, Filter, FileText, UserPlus, Clock,
  Activity, TrendingUp, TrendingDown, AlertCircle, X, Banknote, CheckCircle,
  Home, Building2, Sun, Tag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';
import axios from 'axios';

import API_BASE_URL from '../apiConfig';

const BRAND = '#004aad';
const ACCENT = '#f59e0b';

// Metric Pill component (Quick Filter/Search helper)
const MetricPill = ({ label, value, icon, color, bg }) => (
  <Flex
    align="center"
    bg={bg}
    px="4"
    py="2.5"
    borderRadius="full"
    border="1.5px solid transparent"
    transition="all 0.2s"
    cursor="pointer"
    _hover={{ transform: 'translateY(-1.5px)', boxShadow: 'xs', borderColor: color }}
    gap="3"
    flexShrink={0}
  >
    <Icon as={icon} color={color} boxSize={4} />
    <Text fontSize="xs" fontWeight="700" color="#475569" whiteSpace="nowrap">{label}</Text>
    <Badge bg={color} color="white" borderRadius="md" px="2" py="0.5" fontSize="10px" fontWeight="800">
      {value}
    </Badge>
  </Flex>
);

// Stat Card component with trend indicator and hover effect
const StatCard = ({ title, value, icon, color, trend }) => {
  return (
    <HStack
      bg="white"
      p="4.5"
      borderRadius="2xl"
      border="1.5px solid #e2e8f0"
      spacing="3.5"
      align="center"
      flex="1"
      transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{ transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(0,74,173,0.08)', borderColor: '#cbd5e1' }}
      overflow="hidden"
      minH="110px"
    >
      <Flex 
        w="12" 
        h="12" 
        bg={color} 
        borderRadius="full" 
        align="center" 
        justify="center" 
        flexShrink={0}
      >
        <Icon as={icon} color="white" boxSize="20px" />
      </Flex>
      <VStack align="start" spacing="0.5" flex="1" overflow="hidden">
        <Text 
          color="#64748b" 
          fontSize="xs" 
          fontWeight="600"
          lineHeight="1.2"
          noOfLines={1}
        >
          {title}
        </Text>
        <Text 
          fontSize="xl" 
          fontWeight="800" 
          color="#1e293b" 
          lineHeight="1.1"
          noOfLines={1}
        >
          {value}
        </Text>
        <HStack spacing="1" align="center" mt="0.5">
          <Icon as={TrendingUp} color="#10b981" boxSize="11px" flexShrink={0} />
          <Text fontSize="9px" fontWeight="800" color="#10b981" whiteSpace="nowrap">{trend}</Text>
          <Text fontSize="9px" color="#94a3b8" fontWeight="600" whiteSpace="nowrap">from last month</Text>
        </HStack>
      </VStack>
    </HStack>
  );
};

const SectionHeader = ({ title, rightElement }) => (
  <HStack justify="space-between" width="100%" mb="5" align="center">
    <HStack spacing="2.5" align="center">
      <Box w="3px" h="18px" bg={BRAND} borderRadius="full" />
      <Text fontSize="xs" fontWeight="800" color="#1e293b" letterSpacing="0.5px" textTransform="uppercase">
        {title}
      </Text>
    </HStack>
    {rightElement}
  </HStack>
);

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [positions, setPositions] = useState([]);

  // Modal States for drilling down
  const [donutInterval, setDonutInterval] = useState('month');
  const [lineInterval, setLineInterval] = useState('month');
  const [performanceInterval, setPerformanceInterval] = useState('month');
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
  const token = localStorage.getItem('adminToken');

  const fetchData = async () => {
    if (!token) {
      toast({ title: 'Not authenticated', description: 'Please login first', status: 'error', duration: 3000 });
      return;
    }
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
      console.error('Dashboard fetch error:', error.response?.status, error.message);
      toast({ title: 'Error fetching dashboard data', description: error.response?.data?.message || error.message, status: 'error', duration: 3000 });
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
      .catch(() => { })
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

  const { stats, charts, tableData, categoryPerformance, recentJobs, recentTrials, latestTransactions } = data || {};

  // Formatter for currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Stat Cards Mapping
  const statCards = [
    { title: 'Total Jobs Posted', value: stats?.totalJobs || 0, icon: Briefcase, color: '#6366f1', trend: '12.5%' },
    { title: 'Total Trials / Demo', value: (stats?.demoScheduled || 0) + (stats?.rescheduleRequested || 0), icon: CalendarClock, color: '#7c3aed', trend: '8.6%' },
    { title: 'Candidates Added', value: stats?.totalCandidates || 0, icon: Users, color: '#2563eb', trend: '15.3%' },
    { title: 'Customers Added', value: stats?.totalCustomers || 0, icon: Users, color: '#f59e0b', trend: '10.8%' },
    { title: 'Total Transactions', value: formatCurrency(stats?.totalTransactions || 0), icon: Banknote, color: '#ef4444', trend: '18.6%' },
    { title: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, icon: CheckCircle, color: '#06b6d4', trend: '9.7%' },
  ];

  // Chart Data Formatting
  const catNames = { hotel: 'Commercial Jobs', home: 'Domestic Jobs', daily: 'Daily Pay' };
  
  let activeCategoryDistribution = [];
  if (charts?.categoryDistribution) {
    if (Array.isArray(charts.categoryDistribution)) {
      activeCategoryDistribution = charts.categoryDistribution;
    } else {
      activeCategoryDistribution = charts.categoryDistribution[donutInterval] || charts.categoryDistribution.all || [];
    }
  }

  const categoryLabels = activeCategoryDistribution.map(c => catNames[c._id] || c._id) || [];
  const categorySeries = activeCategoryDistribution.map(c => c.count) || [];

  let activeCategoryPerformance = [];
  if (categoryPerformance) {
    if (Array.isArray(categoryPerformance)) {
      activeCategoryPerformance = categoryPerformance;
    } else {
      activeCategoryPerformance = categoryPerformance[performanceInterval] || categoryPerformance.all || [];
    }
  }

  const growthLabels = charts?.applicationGrowth?.map(g => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[g._id.month - 1]} ${g._id.year}`;
  }) || [];
  const growthSeries = charts?.applicationGrowth?.map(g => g.count) || [];

  // Resolve Trend Chart based on lineInterval selector (Year shows 6-Month growth, Month shows weekly trend)
  let activeLineSeries = [];
  let activeLineCategories = [];
  if (lineInterval === 'year') {
    activeLineSeries = [{ name: 'Applications', data: growthSeries }];
    activeLineCategories = growthLabels.length ? growthLabels : ['No Data'];
  } else {
    activeLineSeries = charts?.trendOverview?.series || [];
    activeLineCategories = charts?.trendOverview?.labels || ['1 May', '8 May', '15 May', '22 May', '31 May'];
  }

  // ApexCharts Options
  const pieChartOptions = {
    chart: { type: 'donut', height: 260, fontFamily: 'Outfit, sans-serif' },
    labels: categoryLabels.length ? categoryLabels : ['No Data'],
    colors: ['#2563eb', '#10b981', '#f59e0b', '#94a3b8'],
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: false
          }
        }
      }
    }
  };

  const lineChartOptions = {
    chart: { type: 'line', height: 260, toolbar: { show: false }, fontFamily: 'Outfit, sans-serif' },
    colors: ['#2563eb', '#10b981', '#f59e0b'],
    stroke: { width: 3, curve: 'smooth' },
    xaxis: { 
      categories: activeLineCategories, 
      labels: { style: { colors: '#64748b', fontSize: '11px' } } 
    },
    yaxis: { labels: { style: { colors: '#64748b', fontSize: '11px' } } },
    grid: { borderColor: '#f1f5f9' },
    markers: { size: 4, colors: ['#fff'], strokeColors: ['#2563eb', '#10b981', '#f59e0b'], strokeWidth: 2, hover: { size: 6 } },
    legend: { position: 'top', fontSize: '11px', fontWeight: 600, labels: { colors: '#475569' } }
  };

  return (
    <Box pb="12" px={{ base: 1, md: 3 }}>
      {/* Upper header action area */}
      <Flex align="center" justify="space-between" mb="8">
        <VStack align="start" spacing="1">
          <Text fontSize="3xl" fontWeight="950" color="#1e293b" letterSpacing="-0.8px">Dashboard</Text>
          <Text fontSize="xs" fontWeight="700" color="#94a3b8">Welcome back, Admin!</Text>
        </VStack>
        <HStack spacing="3">
          <Button onClick={fetchData} isLoading={isLoading} leftIcon={<RotateCcw size={14} />} variant="outline" size="sm" borderColor="#e2e8f0" bg="white" color="#64748b" borderRadius="xl" px="4" _hover={{ bg: '#f8faff', color: BRAND }}>
            Refresh
          </Button>
        </HStack>
      </Flex>

      {/* High-Fidelity Apply Filter Box */}
      <Box bg="white" p="6" borderRadius="2xl" mb="8" border="1.5px solid #e2e8f0" boxShadow="sm">
        <Flex direction={{ base: 'column', lg: 'row' }} align={{ base: 'stretch', lg: 'center' }} gap="4">
          <Text fontSize="sm" fontWeight="900" color="#1e293b" minW="100px" mr="2">
            Apply Filter
          </Text>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4" flex="1">
            {/* Date Range Dropdown with Icon */}
            <HStack height="14" border="1.5px solid #e2e8f0" borderRadius="xl" px="4" spacing="3" bg="#f8fafc">
              <Icon as={Calendar} color="#64748b" boxSize={4} />
              <VStack align="start" spacing="0.5" flex="1">
                <Text fontSize="9px" fontWeight="800" color="#94a3b8" textTransform="uppercase" letterSpacing="0.3px">Date Range</Text>
                <Select name="date" value={filters.date} onChange={handleFilterChange} variant="unstyled" fontSize="xs" fontWeight="700" color="#1e293b" placeholder="This Month" width="100%">
                  <option value="">This Month</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                </Select>
              </VStack>
            </HStack>

            {/* Lead Manager Dropdown with Icon */}
            <HStack height="14" border="1.5px solid #e2e8f0" borderRadius="xl" px="4" spacing="3" bg="#f8fafc">
              <Icon as={Users} color="#64748b" boxSize={4} />
              <VStack align="start" spacing="0.5" flex="1">
                <Text fontSize="9px" fontWeight="800" color="#94a3b8" textTransform="uppercase" letterSpacing="0.3px">Lead Manager</Text>
                <Select name="customer" value={filters.customer} onChange={handleFilterChange} variant="unstyled" fontSize="xs" fontWeight="700" color="#1e293b" placeholder="All Lead Managers" width="100%">
                  {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </Select>
              </VStack>
            </HStack>

            {/* Category Dropdown with Icon */}
            <HStack height="14" border="1.5px solid #e2e8f0" borderRadius="xl" px="4" spacing="3" bg="#f8fafc">
              <Icon as={Tag} color="#64748b" boxSize={4} />
              <VStack align="start" spacing="0.5" flex="1">
                <Text fontSize="9px" fontWeight="800" color="#94a3b8" textTransform="uppercase" letterSpacing="0.3px">Category</Text>
                <Select name="category" value={filters.category} onChange={handleFilterChange} variant="unstyled" fontSize="xs" fontWeight="700" color="#1e293b" placeholder="All Categories" width="100%">
                  <option value="hotel">Commercial Jobs</option>
                  <option value="home">Domestic Jobs</option>
                  <option value="daily">Daily Pay</option>
                </Select>
              </VStack>
            </HStack>
          </SimpleGrid>

          <HStack spacing="3" align="center" ml={{ lg: "4" }} width={{ base: 'full', lg: 'auto' }}>
            <Button onClick={handleSearch} isLoading={isLoading} size="md" bg="#2563eb" color="white" px="8" borderRadius="xl" _hover={{ bg: '#1d4ed8' }} flex={{ base: 1, lg: 'none' }} fontSize="xs" fontWeight="800" height="12">Apply</Button>
            <Button onClick={handleReset} size="md" variant="ghost" bg="#f1f5f9" color="#64748b" px="8" borderRadius="xl" _hover={{ bg: '#e2e8f0' }} flex={{ base: 1, lg: 'none' }} fontSize="xs" fontWeight="800" height="12">Reset</Button>
          </HStack>
        </Flex>
      </Box>

      {/* Metric Pills Quick Counters Row with robust Scroll Protection */}
      <Box bg="white" p="4" borderRadius="2xl" border="1.5px solid #e2e8f0" mb="8" overflowX="auto" css={{
        '&::-webkit-scrollbar': { height: '5px' },
        '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '10px' },
        '&::-webkit-scrollbar-track': { background: '#f8fafc' }
      }}>
        <HStack spacing="4" minW="max-content" align="center">
          <Text fontSize="xs" fontWeight="900" color="#1e293b" letterSpacing="0.3px" pr="2" borderRight="2px solid #e2e8f0" mr="1">Search By</Text>
          <MetricPill label="Job Posted" value={stats?.totalJobs || 0} icon={Briefcase} color="#2563eb" bg="#eff6ff" />
          <MetricPill label="Trial / Demo" value={stats?.demoScheduled || 0} icon={Calendar} color="#7c3aed" bg="#f5f3ff" />
          <MetricPill label="Candidate Added" value={stats?.totalCandidates || 0} icon={UserPlus} color="#10b981" bg="#f0fdf4" />
          <MetricPill label="Customers Added" value={stats?.totalCustomers || 0} icon={Users} color="#f59e0b" bg="#fff7ed" />
          <MetricPill label="Transactions" value={formatCurrency(stats?.totalTransactions || 0)} icon={Banknote} color="#ef4444" bg="#fff5f5" />
          <MetricPill label="Package / Subscription" value={stats?.activeSubscriptions || 0} icon={CheckCircle} color="#06b6d4" bg="#ecfeff" />
        </HStack>
      </Box>

      {/* Main Grid: 6 Premium Stat Cards (Responsive column wrapping) */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 6 }} spacing="5" mb="8">
        {statCards.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </SimpleGrid>

      {/* Middle Grid: Charts & Category Performance Table */}
      <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap="6" mb="8">
        {/* Category Wise Jobs (Donut Chart) */}
        <GridItem bg="white" p="4" borderRadius="2xl" border="1.5px solid #e2e8f0" boxShadow="xs">
          <SectionHeader 
            title="Category Wise Jobs" 
            rightElement={
              <Select 
                size="xs" 
                width="auto" 
                minW="80px" 
                borderRadius="lg" 
                borderColor="#e2e8f0" 
                bg="white" 
                fontSize="9px" 
                fontWeight="700"
                color="#475569"
                value={donutInterval}
                onChange={(e) => setDonutInterval(e.target.value)}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </Select>
            }
          />
          <HStack spacing="3" width="100%" height="240px" align="center" justify="space-between">
            <Box flex="1.2" display="flex" justifyContent="center" minW="0" position="relative" alignItems="center">
              <Chart options={pieChartOptions} series={categorySeries.length ? categorySeries : [0, 0, 0]} type="donut" width="185px" height={190} />
              <VStack position="absolute" spacing="0" justify="center" align="center" pointerEvents="none">
                <Text fontSize="22px" fontWeight="900" color="#1e293b" lineHeight="1">
                  {categorySeries.reduce((a, b) => a + b, 0)}
                </Text>
                <Text fontSize="10.5px" fontWeight="600" color="#64748b" mt="1">
                  Total Jobs
                </Text>
              </VStack>
            </Box>
            <VStack spacing="3" align="stretch" flex="1" pr="1" minW="0">
              {activeCategoryDistribution?.map((c, idx) => {
                const name = catNames[c._id] || c._id;
                const count = c.count;
                const total = categorySeries.reduce((a, b) => a + b, 0);
                const percent = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                const colors = ['#2563eb', '#10b981', '#f59e0b', '#94a3b8'];
                const color = colors[idx % colors.length];
                
                return (
                  <HStack key={c._id} justify="space-between" width="100%">
                    <HStack spacing="2" align="center" minW="0">
                      <Box w="2.5" h="2.5" borderRadius="full" bg={color} flexShrink={0} />
                      <Text color="#475569" fontSize="10.5px" fontWeight="600" isTruncated>{name}</Text>
                    </HStack>
                    <HStack spacing="1" align="baseline" flexShrink={0}>
                      <Text color="#1e293b" fontSize="11px" fontWeight="800">{count}</Text>
                      <Text color="#94a3b8" fontSize="9.5px" fontWeight="500">({percent}%)</Text>
                    </HStack>
                  </HStack>
                );
              })}
            </VStack>
          </HStack>
        </GridItem>

        {/* Jobs Trend Overview (Line Chart) */}
        <GridItem bg="white" p="6" borderRadius="2xl" border="1.5px solid #e2e8f0" boxShadow="xs">
          <SectionHeader 
            title="Jobs Trend Overview" 
            rightElement={
              <Select 
                size="xs" 
                width="auto" 
                minW="80px" 
                borderRadius="lg" 
                borderColor="#e2e8f0" 
                bg="white" 
                fontSize="9px" 
                fontWeight="700"
                color="#475569"
                value={lineInterval}
                onChange={(e) => setLineInterval(e.target.value)}
              >
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </Select>
            }
          />
          <Box h="260px">
            <Chart options={lineChartOptions} series={activeLineSeries} type="line" width="100%" height={240} />
          </Box>
        </GridItem>

        {/* Category Performance (Table with Icons) */}
        <GridItem bg="white" p="4" borderRadius="2xl" border="1.5px solid #e2e8f0" boxShadow="xs" display="flex" flexDirection="column">
          <SectionHeader 
            title="Category Performance" 
            rightElement={
              <Select 
                size="xs" 
                width="auto" 
                minW="80px" 
                borderRadius="lg" 
                borderColor="#e2e8f0" 
                bg="white" 
                fontSize="9px" 
                fontWeight="700"
                color="#475569"
                value={performanceInterval}
                onChange={(e) => setPerformanceInterval(e.target.value)}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </Select>
            }
          />
          <Box flex="1" overflowY="auto">
            <Table variant="simple" size="sm" layout="fixed" width="100%">
              <Thead>
                <Tr bg="#f8fafc">
                  <Th fontSize="10px" fontWeight="800" color="#64748b" py="3.5" px="0.5" width="30%" textTransform="none" letterSpacing="0">Category</Th>
                  <Th fontSize="10px" fontWeight="800" color="#64748b" py="3.5" px="0.5" width="14%" textTransform="none" letterSpacing="0" isNumeric>Jobs</Th>
                  <Th fontSize="10px" fontWeight="800" color="#64748b" py="3.5" px="0.5" width="15%" textTransform="none" letterSpacing="0" isNumeric>Trials</Th>
                  <Th fontSize="10px" fontWeight="800" color="#64748b" py="3.5" px="0.5" width="15%" textTransform="none" letterSpacing="0" isNumeric>Hired</Th>
                  <Th fontSize="10px" fontWeight="800" color="#64748b" py="3.5" px="0.5" width="26%" textTransform="none" letterSpacing="0" isNumeric>Revenue</Th>
                </Tr>
              </Thead>
              <Tbody>
                {activeCategoryPerformance?.map((row, idx) => {
                  const isCommercial = row.category.toLowerCase().includes('comm');
                  const isDomestic = row.category.toLowerCase().includes('dom');
                  return (
                    <Tr key={idx} _hover={{ bg: '#f8fafc' }} transition="all 0.15s">
                      <Td fontWeight="800" color="#1e293b" py="3" px="0.5" fontSize="10px" overflow="hidden" whiteSpace="nowrap">
                        <HStack spacing="1.5" align="center">
                          <Icon
                            as={isCommercial ? Building2 : isDomestic ? Home : Sun}
                            color={isCommercial ? '#2563eb' : isDomestic ? '#10b981' : '#f59e0b'}
                            boxSize={3.5}
                            flexShrink={0}
                          />
                          <Text fontSize="10px" fontWeight="700">{row.category}</Text>
                        </HStack>
                      </Td>
                      <Td isNumeric color="#475569" py="3" px="0.5" fontSize="10px">{row.jobsPosted}</Td>
                      <Td isNumeric color="#475569" py="3" px="0.5" fontSize="10px">{row.trials}</Td>
                      <Td isNumeric py="3" px="0.5" fontSize="10px">
                        <Badge colorScheme="green" variant="subtle" borderRadius="md" px="1.5" fontSize="9px">{row.hired}</Badge>
                      </Td>
                      <Td isNumeric color="#2563eb" fontWeight="800" py="3" px="0.5" fontSize="10px" whiteSpace="nowrap">{formatCurrency(row.revenue)}</Td>
                    </Tr>
                  );
                })}
                {/* Total row */}
                <Tr bg="#f8fafc" fontWeight="900">
                  <Td color="#1e293b" fontSize="10px" py="3" px="0.5">Total</Td>
                  <Td isNumeric fontSize="10px" py="3" px="0.5">
                    {activeCategoryPerformance?.reduce((acc, r) => acc + r.jobsPosted, 0) || 0}
                  </Td>
                  <Td isNumeric fontSize="10px" py="3" px="0.5">
                    {activeCategoryPerformance?.reduce((acc, r) => acc + r.trials, 0) || 0}
                  </Td>
                  <Td isNumeric fontSize="10px" py="3" px="0.5">
                    {activeCategoryPerformance?.reduce((acc, r) => acc + r.hired, 0) || 0}
                  </Td>
                  <Td isNumeric color="#2563eb" fontSize="10px" py="3" px="0.5" whiteSpace="nowrap">
                    {formatCurrency(activeCategoryPerformance?.reduce((acc, r) => acc + r.revenue, 0) || 0)}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </GridItem>
      </Grid>

      {/* Position Distribution Collapse Button */}
      <Box mb="8" textAlign="right">
        <Button
          onClick={() => handleViewPositionJobs(positions[0]?.name || '')}
          size="sm"
          variant="outline"
          borderColor="#2563eb"
          color="#2563eb"
          _hover={{ bg: '#f0f5ff' }}
          rightIcon={<ChevronRight size={14} />}
        >
          View Position Distribution
        </Button>
      </Box>

      {/* Bottom Grid: 3-Column Tables (Enhanced Widths and Spacings to prevent wrap clutters) */}
      <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap="6" mb="8">
        {/* Recent Jobs Posted */}
        <Box bg="white" p="4" borderRadius="2xl" border="1.5px solid #e2e8f0" display="flex" flexDirection="column" boxShadow="xs">
          <Flex align="center" justify="space-between" mb="4">
            <SectionHeader title="Recent Job Posted" />
            <Link to="/jobs/list">
              <Text fontSize="11px" color={BRAND} fontWeight="800" _hover={{ color: ACCENT }}>View All</Text>
            </Link>
          </Flex>
          <Box overflowX="auto" css={{
            '&::-webkit-scrollbar': { height: '3px' },
            '&::-webkit-scrollbar-thumb': { background: '#e2e8f0' }
          }}>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="#f8fafc">
                  <Th fontSize="9px" fontWeight="800" color="#64748b" py="3" px="2" whiteSpace="nowrap">Job Title</Th>
                  <Th fontSize="9px" fontWeight="800" color="#64748b" py="3" px="2" whiteSpace="nowrap">Category</Th>
                  <Th fontSize="9px" fontWeight="800" color="#64748b" py="3" px="2" whiteSpace="nowrap">Type</Th>
                  <Th fontSize="9px" fontWeight="800" color="#64748b" py="3" px="2" isNumeric whiteSpace="nowrap">Apps</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentJobs?.map((job, idx) => (
                  <Tr key={idx} _hover={{ bg: '#f8fafc' }}>
                    <Td fontWeight="750" color="#1e293b" fontSize="10.5px" py="3.5" px="2" noOfLines={1} maxW="110px" whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
                      {job.title}
                    </Td>
                    <Td py="3.5" px="2">
                      <Badge
                        fontSize="9px"
                        fontWeight="800"
                        colorScheme={job.jobCategory === 'hotel' ? 'blue' : job.jobCategory === 'home' ? 'green' : 'orange'}
                        variant="solid"
                        px="1.5"
                        borderRadius="md"
                        whiteSpace="nowrap"
                      >
                        {job.jobCategory === 'hotel' ? 'Comm' : job.jobCategory === 'home' ? 'Dom' : 'Daily'}
                      </Badge>
                    </Td>
                    <Td py="3.5" px="2">
                      <Badge
                        fontSize="9px"
                        fontWeight="700"
                        colorScheme={job.jobType.toLowerCase().includes('full') ? 'purple' : job.jobType.toLowerCase().includes('part') ? 'pink' : 'yellow'}
                        variant="subtle"
                        px="1.5"
                        borderRadius="md"
                        whiteSpace="nowrap"
                      >
                        {job.jobType.replace(' Time', '')}
                      </Badge>
                    </Td>
                    <Td isNumeric py="3.5" px="2" fontWeight="850" color={BRAND} fontSize="11px">{job.applicationsCount}</Td>
                  </Tr>
                ))}
                {(!recentJobs || recentJobs.length === 0) && (
                  <Tr><Td colSpan="4" py="4" textAlign="center" fontSize="xs" color="#94a3b8">No recent jobs found.</Td></Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Recent Trials / Demo */}
        <Box bg="white" p="4" borderRadius="2xl" border="1.5px solid #e2e8f0" display="flex" flexDirection="column" boxShadow="xs">
          <Flex align="center" justify="space-between" mb="4">
            <SectionHeader title="Recent Trials / Demo" />
            <Link to="/candidates/demo-scheduled">
              <Text fontSize="11px" color={BRAND} fontWeight="800" _hover={{ color: ACCENT }}>View All</Text>
            </Link>
          </Flex>
          <Box overflowX="auto" css={{
            '&::-webkit-scrollbar': { height: '3px' },
            '&::-webkit-scrollbar-thumb': { background: '#e2e8f0' }
          }}>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="#f8fafc">
                  <Th fontSize="9px" fontWeight="800" color="#64748b" py="3" px="2" whiteSpace="nowrap">Job Title</Th>
                  <Th fontSize="9px" fontWeight="800" color="#64748b" py="3" px="2" whiteSpace="nowrap">Candidate</Th>
                  <Th fontSize="9px" fontWeight="800" color="#64748b" py="3" px="2" whiteSpace="nowrap">Trial Date</Th>
                  <Th fontSize="9px" fontWeight="800" color="#64748b" py="3" px="2" whiteSpace="nowrap">Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentTrials?.map((trial, idx) => (
                  <Tr key={idx} _hover={{ bg: '#f8fafc' }}>
                    <Td fontWeight="750" color="#1e293b" fontSize="10.5px" py="3.5" px="2" noOfLines={1} maxW="90px" whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
                      {trial.title}
                    </Td>
                    <Td color="#475569" fontSize="10.5px" py="3.5" px="2" whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" maxW="80px">{trial.candidateName}</Td>
                    <Td color="#64748b" fontSize="10.5px" py="3.5" px="2" whiteSpace="nowrap">{trial.trialDate}</Td>
                    <Td py="3.5" px="2">
                      <Badge
                        fontSize="9px"
                        fontWeight="800"
                        colorScheme={trial.status === 'Demo Scheduled' ? 'purple' : trial.status === 'Hired' ? 'green' : 'orange'}
                        variant="solid"
                        px="1.5"
                        borderRadius="md"
                        whiteSpace="nowrap"
                      >
                        {trial.status === 'Demo Scheduled' ? 'Sched' : trial.status === 'Reschedule Requested' ? 'Resch' : trial.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
                {(!recentTrials || recentTrials.length === 0) && (
                  <Tr><Td colSpan="4" py="4" textAlign="center" fontSize="xs" color="#94a3b8">No recent trials scheduled.</Td></Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Latest Transactions */}
        <Box bg="white" p="4" borderRadius="2xl" border="1.5px solid #e2e8f0" display="flex" flexDirection="column" boxShadow="xs">
          <Flex align="center" justify="space-between" mb="4">
            <SectionHeader title="Latest Transactions" />
            <Link to="/finance">
              <Text fontSize="11px" color={BRAND} fontWeight="800" _hover={{ color: ACCENT }}>View All</Text>
            </Link>
          </Flex>
          <Box overflowX="auto" css={{
            '&::-webkit-scrollbar': { height: '3px' },
            '&::-webkit-scrollbar-thumb': { background: '#e2e8f0' }
          }}>
            <Table variant="simple" size="sm" layout="fixed" width="100%">
              <Thead>
                <Tr bg="#f8fafc">
                  <Th fontSize="9px" fontWeight="800" color="#64748b" py="3.5" px="1" width="34%" textTransform="none" letterSpacing="0">Invoice No</Th>
                  <Th fontSize="9px" fontWeight="800" color="#64748b" py="3.5" px="1" width="28%" textTransform="none" letterSpacing="0">Customer</Th>
                  <Th fontSize="9px" fontWeight="800" color="#64748b" py="3.5" px="1" width="22%" textTransform="none" letterSpacing="0" isNumeric>Amount</Th>
                  <Th fontSize="9px" fontWeight="800" color="#64748b" py="3.5" px="1" width="16%" textTransform="none" letterSpacing="0">Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {latestTransactions?.map((tx, idx) => {
                  const displayInvoice = tx.invoiceNo.replace('order_', '').replace('OFFLINE_', '');
                  const shortInvoice = displayInvoice.length > 10 ? `INV-${displayInvoice.slice(-8).toUpperCase()}` : tx.invoiceNo;
                  return (
                    <Tr key={idx} _hover={{ bg: '#f8fafc' }}>
                      <Td fontWeight="800" color="#2563eb" fontSize="10px" py="3.5" px="1" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" title={tx.invoiceNo}>
                        {shortInvoice}
                      </Td>
                      <Td color="#475569" fontSize="10px" py="3.5" px="1" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" title={tx.customer}>
                        {tx.customer}
                      </Td>
                      <Td isNumeric color="#1e293b" fontWeight="900" fontSize="10px" py="3.5" px="1" whiteSpace="nowrap">{formatCurrency(tx.amount)}</Td>
                      <Td py="3.5" px="1">
                        <Badge fontSize="9px" fontWeight="800" bg="#10b981" color="white" variant="solid" px="1.5" borderRadius="md" whiteSpace="nowrap">Paid</Badge>
                      </Td>
                    </Tr>
                  );
                })}
                {(!latestTransactions || latestTransactions.length === 0) && (
                  <Tr><Td colSpan="4" py="4" textAlign="center" fontSize="xs" color="#94a3b8">No transactions found.</Td></Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Grid>

      {/* Bottom Sticky-like Row of Quick Metrics */}
      <Box mt="10" pt="6" borderTop="2px solid #e2e8f0">
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 6 }} spacing="4">
          {statCards.map((stat, idx) => (
            <HStack key={idx} bg="white" p="4" borderRadius="xl" border="1px solid #e2e8f0" spacing="3" boxShadow="xs">
              <Flex w="8.5" h="8.5" bg={`${stat.color}15`} borderRadius="full" align="center" justify="center" flexShrink={0} p="1">
                <Icon as={stat.icon} color={stat.color} boxSize={3.5} />
              </Flex>
              <VStack align="start" spacing="0" flex="1" overflow="hidden">
                <Text color="#94a3b8" fontSize="8.5px" fontWeight="800" textTransform="uppercase" noOfLines={1}>{stat.title}</Text>
                <HStack spacing="2" align="baseline" width="100%">
                  <Text fontSize="13px" fontWeight="900" color="#1e293b" noOfLines={1}>{stat.value}</Text>
                  <Text fontSize="8.5px" fontWeight="850" color="#10b981" whiteSpace="nowrap">▲ {stat.trend}</Text>
                </HStack>
              </VStack>
            </HStack>
          ))}
        </SimpleGrid>
      </Box>

      {/* Drill-down Modal for Position-wise details */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" overflow="hidden" my="4">
          <ModalHeader bg="white" borderBottom="1px solid #f1f5f9" py="4" px="6">
            <HStack justify="space-between">
              <HStack spacing="3">
                <Box w="3px" h="18px" bg={BRAND} borderRadius="full" />
                <Text fontSize="md" fontWeight="850" color="#1e293b">Job Wise Details - {selectedPosition}</Text>
              </HStack>
              <IconButton icon={<X size={18} />} size="sm" variant="ghost" onClick={onClose} aria-label="close" />
            </HStack>
          </ModalHeader>
          <ModalBody p="0">
            <Box overflowX="auto" p="5">
              <Table variant="simple" size="sm" border="1px solid #e8edf5" borderRadius="lg">
                <Thead>
                  <Tr bg="#f8fafc">
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
                      <Tr key={index} _hover={{ bg: '#f8fafc' }}>
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
            <Flex justify="flex-end" px="6" py="4" borderTop="1px solid #f1f5f9" bg="#fafbfc">
              <HStack spacing="1">
                <Button size="xs" variant="outline" color="#64748b" borderRadius="md">Previous</Button>
                <Button size="xs" bg={BRAND} color="white" borderRadius="md" px="3">1</Button>
                <Button size="xs" variant="outline" color="#64748b" borderRadius="md">Next</Button>
              </HStack>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dashboard;
