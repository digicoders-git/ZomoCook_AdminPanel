import React from 'react';
import {
  Box, SimpleGrid, Text, Flex, Icon, HStack, VStack,
  Table, Thead, Tbody, Tr, Th, Td, Button, Select, Input,
  FormControl, FormLabel, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  Badge, IconButton, Skeleton,
} from '@chakra-ui/react';
import {
  LayoutDashboard, Users, Briefcase, Calendar, CalendarClock,
  XCircle, PauseCircle, CircleSlash, UserCheck, Search, RotateCcw,
  ChevronRight, Filter, FileText, UserPlus, Clock, Eye,
  Activity, PieChart as PieIcon, BarChart2, TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';

const BRAND = '#004aad';
const ACCENT = '#ed1c24';

const StatCard = ({ title, value, icon, color, iconBg, link }) => (
  <Box
    bg="white"
    p="5"
    borderRadius="xl"
    border="1px solid #e8edf5"
    boxShadow="0 2px 8px rgba(0,74,173,0.05)"
    transition="all 0.2s"
    _hover={{ transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,74,173,0.1)', borderColor: '#c0d0f0' }}
    position="relative"
    overflow="hidden"
  >
    {/* subtle top border accent */}
    <Box position="absolute" top="0" left="0" right="0" h="3px" bg={color} borderRadius="xl xl 0 0" />
    <Flex align="center" justify="space-between" mt="1">
      <VStack align="start" spacing="0.5" flex="1" pr="3">
        <Text color="#64748b" fontSize="11px" fontWeight="700" letterSpacing="0.5px" textTransform="uppercase" noOfLines={2}>
          {title}
        </Text>
        <Text fontSize="2xl" fontWeight="800" color="#1e293b" lineHeight="1.1">{value}</Text>
      </VStack>
      <Box p="3" bg={iconBg} borderRadius="xl" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
        <Icon as={icon} color={color} boxSize={5} />
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

const FilterSection = () => (
  <Box bg="white" p="6" borderRadius="xl" mb="6" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
    <Flex align="center" gap="2" mb="5">
      <Box w="3px" h="18px" bg={BRAND} borderRadius="full" />
      <Text fontSize="sm" fontWeight="700" color="#1e293b">Filter & Search</Text>
    </Flex>
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="4" mb="5">
      <FormControl>
        <FormLabel fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.8px" mb="1.5">
          Job Category
        </FormLabel>
        <Select
          placeholder="Select Category"
          size="sm"
          bg="#f8faff"
          border="1.5px solid #dde6f5"
          borderRadius="lg"
          fontSize="sm"
          _focus={{ borderColor: BRAND, boxShadow: `0 0 0 2px ${BRAND}20` }}
        >
          <option value="hotel">Hotel Job</option>
          <option value="home">Home Cook</option>
          <option value="daily">Daily Pay</option>
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.8px" mb="1.5">
          Customer/Client
        </FormLabel>
        <Select
          placeholder="Select Client"
          size="sm"
          bg="#f8faff"
          border="1.5px solid #dde6f5"
          borderRadius="lg"
          fontSize="sm"
          _focus={{ borderColor: BRAND, boxShadow: `0 0 0 2px ${BRAND}20` }}
        >
          <option value="1">JW Marriott</option>
          <option value="2">Taj Hotels</option>
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.8px" mb="1.5">
          Job Position
        </FormLabel>
        <Select
          placeholder="Select Position"
          size="sm"
          bg="#f8faff"
          border="1.5px solid #dde6f5"
          borderRadius="lg"
          fontSize="sm"
          _focus={{ borderColor: BRAND, boxShadow: `0 0 0 2px ${BRAND}20` }}
        >
          <option value="head-chef">Head Chef</option>
          <option value="commis-1">Commis 1</option>
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.8px" mb="1.5">
          Date Range
        </FormLabel>
        <Input
          type="date"
          size="sm"
          bg="#f8faff"
          border="1.5px solid #dde6f5"
          borderRadius="lg"
          fontSize="sm"
          _focus={{ borderColor: BRAND, boxShadow: `0 0 0 2px ${BRAND}20` }}
        />
      </FormControl>
    </SimpleGrid>
    <HStack spacing="3">
      <Button
        leftIcon={<Search size={15} />}
        size="sm"
        bg={BRAND}
        color="white"
        px="6"
        borderRadius="lg"
        _hover={{ bg: '#003d91' }}
        boxShadow={`0 4px 12px ${BRAND}30`}
      >
        Search
      </Button>
      <Button
        leftIcon={<RotateCcw size={15} />}
        size="sm"
        variant="outline"
        borderColor="#dde6f5"
        color="#64748b"
        borderRadius="lg"
        _hover={{ bg: '#f8faff', borderColor: BRAND, color: BRAND }}
      >
        Reset
      </Button>
    </HStack>
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
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { title: 'Total Jobs', value: '34', icon: Briefcase, iconBg: '#e6eeff', color: BRAND, link: '/jobs/list' },
    { title: 'New Applied', value: '8', icon: UserPlus, iconBg: '#eff6ff', color: '#3b82f6', link: '/candidates/applied' },
    { title: 'Total Applications', value: '13', icon: FileText, iconBg: '#f5f3ff', color: '#7c3aed', link: '/applications/all' },
    { title: 'Assigned Candidates', value: '3', icon: UserCheck, iconBg: '#f0fdf4', color: '#16a34a', link: '/candidates/shortlisted' },
    { title: 'Demo Scheduled', value: '1', icon: Calendar, iconBg: '#ecfdf5', color: '#10b981', link: '/candidates/demo-scheduled' },
    { title: 'Reschedule Requests', value: '0', icon: CalendarClock, iconBg: '#ecfeff', color: '#06b6d4', link: '/candidates/reschedule-requests' },
    { title: 'Rejected Candidates', value: '0', icon: XCircle, iconBg: '#fff0f0', color: ACCENT, link: '/candidates/rejected' },
    { title: 'On Hold Candidates', value: '0', icon: PauseCircle, iconBg: '#fffbeb', color: '#f59e0b', link: '/candidates/on-hold' },
    { title: 'Not Interested', value: '0', icon: CircleSlash, iconBg: '#f8fafc', color: '#64748b', link: '/candidates/not-interested' },
    { title: 'Hired Candidates', value: '1', icon: UserCheck, iconBg: '#e6eeff', color: BRAND, link: '/candidates/hired' },
    { title: 'Total Candidates', value: '29', icon: Users, iconBg: '#e6eeff', color: BRAND, link: '/candidates/list' },
    { title: 'Pending Candidates', value: '11', icon: Clock, iconBg: '#fff0f0', color: ACCENT, link: '/candidates/list' },
  ];

  const tableData = [
    { position: 'Chef + Helper', jobs: 6, vacancy: 361, applied: 0, assigned: 1, demo: 0, reschedule: 0, rejected: 0, onHold: 0, notInterested: 0, hired: 0 },
    { position: 'Assistant/ Helper Cook', jobs: 12, vacancy: 35, applied: 4, assigned: 2, demo: 0, reschedule: 0, rejected: 0, onHold: 0, notInterested: 0, hired: 1 },
    { position: 'Chef', jobs: 1, vacancy: 100, applied: 0, assigned: 0, demo: 0, reschedule: 0, rejected: 0, onHold: 0, notInterested: 0, hired: 0 },
    { position: 'Female Home Cook: 24Hr', jobs: 2, vacancy: 7, applied: 0, assigned: 0, demo: 0, reschedule: 0, rejected: 0, onHold: 0, notInterested: 0, hired: 0 },
    { position: 'North Indian CDP', jobs: 2, vacancy: 2, applied: 1, assigned: 0, demo: 0, reschedule: 0, rejected: 0, onHold: 0, notInterested: 0, hired: 0 },
    { position: 'South Indian Chef', jobs: 4, vacancy: 8, applied: 2, assigned: 1, demo: 1, reschedule: 0, rejected: 0, onHold: 0, notInterested: 0, hired: 0 },
    { position: 'Chinese Wok Master', jobs: 3, vacancy: 5, applied: 1, assigned: 0, demo: 0, reschedule: 0, rejected: 0, onHold: 0, notInterested: 0, hired: 0 },
    { position: 'Tandoor Specialty Chef', jobs: 5, vacancy: 10, applied: 3, assigned: 2, demo: 0, reschedule: 0, rejected: 0, onHold: 0, notInterested: 0, hired: 1 },
    { position: 'Continental Main Course', jobs: 1, vacancy: 4, applied: 0, assigned: 0, demo: 0, reschedule: 0, rejected: 0, onHold: 0, notInterested: 0, hired: 0 },
    { position: 'Pastry & Bakery Chef', jobs: 2, vacancy: 2, applied: 1, assigned: 1, demo: 0, reschedule: 0, rejected: 0, onHold: 0, notInterested: 0, hired: 0 },
  ];

  const radialChartOptions = {
    series: [76, 67, 61, 90],
    options: {
      chart: { type: 'radialBar', height: 260, fontFamily: 'Outfit, sans-serif' },
      plotOptions: {
        radialBar: {
          offsetY: 0, startAngle: 0, endAngle: 270,
          hollow: { margin: 5, size: '30%', background: 'transparent' },
          dataLabels: { name: { show: false }, value: { show: false } }
        }
      },
      colors: ['#3b82f6', '#10b981', '#6366f1', '#f59e0b'],
      labels: ['Vimeo', 'Messenger', 'Facebook', 'LinkedIn'],
      legend: {
        show: true, floating: true, fontSize: '12px', position: 'left',
        offsetX: 10, offsetY: 15,
        labels: { useSeriesColors: true },
        markers: { size: 0 },
        formatter: (seriesName, opts) => seriesName + ":  " + opts.w.globals.series[opts.seriesIndex],
        itemMargin: { vertical: 3 }
      }
    }
  };

  const donutChartOptions = {
    series: [75, 25],
    options: {
      chart: { type: 'donut', height: 260, fontFamily: 'Outfit, sans-serif' },
      colors: ['#3b82f6', '#f1f5f9'],
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: '80%',
            labels: {
              show: true,
              name: { show: true, fontSize: '12px', fontWeight: 600, color: '#64748b', offsetY: 5 },
              value: { show: true, fontSize: '24px', fontWeight: 800, color: '#1e293b', offsetY: -20 },
              total: { show: true, label: 'Percent', fontSize: '11px', fontWeight: 600, color: '#64748b', formatter: () => '75' }
            }
          }
        }
      },
      stroke: { width: 0 },
      legend: { show: false }
    }
  };

  const gaugeChartOptions = {
    series: [67],
    options: {
      chart: { type: 'radialBar', height: 260, offsetY: -10, fontFamily: 'Outfit, sans-serif' },
      plotOptions: {
        radialBar: {
          startAngle: -135, endAngle: 135,
          dataLabels: {
            name: { fontSize: '13px', color: '#64748b', offsetY: 80 },
            value: {
              offsetY: 40, fontSize: '22px', fontWeight: 800, color: '#1e293b',
              formatter: (val) => val + '%'
            }
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark', shadeIntensity: 0.15, inverseColors: false, opacityFrom: 1, opacityTo: 1,
          stops: [0, 50, 65, 91]
        }
      },
      stroke: { dashArray: 4 },
      labels: ['Median Ratio']
    }
  };

  const sparklineOptions = (color) => ({
    series: [{ data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54] }],
    options: {
      chart: { type: 'line', width: 100, height: 35, sparkline: { enabled: true } },
      stroke: { width: 2, curve: 'smooth' },
      colors: [color],
      tooltip: { fixed: { enabled: false } },
    }
  });

  const stackedAreaOptions = {
    series: [
      { name: 'Direct', data: [31, 40, 28, 51, 42, 109, 100] },
      { name: 'Referral', data: [11, 32, 45, 32, 34, 52, 41] },
      { name: 'Social', data: [15, 11, 32, 18, 9, 24, 11] }
    ],
    options: {
      chart: { type: 'area', height: 260, stacked: true, toolbar: { show: false }, fontFamily: 'Outfit, sans-serif' },
      colors: ['#3b82f6', '#10b981', '#f59e0b'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.1 } },
      xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], labels: { style: { colors: '#64748b' } } },
      yaxis: { labels: { style: { colors: '#64748b' } } },
      legend: { position: 'top', horizontalAlign: 'right' },
      grid: { borderColor: '#f1f5f9' }
    }
  };

  const dashboardLineOptions = {
    series: [{
      name: 'Growth',
      data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
    }],
    options: {
      chart: { height: 260, type: 'area', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'Outfit, sans-serif' },
      dataLabels: { enabled: false },
      stroke: { curve: 'straight', width: 2 },
      colors: ['#8b5cf6'],
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
      grid: { row: { colors: ['#f3f4f6', 'transparent'], opacity: 0.5 } },
      xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'] }
    }
  };

  const radarChartOptions = {
    series: [{
      name: 'Performance',
      data: [80, 50, 30, 40, 100, 20],
    }],
    options: {
      chart: { height: 260, type: 'radar', toolbar: { show: false }, fontFamily: 'Outfit, sans-serif' },
      colors: ['#3b82f6'],
      stroke: { width: 2 },
      fill: { opacity: 0.4 },
      markers: { size: 4, colors: ['#fff'], strokeColor: BRAND, strokeWidth: 2 },
      xaxis: {
        categories: ['12.09', '13.09', '14.09', '15.09', '16.09', '17.09'],
        labels: { style: { colors: '#fff', fontSize: '11px' } }
      },
      yaxis: { show: false },
      grid: { borderColor: 'rgba(255,255,255,0.1)' },
      plotOptions: {
        radar: {
          polygons: {
            strokeColors: 'rgba(255,255,255,0.2)',
            connectorColors: 'rgba(255,255,255,0.2)',
          }
        }
      }
    }
  };

  const lineChartOptions = {
    series: [{ name: 'Applications', data: [15, 25, 18, 32, 45, 38, 52, 48, 60, 55, 68, 72] }],
    options: {
      chart: { type: 'line', height: 260, toolbar: { show: false }, fontFamily: 'Outfit, sans-serif' },
      colors: [BRAND],
      stroke: { width: 3, curve: 'smooth' },
      xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], labels: { style: { colors: '#64748b', fontSize: '11px' } } },
      yaxis: { labels: { style: { colors: '#64748b', fontSize: '11px' } } },
      grid: { borderColor: '#f1f5f9' },
      markers: { size: 4, colors: ['#fff'], strokeColors: BRAND, strokeWidth: 2, hover: { size: 6 } }
    }
  };

  const pieChartOptions = {
    series: [45, 30, 15, 10],
    options: {
      chart: { type: 'donut', height: 260, fontFamily: 'Outfit, sans-serif' },
      labels: ['Hotel Jobs', 'Home Cooks', 'Daily Pay', 'Others'],
      colors: [BRAND, ACCENT, '#0062e6', '#94a3b8'],
      legend: { position: 'bottom', fontSize: '11px' },
      dataLabels: { enabled: true, style: { fontSize: '11px' } },
      plotOptions: { pie: { donut: { size: '65%' } } }
    }
  };

  const columnChartOptions = {
    series: [{ name: 'Count', data: [13, 8, 4, 3, 2] }],
    options: {
      chart: { type: 'bar', height: 260, toolbar: { show: false }, fontFamily: 'Outfit, sans-serif' },
      colors: [ACCENT],
      plotOptions: { bar: { borderRadius: 6, columnWidth: '40%' } },
      xaxis: { categories: ['Applied', 'Assigned', 'Demo', 'Hired', 'Rejected'], labels: { style: { colors: '#64748b', fontSize: '11px' } } },
      yaxis: { labels: { style: { colors: '#64748b', fontSize: '11px' } } },
      grid: { borderColor: '#f1f5f9' }
    }
  };

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
          <Button leftIcon={<RotateCcw size={14} />} variant="ghost" size="sm" color="#64748b" borderRadius="lg" _hover={{ bg: '#f8faff', color: BRAND }} flex={{ base: 1, md: 'none' }}>
            Refresh
          </Button>
          <Button leftIcon={<Filter size={14} />} size="sm" variant="outline" borderColor="#dde6f5" color={BRAND} borderRadius="lg" _hover={{ bg: '#f0f5ff' }} flex={{ base: 1, md: 'none' }}>
            Filters
          </Button>
        </HStack>
      </Flex>

      <FilterSection />

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="4" mb="8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </SimpleGrid>

      {/* Position Distribution Table */}
      <Box bg="white" borderRadius="xl" overflow="hidden" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)" mb="8">
        <Flex align="center" justify="space-between" px="6" py="4" borderBottom="1px solid #f1f5f9">
          <HStack spacing="3">
            <Box w="3px" h="20px" bg={BRAND} borderRadius="full" />
            <Icon as={TrendingUp} boxSize={4} color={BRAND} />
            <Text fontSize="sm" fontWeight="700" color="#1e293b">Position Distribution Table</Text>
          </HStack>
          <Badge
            px="3" py="1" borderRadius="full" fontSize="10px" fontWeight="700"
            bg="#ecfdf5" color="#16a34a" border="1px solid #bbf7d0"
          >
            ● Live
          </Badge>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr bg="#f8faff">
                {['Position', 'Jobs', 'Vacancy', 'Applied', 'Assigned', 'Demo', 'Reschedule', 'Rejected', 'On Hold', 'Hired', 'Action'].map((h, i) => (
                  <Th
                    key={h}
                    py="3.5"
                    fontSize="10px"
                    fontWeight="700"
                    color="#64748b"
                    letterSpacing="0.5px"
                    textTransform="uppercase"
                    isNumeric={i > 0 && i < 10}
                    borderBottom="2px solid #e8edf5"
                    textAlign={i === 10 ? 'center' : undefined}
                  >
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
              ) : tableData.map((row, index) => (
                <Tr
                  key={index}
                  _hover={{ bg: '#f8faff' }}
                  transition="background 0.15s"
                  borderBottom="1px solid #f1f5f9"
                >
                  <Td py="3.5" fontWeight="600" color="#1e293b" fontSize="sm">{row.position}</Td>
                  <Td isNumeric color="#475569" fontSize="sm">{row.jobs}</Td>
                  <Td isNumeric color="#475569" fontSize="sm">{row.vacancy}</Td>
                  <Td isNumeric fontSize="sm">
                    <Badge bg={row.applied > 0 ? '#e6eeff' : '#f8fafc'} color={row.applied > 0 ? BRAND : '#94a3b8'} borderRadius="md" px="2" fontSize="11px" fontWeight="700">
                      {row.applied}
                    </Badge>
                  </Td>
                  <Td isNumeric fontSize="sm">
                    <Badge bg={row.assigned > 0 ? '#f0fdf4' : '#f8fafc'} color={row.assigned > 0 ? '#16a34a' : '#94a3b8'} borderRadius="md" px="2" fontSize="11px" fontWeight="700">
                      {row.assigned}
                    </Badge>
                  </Td>
                  <Td isNumeric fontSize="sm">
                    <Badge bg={row.demo > 0 ? '#ecfdf5' : '#f8fafc'} color={row.demo > 0 ? '#10b981' : '#94a3b8'} borderRadius="md" px="2" fontSize="11px" fontWeight="700">
                      {row.demo}
                    </Badge>
                  </Td>
                  <Td isNumeric fontSize="sm" color="#94a3b8">{row.reschedule}</Td>
                  <Td isNumeric fontSize="sm">
                    <Badge bg={row.rejected > 0 ? '#fff0f0' : '#f8fafc'} color={row.rejected > 0 ? ACCENT : '#94a3b8'} borderRadius="md" px="2" fontSize="11px" fontWeight="700">
                      {row.rejected}
                    </Badge>
                  </Td>
                  <Td isNumeric fontSize="sm" color="#94a3b8">{row.onHold}</Td>
                  <Td isNumeric fontSize="sm">
                    <Badge bg={row.hired > 0 ? '#f0fdf4' : '#f8fafc'} color={row.hired > 0 ? '#16a34a' : '#94a3b8'} borderRadius="md" px="2" fontSize="11px" fontWeight="700">
                      {row.hired}
                    </Badge>
                  </Td>
                  <Td textAlign="center">
                    <IconButton
                      icon={<Eye size={13} />}
                      size="xs"
                      bg="#e6eeff"
                      color={BRAND}
                      borderRadius="lg"
                      _hover={{ bg: BRAND, color: 'white' }}
                      aria-label="view"
                      transition="all 0.15s"
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Flex justify="space-between" align="center" px="6" py="3" borderTop="1px solid #f1f5f9" bg="#fafbfc">
          <Text fontSize="xs" color="#94a3b8">Showing 10 of 10 entries</Text>
          <HStack spacing="1">
            <Button size="xs" variant="ghost" color="#64748b" borderRadius="md" _hover={{ bg: '#f0f5ff', color: BRAND }}>Prev</Button>
            <Button size="xs" bg={BRAND} color="white" borderRadius="md" _hover={{ bg: '#003d91' }} minW="7">1</Button>
            <Button size="xs" variant="ghost" color="#64748b" borderRadius="md" _hover={{ bg: '#f0f5ff', color: BRAND }}>2</Button>
            <Button size="xs" variant="ghost" color="#64748b" borderRadius="md" _hover={{ bg: '#f0f5ff', color: BRAND }}>Next</Button>
          </HStack>
        </Flex>
      </Box>

      {/* Performance Metrics Row */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="5" mb="5">
        <Box bg="white" p="6" borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
          <SectionHeader icon={Activity} title="Success Percentage" />
          <Chart options={donutChartOptions.options} series={donutChartOptions.series} type="donut" height={260} />
        </Box>
        <Box bg="white" p="6" borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
          <SectionHeader icon={PieIcon} title="Candidate Sources" />
          <Chart options={radialChartOptions.options} series={radialChartOptions.series} type="radialBar" height={260} />
        </Box>
        <Box bg="white" p="6" borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
          <SectionHeader icon={TrendingUp} title="Median Ratio" />
          <Chart options={gaugeChartOptions.options} series={gaugeChartOptions.series} type="radialBar" height={260} />
        </Box>
      </SimpleGrid>

      {/* Advanced Trends & Growth Analysis */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="5" mb="5">
        <Box bg="white" p="6" borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
          <SectionHeader icon={Activity} title="Direct vs Referral Growth" />
          <Chart options={stackedAreaOptions.options} series={stackedAreaOptions.series} type="area" height={260} />
        </Box>
        <Box bg="white" p="6" borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
          <SectionHeader icon={Activity} title="Sparkline Trends" />
          <VStack spacing="4" align="stretch" pt="4">
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="600" color="#475569">Daily Visitors</Text>
              <Chart options={sparklineOptions('#3b82f6').options} series={sparklineOptions('#3b82f6').series} type="line" width={120} height={40} />
            </Flex>
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="600" color="#475569">Total Applications</Text>
              <Chart options={sparklineOptions('#10b981').options} series={sparklineOptions('#10b981').series} type="line" width={120} height={40} />
            </Flex>
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="600" color="#475569">Interview Success</Text>
              <Chart options={sparklineOptions('#f59e0b').options} series={sparklineOptions('#f59e0b').series} type="line" width={120} height={40} />
            </Flex>
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="600" color="#475569">Hiring Rate</Text>
              <Chart options={sparklineOptions('#ef4444').options} series={sparklineOptions('#ef4444').series} type="line" width={120} height={40} />
            </Flex>
          </VStack>
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing="5" mb="5">
        <Box bg="white" p="6" borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
          <SectionHeader icon={Activity} title="Application Growth" />
          <Chart options={lineChartOptions.options} series={lineChartOptions.series} type="line" height={260} />
        </Box>
        <Box bg="white" p="6" borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)">
          <SectionHeader icon={PieIcon} title="Category Analysis" />
          <Chart options={pieChartOptions.options} series={pieChartOptions.series} type="donut" height={260} />
        </Box>
        <Box bg="#111827" p="6" borderRadius="xl" border="1px solid #1f2937" boxShadow="0 2px 8px rgba(0,0,0,0.2)">
          <Flex align="center" justify="space-between" mb="4">
            <HStack spacing="3">
              <Box w="3px" h="20px" bg="#3b82f6" borderRadius="full" />
              <Icon as={Activity} boxSize={4} color="white" />
              <Text fontSize="sm" fontWeight="700" color="white">Radar Analysis</Text>
            </HStack>
          </Flex>
          <Chart options={radarChartOptions.options} series={radarChartOptions.series} type="radar" height={260} />
        </Box>
      </SimpleGrid>

      <Box bg="white" p="6" borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)" mb="5">
        <SectionHeader icon={BarChart2} title="Application Status Overview" />
        <Chart options={columnChartOptions.options} series={columnChartOptions.series} type="bar" height={260} />
      </Box>

      {/* Footer
      <Flex justify="center" pb="4">
        <HStack spacing="2">
          <Box w="5px" h="5px" borderRadius="full" bg={BRAND} />
          <Text fontSize="xs" color="#94a3b8" fontWeight="500">© 2026 ZomoCook Admin | Designed by Duplex Technologies</Text>
          <Box w="5px" h="5px" borderRadius="full" bg={ACCENT} />
        </HStack>
      </Flex> */}

    </Box>
  );
};

export default Dashboard;
