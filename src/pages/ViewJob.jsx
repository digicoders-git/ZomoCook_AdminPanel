import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Badge, Icon, Flex,
  Button, Spinner, useToast, Image, Table, Thead, Tbody, Tr, Th, Td, Divider,
  useDisclosure, SimpleGrid
} from '@chakra-ui/react';
import { ArrowLeft, LayoutList, FileText, CheckCircle2, Users, Calendar, Clock, MapPin, Building2, Phone, Mail, UtensilsCrossed, Zap, CreditCard } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PageHeader, PageFooter, BRAND, ACCENT, thStyle, tdStyle } from '../components/ui';
import JobApplicantsModal from './JobApplicantsModal';

const ViewJob = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedCount, setAppliedCount] = useState(0);
  const [assignedCount, setAssignedCount] = useState(0);
  const [applications, setApplications] = useState([]);
  const [transaction, setTransaction] = useState(null);

  const fetchJob = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${apiUrl}/jobs/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const appsResponse = await axios.get(`${apiUrl}/applications`, {
        params: { jobId: id },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setJob(response.data.job);
        setTransaction(response.data.transaction);
      }
      if (appsResponse.data.success && Array.isArray(appsResponse.data.applications)) {
        const apps = appsResponse.data.applications;
        setApplications(apps);
        setAppliedCount(apps.length);
        setAssignedCount(apps.filter(app => app.status === 'Applied').length);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch job details', status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  if (isLoading) {
    return <Flex h="80vh" align="center" justify="center"><Spinner size="xl" color={BRAND} thickness="4px" /></Flex>;
  }

  if (!job) {
    return <Flex h="80vh" align="center" justify="center"><Text>Job / Booking not found</Text></Flex>;
  }

  const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

  const isParty = 
    job.jobCategory === 'party' || 
    job.bookingType === 'party' || 
    (job.partyRequirement && typeof job.partyRequirement === 'object' && Object.keys(job.partyRequirement).length > 0 && (job.partyRequirement.dates || job.partyRequirement.datesCount));

  const isDaily = 
    !isParty && (
      job.jobCategory === 'daily' || 
      job.bookingType === 'daily' || 
      (job.staffRequirements && Array.isArray(job.staffRequirements) && job.staffRequirements.length > 0)
    );

  const getCustomerName = () => {
    if (job.customer && typeof job.customer === 'object' && job.customer.name) return job.customer.name;
    if (job.createdBy && typeof job.createdBy === 'object' && job.createdBy.name) return job.createdBy.name;
    return 'N/A';
  };

  const getCustomerPhone = () => {
    if (job.customer && typeof job.customer === 'object') return job.customer.phone || job.customer.contactPhone || 'N/A';
    if (job.createdBy && typeof job.createdBy === 'object') return job.createdBy.phone || 'N/A';
    return 'N/A';
  };

  const getCustomerEmail = () => {
    if (job.email) return job.email;
    if (job.customer && typeof job.customer === 'object') return job.customer.email || job.customer.contactEmail || 'N/A';
    if (job.createdBy && typeof job.createdBy === 'object') return job.createdBy.email || 'N/A';
    return 'N/A';
  };

  const fullAddress = job.venueAddress || job.address || job.outletAddress || (job.customer && typeof job.customer === 'object' ? (job.customer.contactAddress || job.customer.address) : null) || 'N/A';

  const DataRow = ({ label, value, isBadge = false, colorScheme = 'blue' }) => (
    <Tr borderBottom="1px solid #f1f5f9">
      <Td py="3" px="6" bg="#fcfdfe" w="300px" fontSize="sm" fontWeight="700" color="#1e293b" borderRight="1px solid #f1f5f9">{label}</Td>
      <Td py="3" px="6" fontSize="sm" color="#475569" fontWeight="500">
        {isBadge ? (
          <Badge colorScheme={colorScheme} variant="solid" px="3" py="0.5" borderRadius="md" textTransform="capitalize">{value}</Badge>
        ) : (
          value || 'N/A'
        )}
      </Td>
    </Tr>
  );

  return (
    <Box pb="10">
      <PageHeader
        title={isParty ? "Chef for Party Booking Details" : isDaily ? "Daily Basis Staff Booking Details" : "Job Details"}
        actions={[
          <Button
            key="back"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft size={16} />}
            size="sm"
            bg="#f97316"
            color="white"
            borderRadius="md"
            px="6"
            _hover={{ bg: '#ea580c' }}
          >
            Back
          </Button>
        ]}
      />

      <VStack spacing="6" align="stretch">
        {/* Customer & Location Overview */}
        <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="sm" overflow="hidden">
          <Box p="4" borderBottom="1px solid #f1f5f9" bg="#fcfdfe">
            <HStack justify="space-between">
              <HStack spacing="2">
                <Icon as={Building2} color={BRAND} boxSize={5} />
                <Text fontSize="sm" fontWeight="800" color="#1e293b">Customer & Venue Information</Text>
              </HStack>
              <Badge bg={isParty ? "#fff7ed" : isDaily ? "#eff6ff" : "#f0fdf4"} color={isParty ? "#c2410c" : isDaily ? "#1d4ed8" : "#15803d"} px="3" py="1" borderRadius="md" fontSize="xs" fontWeight="700">
                Job Code: {job.jobCode || 'N/A'}
              </Badge>
            </HStack>
          </Box>
          <Table variant="simple">
            <Tbody>
              <DataRow label="Customer / Client Name" value={getCustomerName()} />
              <DataRow label="Contact Phone Number" value={getCustomerPhone()} />
              <DataRow label="Email Address" value={getCustomerEmail()} />
              <DataRow label="Hiring Purpose / Outlet Name" value={job.outletName || job.hiringPurpose || job.propertyCategory || 'N/A'} />
              <DataRow label="City & State" value={`${job.city || 'N/A'}, ${job.state || 'India'}`} />
              <DataRow label="Full Address / Venue" value={fullAddress} />
              <DataRow label="Lead Manager" value={job.leadManager || 'Unassigned'} />
              <DataRow label="Current Status" value={job.status || 'New'} isBadge colorScheme={job.status === 'Active' ? 'green' : 'blue'} />
            </Tbody>
          </Table>
        </Box>

        {/* Daily Basis Staff Requirements Breakdown */}
        {(isDaily || (job.staffRequirements && job.staffRequirements.length > 0)) && (
          <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="sm" overflow="hidden">
            <Box p="4" borderBottom="1px solid #f1f5f9" bg="#fcfdfe">
              <HStack spacing="2">
                <Icon as={Clock} color="#0f62fe" boxSize={5} />
                <Text fontSize="sm" fontWeight="800" color="#1e293b">Daily Staff Requirements & Shift Timings</Text>
              </HStack>
            </Box>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg="#f8faff">
                  <Tr>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">#</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">ROLE / POSITION</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">GENDER PREFERENCE</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">NO. OF STAFF</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">NO. OF DAYS</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7" textAlign="center">APPLIED CANDIDATE</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7" textAlign="center">ASSIGNED CANDIDATE</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">RATE / DAY</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">START DATE</Th>
                    <Th {...thStyle}>SHIFT TIMINGS</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {job.staffRequirements && job.staffRequirements.length > 0 ? (
                    job.staffRequirements.map((s, idx) => {
                      const roleName = s.role || s.category || s.staffCategory || 'Staff';
                      
                      // Calculate role-specific applied count
                      const roleApplied = applications.filter(app => {
                        const appRole = app.appliedRole || app.applicationData?.role || app.applicationData?.appliedRole || (app.candidate?.jobPreference?.jobPositions?.[0]) || '';
                        if (appRole) {
                          return appRole.toLowerCase().trim() === roleName.toLowerCase().trim();
                        }
                        return idx === 0;
                      }).length;

                      // Calculate role-specific assigned count
                      let roleAssigned = 0;
                      if (job.assignedStaff && Array.isArray(job.assignedStaff)) {
                        roleAssigned = job.assignedStaff.filter(st => (st.role || '').toLowerCase().trim() === roleName.toLowerCase().trim()).length;
                      }
                      if (roleAssigned === 0 && applications.length > 0) {
                        roleAssigned = applications.filter(app => {
                          const appRole = app.appliedRole || app.applicationData?.role || (app.candidate?.jobPreference?.jobPositions?.[0]) || '';
                          const isMatch = appRole ? appRole.toLowerCase().trim() === roleName.toLowerCase().trim() : idx === 0;
                          return isMatch && ['Shortlisted', 'Assigned', 'Hired', 'Offer Accepted', 'Joined'].includes(app.status);
                        }).length;
                      }

                      return (
                        <Tr key={idx}>
                          <Td {...tdStyle} borderRight="1px solid #edf2f7">{idx + 1}</Td>
                          <Td {...tdStyle} borderRight="1px solid #edf2f7" fontWeight="700" color="#1e293b">{roleName}</Td>
                          <Td {...tdStyle} borderRight="1px solid #edf2f7">{s.genderPref || 'Any Gender'}</Td>
                          <Td {...tdStyle} borderRight="1px solid #edf2f7" fontWeight="700">{s.count || s.noOfStaff || 1}</Td>
                          <Td {...tdStyle} borderRight="1px solid #edf2f7">{s.days || s.noOfDays || 1}</Td>
                          <Td {...tdStyle} borderRight="1px solid #edf2f7" textAlign="center">
                            <Flex justify="center">
                              <Flex
                                w="24px"
                                h="24px"
                                borderRadius="full"
                                bg="#2563eb"
                                color="white"
                                align="center"
                                justify="center"
                                fontSize="xs"
                                fontWeight="800"
                                cursor="pointer"
                                onClick={onOpen}
                                _hover={{ transform: 'scale(1.1)' }}
                                transition="all 0.2s"
                              >
                                {roleApplied}
                              </Flex>
                            </Flex>
                          </Td>
                          <Td {...tdStyle} borderRight="1px solid #edf2f7" textAlign="center">
                            <Flex justify="center">
                              <Flex
                                w="24px"
                                h="24px"
                                borderRadius="full"
                                bg="#2563eb"
                                color="white"
                                align="center"
                                justify="center"
                                fontSize="xs"
                                fontWeight="800"
                              >
                                {roleAssigned}
                              </Flex>
                            </Flex>
                          </Td>
                          <Td {...tdStyle} borderRight="1px solid #edf2f7" color="#059669" fontWeight="700">₹{s.perDayRate || s.ratePerDay || s.salary || 0}</Td>
                          <Td {...tdStyle} borderRight="1px solid #edf2f7">{s.startDate || (job.dateOfEvent ? new Date(job.dateOfEvent).toISOString().split('T')[0] : 'N/A')}</Td>
                          <Td {...tdStyle}>{s.startTime && s.endTime ? `${s.startTime} – ${s.endTime}` : (s.timing || job.servingTime || '16:00 - 23:00')}</Td>
                        </Tr>
                      );
                    })
                  ) : (
                    <Tr>
                      <Td colSpan={10} textAlign="center" py="4" color="#64748b">
                        {job.title} ({job.package || job.salaryRange || 'N/A'})
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}

        {/* Assigned Staff & Live OTP Execution Tracking */}
        {job.assignedStaff && Array.isArray(job.assignedStaff) && job.assignedStaff.length > 0 && (
          <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="sm" overflow="hidden">
            <Box p="4" borderBottom="1px solid #f1f5f9" bg="#f0fDF4">
              <HStack spacing="2">
                <Icon as={ShieldCheck} color="#16a34a" boxSize={5} />
                <Text fontSize="sm" fontWeight="800" color="#16a34a">Assigned Staff & Live OTP Execution Tracking</Text>
              </HStack>
            </Box>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg="#f8faff">
                  <Tr>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">#</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">Staff Name</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">Role / Position</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">Phone Number</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">Experience</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">Start OTP</Th>
                    <Th {...thStyle}>Live Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {job.assignedStaff.map((staff, idx) => (
                    <Tr key={idx}>
                      <Td {...tdStyle} borderRight="1px solid #edf2f7">{idx + 1}</Td>
                      <Td {...tdStyle} borderRight="1px solid #edf2f7" fontWeight="700" color="#1e293b">{staff.name || 'Staff'}</Td>
                      <Td {...tdStyle} borderRight="1px solid #edf2f7">{staff.role || 'Chef'}</Td>
                      <Td {...tdStyle} borderRight="1px solid #edf2f7" fontWeight="600">{staff.phone || 'N/A'}</Td>
                      <Td {...tdStyle} borderRight="1px solid #edf2f7">{staff.experience || 'Verified'}</Td>
                      <Td {...tdStyle} borderRight="1px solid #edf2f7" fontWeight="800" color="#0284c7" bg="#f0f9ff">
                        {staff.startOtp || '4821'}
                      </Td>
                      <Td {...tdStyle}>
                        <Badge colorScheme={staff.status === 'Completed' ? 'green' : (staff.status === 'In Progress' ? 'blue' : 'purple')}>
                          {staff.status || 'Assigned'}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}

        {/* Chef for Party Breakdown */}
        {isParty && (
          <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="sm" overflow="hidden">
            <Box p="4" borderBottom="1px solid #f1f5f9" bg="#fff7ed">
              <HStack spacing="2">
                <Icon as={UtensilsCrossed} color="#c2410c" boxSize={5} />
                <Text fontSize="sm" fontWeight="800" color="#c2410c">Chef for Party & Event Breakdown</Text>
              </HStack>
            </Box>
            <Table variant="simple">
              <Tbody>
                <DataRow label="Event Name" value={job.event || job.jobPosition || 'Party Event'} />
                <DataRow label="Number of Guests" value={job.noOfGuests ? `${job.noOfGuests} Guests` : 'N/A'} />
                <DataRow label="Event Dates Count" value={job.partyRequirement?.datesCount ? `${job.partyRequirement.datesCount} Day(s)` : '1 Day'} />
              </Tbody>
            </Table>
            {job.partyRequirement?.dates && Array.isArray(job.partyRequirement.dates) && (
              <Box p="4" bg="#fafafa">
                <Text fontWeight="800" fontSize="xs" color="#1e293b" mb="3">Meal Schedule & Dishes Selected:</Text>
                <VStack align="stretch" spacing="3">
                  {job.partyRequirement.dates.map((d, idx) => (
                    <Box key={idx} bg="white" border="1px solid #fed7aa" p="3" borderRadius="lg">
                      <HStack justify="space-between" mb="2">
                        <Text fontWeight="800" fontSize="xs" color="#c2410c">Day {idx + 1}: {d.date} ({d.eventType || 'Event'})</Text>
                      </HStack>
                      {d.meals && Array.isArray(d.meals) && d.meals.map((m, mi) => {
                        const mealName = m.mealType || m.name || `Meal ${mi + 1}`;
                        const dishList = (m.dishes || m.menu || []).map(item => typeof item === 'object' ? item.name : item).filter(Boolean);
                        const categoryList = m.categories && typeof m.categories === 'object' 
                          ? Object.entries(m.categories).filter(([_, count]) => Number(count) > 0).map(([cat, count]) => `${cat}: ${count}`).join(', ')
                          : '';

                        return (
                          <Box key={mi} bg="#fff7ed" border="1px solid #fed7aa" p="3" borderRadius="md" mb="2">
                            <HStack justify="space-between" align="center" mb="1">
                              <HStack spacing="2">
                                <Badge colorScheme={mealName.toLowerCase().includes('dinner') ? 'purple' : (mealName.toLowerCase().includes('lunch') ? 'orange' : 'teal')} px="2" py="0.5" borderRadius="md" fontSize="xs" fontWeight="700">
                                  {mealName}
                                </Badge>
                                <Text fontWeight="700" fontSize="xs" color="#1e293b">
                                  👥 {m.guests || 'N/A'} Guests
                                </Text>
                              </HStack>
                              <Badge variant="subtle" colorScheme={m.menuMode === 'now' ? 'green' : 'blue'} fontSize="10px">
                                {m.menuMode === 'now' ? 'Menu Selected Now' : (m.menuMode === 'later' ? 'Menu Select Later' : (m.menuMode || 'Standard'))}
                              </Badge>
                            </HStack>
                            
                            {dishList.length > 0 && (
                              <Box mt="2" bg="white" p="2" borderRadius="sm" border="1px solid #ffedd5">
                                <Text fontSize="xs" fontWeight="700" color="#c2410c" mb="0.5">Dishes Selected ({dishList.length}):</Text>
                                <Text fontSize="xs" color="#334155" lineHeight="1.4">
                                  {dishList.join(' • ')}
                                </Text>
                              </Box>
                            )}

                            {dishList.length === 0 && categoryList && (
                              <Box mt="2" bg="white" p="2" borderRadius="sm" border="1px solid #ffedd5">
                                <Text fontSize="xs" fontWeight="700" color="#c2410c" mb="0.5">Category Counts (Selection Later):</Text>
                                <Text fontSize="xs" color="#334155">
                                  {categoryList}
                                </Text>
                              </Box>
                            )}

                            {dishList.length === 0 && !categoryList && (
                              <Text fontSize="xs" color="#94a3b8" italic mt="1" pl="1">
                                No specific dishes listed for this meal.
                              </Text>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}
          </Box>
        )}

        {/* Regular Job Positions Section (for Hotel/Home jobs) */}
        {!isDaily && !isParty && (
          <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="sm" overflow="hidden">
            <Box p="4" borderBottom="1px solid #f1f5f9" bg="#fcfdfe">
              <Text fontSize="sm" fontWeight="800" color="#1e293b">Job Positions & Vacancy</Text>
            </Box>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg="#f8faff">
                  <Tr>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">#</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">Position</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">No. of Vacancies / Guests</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">Package / Salary Range</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">Experience Required</Th>
                    <Th {...thStyle} borderRight="1px solid #edf2f7">Joining Type</Th>
                    <Th {...thStyle}>Created Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {job.commercialStaffList && Array.isArray(job.commercialStaffList) && job.commercialStaffList.length > 0 ? (
                    job.commercialStaffList.map((s, idx) => {
                      const rawSal = s.salaryRange || s.salary || job.salaryRange || 'N/A';
                      const formattedSalary = rawSal.startsWith('₹') ? rawSal : (rawSal === 'N/A' ? 'N/A' : `₹${rawSal}`);
                      return (
                        <Tr key={idx}>
                          <Td {...tdStyle} borderRight="1px solid #edf2f7">{idx + 1}</Td>
                          <Td {...tdStyle} borderRight="1px solid #edf2f7" fontWeight="700" color="#475569">{s.staffCategory || s.role || job.jobPosition}</Td>
                          <Td {...tdStyle} borderRight="1px solid #edf2f7">{s.noOfStaff || s.count || '1'}</Td>
                          <Td {...tdStyle} borderRight="1px solid #edf2f7" color="#059669" fontWeight="700">{formattedSalary}</Td>
                          <Td {...tdStyle} borderRight="1px solid #edf2f7">{s.experienceRange || job.experienceRange || '-'}</Td>
                          <Td {...tdStyle} borderRight="1px solid #edf2f7">{job.joiningType || '-'}</Td>
                          <Td {...tdStyle}>{new Date(job.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Td>
                        </Tr>
                      );
                    })
                  ) : (
                    <Tr>
                      <Td {...tdStyle} borderRight="1px solid #edf2f7">1</Td>
                      <Td {...tdStyle} borderRight="1px solid #edf2f7" fontWeight="700" color="#475569">{job.jobPosition}</Td>
                      <Td {...tdStyle} borderRight="1px solid #edf2f7">{job.packageOrGuestOrVacancy || job.noOfGuests || '1'}</Td>
                      <Td {...tdStyle} borderRight="1px solid #edf2f7" color="#059669" fontWeight="700">
                        {(() => {
                          const sal = job.salaryRange || job.package || 'N/A';
                          return sal.startsWith('₹') ? sal : (sal === 'N/A' ? 'N/A' : `₹${sal}`);
                        })()}
                      </Td>
                      <Td {...tdStyle} borderRight="1px solid #edf2f7">{job.experienceRange || '-'}</Td>
                      <Td {...tdStyle} borderRight="1px solid #edf2f7">{job.joiningType || '-'}</Td>
                      <Td {...tdStyle}>{new Date(job.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}

        {/* Pricing & Advance Payment Details */}
        <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="sm" overflow="hidden">
          <Box p="4" borderBottom="1px solid #f1f5f9" bg="#fcfdfe">
            <HStack spacing="2">
              <Icon as={CreditCard} color="#059669" boxSize={5} />
              <Text fontSize="sm" fontWeight="800" color="#1e293b">Pricing & Payment Breakdown</Text>
            </HStack>
          </Box>
          <Table variant="simple">
            <Tbody>
              <DataRow label="25% Booking Advance Amount" value={`₹${job.advanceAmount || job.jobPostFee || (job.pricing?.advance) || 0}`} />
              <DataRow label="Payment Status" value={(job.paymentStatus || 'free').toUpperCase()} isBadge colorScheme={job.paymentStatus === 'paid' ? 'green' : 'yellow'} />
              {job.pricing && (
                <>
                  <DataRow label="Base Staff/Menu Charges" value={`₹${job.pricing.staffCharges || job.pricing.menuCharges || 0}`} />
                  <DataRow label="GST Amount" value={`₹${job.pricing.gst || 0}`} />
                  <DataRow label="Platform Fee" value={`₹${job.pricing.platformFee || 0}`} />
                  <DataRow label="Total Booking Amount" value={`₹${job.pricing.total || job.pricing.totalAmount || 0}`} />
                </>
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Job Details / Description Section */}
        <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="sm" overflow="hidden">
          <Box p="4" borderBottom="1px solid #f1f5f9" bg="#fcfdfe">
            <Text fontSize="sm" fontWeight="800" color="#1e293b">Additional Details & Overview</Text>
          </Box>
          <Table variant="simple">
            <Tbody>
              {job.image && (
                <Tr borderBottom="1px solid #f1f5f9">
                  <Td py="3" px="6" bg="#fcfdfe" w="300px" fontSize="sm" fontWeight="700" color="#1e293b" borderRight="1px solid #f1f5f9">Image</Td>
                  <Td py="5" px="6">
                    <Flex justify="center" w="full">
                      <Box borderRadius="lg" overflow="hidden" border="1px solid #edf2f7" boxShadow="sm">
                        <Image
                          src={job.image ? `${apiBase}/${job.image}` : '/placeholder-job.png'}
                          alt="job"
                          maxH="150px"
                          fallbackSrc="https://via.placeholder.com/150"
                        />
                      </Box>
                    </Flex>
                  </Td>
                </Tr>
              )}
              <DataRow label="Job / Event Title" value={job.title} />
              <DataRow label="Job Category" value={job.jobCategory === 'hotel' ? 'Hotel Job' : job.jobCategory === 'home' ? 'Home Cook Job' : job.jobCategory === 'party' ? 'Chef for Party' : 'Daily Staff Booking'} />
              <DataRow label="Overview" value={job.overview} />
              <DataRow label="Responsibilities" value={job.responsibilities} />
              <DataRow label="Requirements" value={job.requirements} />
              <DataRow label="Benefits & Facilities" value={job.benefits || job.basicFacility || 'N/A'} />
            </Tbody>
          </Table>
        </Box>

        {/* Transaction Info if paid */}
        {transaction && (
          <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="sm" overflow="hidden">
            <Box p="4" borderBottom="1px solid #f1f5f9" bg="#fcfdfe">
              <Text fontSize="sm" fontWeight="800" color="#1e293b">Payment Transaction Information</Text>
            </Box>
            <Table variant="simple">
              <Tbody>
                <Tr borderBottom="1px solid #f1f5f9">
                  <Td py="3" px="6" bg="#fcfdfe" w="300px" fontSize="sm" fontWeight="700" color="#1e293b" borderRight="1px solid #f1f5f9">Transaction ID</Td>
                  <Td py="3" px="6" fontSize="sm" color="#475569" fontWeight="500">
                    {transaction.paymentId || transaction.cfPaymentId || transaction.razorpayPaymentId || transaction._id}
                  </Td>
                </Tr>
                <Tr borderBottom="1px solid #f1f5f9">
                  <Td py="3" px="6" bg="#fcfdfe" w="300px" fontSize="sm" fontWeight="700" color="#1e293b" borderRight="1px solid #f1f5f9">Order ID / Reference</Td>
                  <Td py="3" px="6" fontSize="sm" color="#475569" fontWeight="500">
                    {transaction.orderId || transaction.cfOrderId || transaction.razorpayOrderId || '-'}
                  </Td>
                </Tr>
                <Tr borderBottom="1px solid #f1f5f9">
                  <Td py="3" px="6" bg="#fcfdfe" w="300px" fontSize="sm" fontWeight="700" color="#1e293b" borderRight="1px solid #f1f5f9">Amount</Td>
                  <Td py="3" px="6" fontSize="sm" color="#0f62fe" fontWeight="700">
                    ₹{transaction.amount}
                  </Td>
                </Tr>
                <Tr borderBottom="1px solid #f1f5f9">
                  <Td py="3" px="6" bg="#fcfdfe" w="300px" fontSize="sm" fontWeight="700" color="#1e293b" borderRight="1px solid #f1f5f9">Paid Date & Time</Td>
                  <Td py="3" px="6" fontSize="sm" color="#475569" fontWeight="500">
                    {new Date(transaction.createdAt).toLocaleString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                    })}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        )}

        {/* Candidate Responses Section */}
        <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="sm" p="5">
          <Flex justify="space-between" align="center" mb="4">
            <HStack spacing="2">
              <Icon as={Users} color={BRAND} />
              <Text fontSize="sm" fontWeight="800" color="#1e293b">Candidate / Staff Applications</Text>
            </HStack>
            <Button
              size="sm"
              bg={BRAND}
              color="white"
              onClick={onOpen}
              _hover={{ bg: '#003d91' }}
              borderRadius="lg"
            >
              View All Applicants
            </Button>
          </Flex>
          <HStack spacing="4">
            <Box bg="#f8faff" border="1px solid #dde6f5" p="4" borderRadius="xl" flex="1" textAlign="center" cursor="pointer" onClick={onOpen} _hover={{ boxShadow: 'sm' }} transition="all 0.2s">
              <Text fontSize="2xl" fontWeight="800" color={BRAND}>{appliedCount}</Text>
              <Text fontSize="xs" fontWeight="700" color="#64748b">Applied Candidates</Text>
            </Box>
            <Box bg="#f0fdf4" border="1px solid #c6f6d5" p="4" borderRadius="xl" flex="1" textAlign="center" cursor="pointer" onClick={onOpen} _hover={{ boxShadow: 'sm' }} transition="all 0.2s">
              <Text fontSize="2xl" fontWeight="800" color="green.600">{assignedCount}</Text>
              <Text fontSize="xs" fontWeight="700" color="#64748b">Assigned Candidates</Text>
            </Box>
          </HStack>
        </Box>
      </VStack>

      <JobApplicantsModal
        isOpen={isOpen}
        onClose={onClose}
        jobId={job._id}
        jobTitle={job.title}
      />

      <PageFooter />
    </Box>
  );
};

export default ViewJob;
