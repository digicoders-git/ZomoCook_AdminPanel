import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, SimpleGrid, Grid, Icon, Badge, Select, Button,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, HStack, VStack,
  InputGroup, InputLeftElement, Input, IconButton, Spinner, useToast
} from '@chakra-ui/react';
import {
  Wallet, FileText, Package, ArrowLeftRight, Download, Calendar,
  TrendingUp, TrendingDown, ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

// --- Theme Colors matching design ---
const colors = {
  blue: '#3b82f6',
  green: '#10b981',
  purple: '#a855f7',
  orange: '#f59e0b',
  bgBlue: '#eff6ff',
  bgGreen: '#ecfdf5',
  bgPurple: '#faf5ff',
  bgOrange: '#fffbeb',
};

export default function FinanceRevenue() {
  const [filterDate, setFilterDate] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterManager, setFilterManager] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    hiringFee: 0,
    activatedPackages: 0,
    totalTxCount: 0
  });
  
  const [chartData, setChartData] = useState({
    lineChart: { categories: [], series: [] },
    packageSeries: [0, 0, 0, 0],
    managerSeries: [0, 0, 0, 0, 0]
  });

  const [transactions, setTransactions] = useState([]);
  const toast = useToast();

  useEffect(() => {
    fetchFinanceData();
  }, [filterDate, filterPeriod, filterManager]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterPeriod) params.period = filterPeriod;
      if (filterManager) params.manager = filterManager;

      const response = await axios.get(`${API_BASE_URL}/finance`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      if (response.data.success) {
        setStats(response.data.stats);
        setChartData(response.data.charts);
        setTransactions(response.data.recentTransactions);
      }
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
      toast({
        title: 'Error fetching data',
        description: error.response?.data?.message || 'Something went wrong.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = [
    {
      title: 'TOTAL REVENUE',
      amount: `₹ ${stats.totalRevenue.toLocaleString('en-IN')}`,
      trend: '↑ 18.6%', // Mocked trend
      isUp: true,
      vs: 'vs last month',
      icon: Wallet,
      color: colors.blue,
      bg: colors.bgBlue,
    },
    {
      title: 'HIRING PROCESSING FEE',
      amount: `₹ ${stats.hiringFee.toLocaleString('en-IN')}`,
      trend: '↑ 14.3%',
      isUp: true,
      vs: 'vs last month',
      icon: FileText,
      color: colors.green,
      bg: colors.bgGreen,
    },
    {
      title: 'ACTIVATED PACKAGES',
      amount: `₹ ${stats.activatedPackages.toLocaleString('en-IN')}`,
      trend: '↑ 19.2%',
      isUp: true,
      vs: 'vs last month',
      icon: Package,
      color: colors.purple,
      bg: colors.bgPurple,
    },
    {
      title: 'TOTAL TRANSACTIONS',
      amount: stats.totalTxCount,
      trend: '↑ 12.1%',
      isUp: true,
      vs: 'vs last month',
      icon: ArrowLeftRight,
      color: colors.orange,
      bg: colors.bgOrange,
    },
  ];

  // --- Chart Configurations ---
  const lineChartOptions = {
    chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'Inter, sans-serif' },
    colors: [colors.blue, colors.green, colors.purple],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: chartData.lineChart.categories || [], axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { formatter: (value) => value >= 100000 ? `₹ ${(value / 100000).toFixed(2)}L` : value === 0 ? '₹ 0' : `₹ ${value}` } },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    legend: { position: 'top', horizontalAlign: 'left', markers: { radius: 12 } }
  };

  const pieChartOptions = (labels, seriesColors, centerText) => ({
    chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
    labels: labels,
    colors: seriesColors,
    plotOptions: { 
      donut: { 
        size: '70%', 
        labels: { 
          show: true, 
          name: { show: true, fontSize: '12px', color: '#64748b' }, 
          value: { show: true, fontSize: '16px', fontWeight: 700, color: '#1e293b', formatter: (val) => `₹ ${val.toLocaleString('en-IN')}` }, 
          total: { show: true, label: 'Total', color: '#64748b', fontSize: '12px', formatter: () => centerText } 
        } 
      } 
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 0 }
  });

  const managerLabels = ['Direct App', 'Others', '', '', ''];
  const managerColors = ['#3b82f6', '#d1d5db', '#ffffff', '#ffffff', '#ffffff'];

  const packageLabels = ['Basic', 'Standard', 'Premium', 'Others'];
  const packageColors = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b'];

  if (loading) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" color={colors.blue} />
      </Flex>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} mb="6" gap="4">
        <Box>
          <Text fontSize="xl" fontWeight="800" color="#1e293b">Finance / Revenue Management</Text>
          <Text fontSize="sm" color="#64748b" mt="1" fontWeight="500">Track all your revenue, sales, and financial performance dynamically.</Text>
        </Box>
        <Flex gap="3" w={{ base: 'full', md: 'auto' }} flexWrap="wrap">
          <Select bg="white" w="130px" fontSize="xs" fontWeight="500" color="#475569" border="1px solid #e2e8f0" borderRadius="lg" size="sm" value={filterPeriod} onChange={(e) => { setFilterPeriod(e.target.value); setFilterDate(''); }}>
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
          </Select>
          <InputGroup w="auto" minW="150px" bg="white" borderRadius="lg" border="1px solid #e2e8f0" size="sm">
            <Input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setFilterPeriod(''); }} fontSize="xs" fontWeight="500" color="#475569" />
          </InputGroup>
          <Select bg="white" w="180px" fontSize="xs" fontWeight="500" color="#475569" border="1px solid #e2e8f0" borderRadius="lg" size="sm" value={filterManager} onChange={(e) => setFilterManager(e.target.value)}>
            <option value="">All Lead Managers</option>
            <option value="arti">Arti Mishra</option>
            <option value="rohini">Rohini Yadav</option>
          </Select>
          <Button leftIcon={<Download size={14} />} bg="#004aad" color="white" _hover={{ bg: '#003a8c' }} fontSize="xs" size="sm" borderRadius="lg" px="5">
            Export
          </Button>
        </Flex>
      </Flex>

      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing="5" mb="6">
        {summaryCards.map((card, i) => (
          <Box key={i} bg="white" p="5" borderRadius="2xl" border="1px solid #e2e8f0" boxShadow="sm">
            <Flex justify="space-between" align="center" mb="4">
              <Text fontSize="11px" fontWeight="700" color="#64748b">{card.title}</Text>
              <Flex align="center" justify="center" w="10" h="10" borderRadius="xl" bg={card.bg} color={card.color}>
                <Icon as={card.icon} boxSize={5} />
              </Flex>
            </Flex>
            <Text fontSize="2xl" fontWeight="800" color="#1e293b" mb="3">{card.amount}</Text>
            <Flex align="center" gap="2">
              <Text fontSize="11px" fontWeight="700" color={card.isUp ? card.color : 'red.500'}>{card.trend}</Text>
              <Text fontSize="11px" color="#94a3b8" fontWeight="500">{card.vs}</Text>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>

      {/* Charts Grid */}
      <Grid templateColumns={{ base: '1fr', lg: '6fr 3fr 3fr' }} gap="5" mb="6">
        {/* Line Chart */}
        <Box bg="white" p="5" borderRadius="2xl" border="1px solid #e2e8f0" boxShadow="sm">
          <Flex justify="space-between" align="center" mb="2">
            <Text fontSize="sm" fontWeight="800" color="#1e293b">Sales Overview</Text>
            <Select size="xs" w="100px" borderRadius="md" value={filterPeriod || 'all'} onChange={(e) => { setFilterPeriod(e.target.value === 'all' ? '' : e.target.value); setFilterDate(''); }} fontWeight="600" color="#475569">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
            </Select>
          </Flex>
          <Box h="280px">
            <Chart options={lineChartOptions} series={chartData.lineChart.series} type="line" height="100%" />
          </Box>
        </Box>

        {/* Pie Chart 1 */}
        <Box bg="white" p="5" borderRadius="2xl" border="1px solid #e2e8f0" boxShadow="sm">
          <Flex justify="space-between" align="center" mb="4">
            <Text fontSize="sm" fontWeight="800" color="#1e293b">Sales by Lead Manager</Text>
            <Select size="xs" w="100px" borderRadius="md" value={filterPeriod || 'all'} onChange={(e) => { setFilterPeriod(e.target.value === 'all' ? '' : e.target.value); setFilterDate(''); }} fontWeight="600" color="#475569">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
            </Select>
          </Flex>
          <Box h="180px" display="flex" justifyContent="center">
            <Chart options={pieChartOptions(managerLabels, managerColors, `₹ ${stats.totalRevenue.toLocaleString('en-IN')}`)} series={chartData.managerSeries} type="donut" height="180" />
          </Box>
          <VStack align="stretch" spacing="3" mt="6">
            {managerLabels.filter(l => l !== '').map((label, idx) => (
              <Flex key={idx} justify="space-between" align="center" fontSize="11px">
                <HStack spacing="2">
                  <Box w="2" h="2" borderRadius="full" bg={managerColors[idx]} />
                  <Text color="#64748b" fontWeight="500">{label}</Text>
                </HStack>
                <HStack spacing="4" w="100px" justify="space-between">
                  <Text fontWeight="700" color="#1e293b">₹ {(chartData.managerSeries[idx] || 0).toLocaleString('en-IN')}</Text>
                  <Text color="#94a3b8" fontWeight="600">{stats.totalRevenue > 0 ? ((chartData.managerSeries[idx] || 0) / stats.totalRevenue * 100).toFixed(1) : '0'}%</Text>
                </HStack>
              </Flex>
            ))}
          </VStack>
        </Box>

        {/* Pie Chart 2 */}
        <Box bg="white" p="5" borderRadius="2xl" border="1px solid #e2e8f0" boxShadow="sm">
          <Flex justify="space-between" align="center" mb="4">
            <Text fontSize="sm" fontWeight="800" color="#1e293b">Sales by Package Type</Text>
            <Select size="xs" w="100px" borderRadius="md" value={filterPeriod || 'all'} onChange={(e) => { setFilterPeriod(e.target.value === 'all' ? '' : e.target.value); setFilterDate(''); }} fontWeight="600" color="#475569">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
            </Select>
          </Flex>
          <Box h="180px" display="flex" justifyContent="center" alignItems="center">
            {stats.activatedPackages === 0 ? (
                <Text color="gray.400" fontSize="sm" fontWeight="500">No package sales yet</Text>
            ) : (
                <Chart options={pieChartOptions(packageLabels, packageColors, `₹ ${stats.activatedPackages.toLocaleString('en-IN')}`)} series={chartData.packageSeries} type="donut" height="180" />
            )}
          </Box>
          <VStack align="stretch" spacing="3" mt="6">
            {packageLabels.map((label, idx) => (
              <Flex key={idx} justify="space-between" align="center" fontSize="11px">
                <HStack spacing="2">
                  <Box w="2" h="2" borderRadius="full" bg={packageColors[idx]} />
                  <Text color="#64748b" fontWeight="500">{label}</Text>
                </HStack>
                <HStack spacing="4" w="100px" justify="space-between">
                  <Text fontWeight="700" color="#1e293b">₹ {(chartData.packageSeries[idx] || 0).toLocaleString('en-IN')}</Text>
                  <Text color="#94a3b8" fontWeight="600">{stats.activatedPackages > 0 ? ((chartData.packageSeries[idx] || 0) / stats.activatedPackages * 100).toFixed(1) : '0'}%</Text>
                </HStack>
              </Flex>
            ))}
          </VStack>
        </Box>
      </Grid>

      {/* Table Section */}
      <Box bg="white" borderRadius="2xl" border="1px solid #e2e8f0" overflow="hidden" boxShadow="sm">
        <Flex justify="space-between" align="center" p="5" borderBottom="1px solid #e2e8f0">
          <Text fontSize="sm" fontWeight="800" color="#1e293b">Recent Transactions</Text>
          <Button variant="outline" size="sm" fontSize="xs" fontWeight="600" borderRadius="lg">View All Transactions</Button>
        </Flex>
        <TableContainer>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th py="4" fontSize="9px" fontWeight="800" color="#94a3b8" borderColor="#e2e8f0">DATE</Th>
                <Th fontSize="9px" fontWeight="800" color="#94a3b8" borderColor="#e2e8f0">INVOICE / ORDER ID</Th>
                <Th fontSize="9px" fontWeight="800" color="#94a3b8" borderColor="#e2e8f0">CUSTOMER / CLIENT</Th>
                <Th fontSize="9px" fontWeight="800" color="#94a3b8" borderColor="#e2e8f0">TYPE</Th>
                <Th fontSize="9px" fontWeight="800" color="#94a3b8" borderColor="#e2e8f0">DESCRIPTION</Th>
                <Th fontSize="9px" fontWeight="800" color="#94a3b8" borderColor="#e2e8f0">PACKAGE</Th>
                <Th fontSize="9px" fontWeight="800" color="#94a3b8" borderColor="#e2e8f0">LEAD MANAGER</Th>
                <Th fontSize="9px" fontWeight="800" color="#94a3b8" borderColor="#e2e8f0">AMOUNT (₹)</Th>
                <Th fontSize="9px" fontWeight="800" color="#94a3b8" borderColor="#e2e8f0">STATUS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transactions.length > 0 ? transactions.map((tx, idx) => (
                <Tr key={idx} _hover={{ bg: '#f8fafc' }} transition="all 0.2s">
                  <Td py="4" borderColor="#e2e8f0">
                    <Text fontSize="xs" color="#475569" fontWeight="500">{tx.date}</Text>
                  </Td>
                  <Td borderColor="#e2e8f0">
                    <Text fontSize="xs" fontWeight="600" color="#1e293b">{tx.id}</Text>
                  </Td>
                  <Td borderColor="#e2e8f0">
                    <Text fontSize="xs" fontWeight="700" color="#1e293b">{tx.customer}</Text>
                    <Text fontSize="10px" color="#94a3b8" fontWeight="500">{tx.phone}</Text>
                  </Td>
                  <Td borderColor="#e2e8f0">
                    <Badge bg={tx.type.includes('Package') ? colors.bgGreen : colors.bgBlue} color={tx.type.includes('Package') ? colors.green : colors.blue} textTransform="none" fontSize="10px" fontWeight="600" px="2" py="1" borderRadius="md">
                      {tx.type}
                    </Badge>
                  </Td>
                  <Td borderColor="#e2e8f0">
                    <Text fontSize="xs" color="#475569" fontWeight="500">{tx.desc}</Text>
                  </Td>
                  <Td borderColor="#e2e8f0">
                    {tx.package !== '-' ? (
                      <Badge bg={tx.package === 'Premium' ? colors.bgPurple : tx.package === 'Standard' ? colors.bgOrange : colors.bgBlue} color={tx.package === 'Premium' ? colors.purple : tx.package === 'Standard' ? colors.orange : colors.blue} textTransform="none" fontSize="10px" fontWeight="600" px="2" py="1" borderRadius="md">
                        {tx.package}
                      </Badge>
                    ) : (
                      <Text fontSize="xs" color="#94a3b8" fontWeight="500">-</Text>
                    )}
                  </Td>
                  <Td borderColor="#e2e8f0">
                    <Text fontSize="xs" color="#475569" fontWeight="600">{tx.manager}</Text>
                  </Td>
                  <Td borderColor="#e2e8f0">
                    <Text fontSize="xs" fontWeight="700" color="#1e293b">{tx.amount}</Text>
                  </Td>
                  <Td borderColor="#e2e8f0">
                    <Badge bg={tx.status === 'Paid' ? colors.bgGreen : '#fef2f2'} color={tx.status === 'Paid' ? colors.green : '#ef4444'} textTransform="none" fontSize="10px" fontWeight="700" px="2" py="1" borderRadius="md">
                      {tx.status}
                    </Badge>
                  </Td>
                </Tr>
              )) : (
                <Tr>
                  <Td colSpan={9} textAlign="center" py="6" color="#94a3b8">No recent transactions found.</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
        
        {/* Pagination Footer */}
        <Flex justify="space-between" align="center" p="4">
          <Text fontSize="xs" color="#94a3b8" fontWeight="500">Showing {Math.min(transactions.length, 10)} of {stats.totalTxCount} transactions</Text>
          <HStack spacing="1">
            <IconButton size="xs" variant="outline" icon={<ChevronLeft size={14} />} aria-label="Previous" borderRadius="md" color="#94a3b8" borderColor="#e2e8f0" isDisabled />
            <Button size="xs" bg="#004aad" color="white" borderRadius="md" w="7">1</Button>
            <IconButton size="xs" variant="outline" icon={<ChevronRight size={14} />} aria-label="Next" borderRadius="md" color="#94a3b8" borderColor="#e2e8f0" isDisabled />
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
}
