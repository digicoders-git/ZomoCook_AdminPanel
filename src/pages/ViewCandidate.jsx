import React, { useState, useEffect } from 'react';
import { 
  Box, Flex, Text, HStack, VStack, Badge, Button, Avatar, Icon, Spinner, 
  SimpleGrid, Divider, Tag, Grid, GridItem, Menu, MenuButton, MenuList, MenuItem,
  Table, Thead, Tbody, Tr, Th, Td, Image, Link as ChakraLink, Tooltip, IconButton,
  Tabs, TabList, Tab, TabPanels, TabPanel
} from '@chakra-ui/react';
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, IndianRupee, Globe, 
  FileText, CheckCircle, Settings, Edit3, CheckSquare, CalendarDays, UserCircle, ChevronDown,
  Clock, ExternalLink, GraduationCap, Building2, Award, Download, Eye, Share2, ImageIcon
} from 'lucide-react';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { PageHeader, FormCard, PageFooter, BRAND, ACCENT, tableHeadStyle, thStyle, tdStyle, trHover } from '../components/ui';
import axios from 'axios';

const ViewCandidate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [candidate, setCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Read query params for initial tab
    const params = new URLSearchParams(location.search);
    const view = params.get('view');
    if (view === 'applied' || view === 'shortlisted' || view === 'demo') {
      setActiveTab(8); // Application History tab
    } else if (view === 'details') {
      setActiveTab(0);
    }

    const fetchCandidate = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(`${apiUrl}/candidates/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (response.data.success) {
          setCandidate(response.data.candidate);
        }
      } catch (error) {
        console.error('Error fetching candidate:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidate();
  }, [id]);

  if (isLoading) return <Flex h="80vh" align="center" justify="center"><Spinner size="xl" color={BRAND} thickness="4px" /></Flex>;
  if (!candidate) return <Box p="10" textAlign="center">Candidate not found.</Box>;

  const apiUrl = import.meta.env.VITE_API_URL;
  const apiBase = apiUrl.replace('/api', '');

  const DetailRow = ({ label, value, isTag = false }) => (
    <Tr borderBottom="1px solid #f1f5f9">
      <Td py="3" px="6" bg="#fcfdfe" w="300px" fontSize="sm" fontWeight="700" color="#475569" borderRight="1px solid #f1f5f9">{label}</Td>
      <Td py="3" px="6" fontSize="sm" color="#1e293b" fontWeight="500">
        {isTag ? (
          <HStack spacing="2">
            {value?.map((v, i) => <Badge key={i} bg="#1e293b" color="white" px="3" py="0.5" borderRadius="md" textTransform="none" fontSize="xs">{v}</Badge>)}
          </HStack>
        ) : value || 'N/A'}
      </Td>
    </Tr>
  );

  const tabs = ['Basic Profile', 'Job Preference', 'Cooking Skills', 'Work Experience', 'Career Highlights', 'Documents Upload', 'Social Media', 'Photo Gallery', 'Application History'];

  return (
    <Box pb="10">
      <PageHeader title="Candidate Details" breadcrumb="Candidate Details" actions={[<Button key="back" onClick={() => navigate(-1)} size="sm" bg="#ff6b00" color="white" borderRadius="md" leftIcon={<Icon as={ArrowLeft} size={14} />} _hover={{ bg: '#e65f00' }}>Back</Button>]} />

      <Box bg="white" borderRadius="none" border="1px solid #e8edf5" boxShadow="sm" overflow="hidden">
        <Box p="5" borderBottom="1px solid #f1f5f9"><Text fontSize="md" fontWeight="800" color="#1e293b">Candidate Details</Text></Box>
        
        <Tabs index={activeTab} onChange={setActiveTab} variant="unstyled" p="5">
          <TabList display="flex" flexWrap="wrap" gap="2" mb="8">
            {tabs.map((tab, index) => (
              <Tab key={tab} fontSize="xs" fontWeight="600" px="5" py="2.5" borderRadius="none" color={activeTab === index ? 'white' : '#475569'} bg={activeTab === index ? "#ff6b00" : 'transparent'} border={activeTab === index ? "none" : "1px solid transparent"} _hover={{ bg: activeTab === index ? '#ff6b00' : '#f8faff' }}>{tab}</Tab>
            ))}
          </TabList>

          <TabPanels>
            {/* Basic Profile */}
            <TabPanel p="0">
              <Table variant="simple" border="1px solid #f1f5f9">
                <Tbody>
                  <DetailRow label="Full Name" value={candidate.name} />
                  <DetailRow label="Email Address" value={candidate.email} />
                  <DetailRow label="Phone No." value={candidate.phone} />
                  <DetailRow label="Gender" value={candidate.gender} />
                  <DetailRow label="Date of Birth" value={candidate.dob ? new Date(candidate.dob).toLocaleDateString('en-GB') : 'N/A'} />
                  <DetailRow label="Age" value={candidate.dob ? Math.floor((new Date() - new Date(candidate.dob)) / 31557600000) : 'N/A'} />
                  <DetailRow label="Marital Status" value={candidate.maritalStatus} />
                  <DetailRow label="Languages Known" value={candidate.languages} isTag />
                </Tbody>
              </Table>
            </TabPanel>

            {/* Job Preference */}
            <TabPanel p="0">
              <Table variant="simple" border="1px solid #f1f5f9">
                <Tbody>
                  <DetailRow label="Job Category" value={candidate.jobPreference?.jobCategory?.join(', ')} />
                  <DetailRow label="Job Type" value={candidate.jobPreference?.jobType?.join(', ')} />
                  <DetailRow label="Experience" value={`${candidate.jobPreference?.experience?.value} ${candidate.jobPreference?.experience?.unit}`} />
                  <DetailRow label="Current Salary" value={`₹${candidate.jobPreference?.currentSalary}`} />
                  <DetailRow label="Expected Salary" value={`₹${candidate.jobPreference?.expectedSalary}`} />
                  <DetailRow label="Preferred Cities" value={candidate.jobPreference?.preferredCities?.join(', ')} />
                  <DetailRow label="Job Positions" value={candidate.jobPreference?.jobPositions?.join(', ')} />
                </Tbody>
              </Table>
            </TabPanel>

            {/* Cooking Skills */}
            <TabPanel p="0">
              <Table variant="simple" border="1px solid #f1f5f9">
                <Tbody>
                  <DetailRow label="Cooking Preference" value={candidate.cookingSkills?.preference} />
                  {candidate.cookingSkills?.skills?.map((s, i) => (
                    <DetailRow key={i} label={s.category} value={s.skills} />
                  ))}
                </Tbody>
              </Table>
            </TabPanel>

            {/* Work Experience */}
            <TabPanel p="0">
               <Text fontSize="sm" fontWeight="800" p="4" bg="#f8faff" borderBottom="1px solid #f1f5f9">Last Company Details</Text>
               <Table variant="simple" border="1px solid #f1f5f9">
                 <Tbody>
                    <DetailRow label="Company Name" value={candidate.workExperience?.lastCompany?.name} />
                    <DetailRow label="Role" value={candidate.workExperience?.lastCompany?.role} />
                    <DetailRow label="Duration" value={candidate.workExperience?.lastCompany?.duration} />
                    <DetailRow label="Reason for Leaving" value={candidate.workExperience?.lastCompany?.reasonForLeaving} />
                 </Tbody>
               </Table>
               <Text fontSize="sm" fontWeight="800" p="4" bg="#f8faff" borderY="1px solid #f1f5f9" mt="6">Experience History</Text>
               <Table variant="simple" border="1px solid #f1f5f9">
                 <Tbody>
                    {candidate.workExperience?.experiences?.map((exp, i) => (
                        <DetailRow key={i} label={exp.position} value={`${exp.from} to ${exp.to}`} />
                    ))}
                 </Tbody>
               </Table>
            </TabPanel>

            {/* Career Highlights */}
            <TabPanel p="0">
              <Table variant="simple" border="1px solid #f1f5f9">
                <Tbody>
                  <DetailRow label="About Me" value={candidate.careerHighlights?.aboutMe} />
                  <DetailRow label="Top Highlights" value={candidate.careerHighlights?.highlights?.join(', ')} />
                  <DetailRow label="Why Choose Me" value={candidate.careerHighlights?.whyChooseMe?.join(', ')} />
                </Tbody>
              </Table>
            </TabPanel>

            {/* Documents Upload */}
            <TabPanel p="0">
              <Table variant="simple" border="1px solid #f1f5f9">
                <Tbody>
                  {['idProof', 'addressProof', 'policeVerification', 'resume', 'academicCertificate', 'experienceCertificate'].map(doc => (
                    <Tr key={doc} borderBottom="1px solid #f1f5f9">
                        <Td py="3" px="6" bg="#fcfdfe" w="300px" fontSize="sm" fontWeight="700" color="#475569" borderRight="1px solid #f1f5f9" textTransform="capitalize">{doc.replace(/([A-Z])/g, ' $1')}</Td>
                        <Td py="3" px="6">
                            {candidate.documents?.[doc] ? (
                                <HStack spacing="4">
                                    <ChakraLink href={`${apiUrl}/${candidate.documents[doc]}`} isExternal color="#ff6b00" fontWeight="600" fontSize="sm">View Document</ChakraLink>
                                    <Badge colorScheme="green">Verified</Badge>
                                </HStack>
                            ) : <Text fontSize="sm" color="red.400">Not Uploaded</Text>}
                        </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>

            {/* Social Media */}
            <TabPanel p="0">
              <Table variant="simple" border="1px solid #f1f5f9">
                <Tbody>
                    {candidate.socialMedia?.map((s, i) => (
                        <DetailRow key={i} label={s.platform} value={s.url} />
                    ))}
                    {candidate.socialMedia?.length === 0 && <Tr><Td colSpan={2} p="10" textAlign="center" color="#94a3b8">No social media links added.</Td></Tr>}
                </Tbody>
              </Table>
            </TabPanel>

            {/* Photo Gallery */}
            <TabPanel p="5">
               <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing="4">
                  {candidate.photoGallery?.map((url, i) => (
                    <Box key={i} borderRadius="lg" overflow="hidden" h="150px" border="1px solid #f1f5f9" cursor="pointer" onClick={() => window.open(`${apiUrl}/${url}`, '_blank')}>
                      <Image src={`${apiUrl}/${url}`} alt="gallery" objectFit="cover" w="100%" h="100%" />
                    </Box>
                  ))}
               </SimpleGrid>
               {candidate.photoGallery?.length === 0 && <Text p="10" textAlign="center" color="#94a3b8">No photos in gallery.</Text>}
            </TabPanel>

            {/* Application History */}
            <TabPanel p="0">
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#f8faff"><Tr><Th {...thStyle}>Job Title</Th><Th {...thStyle}>Status</Th><Th {...thStyle}>Applied Date</Th><Th {...thStyle}>Action</Th></Tr></Thead>
                  <Tbody>
                    {candidate.applications?.map(app => (
                      <Tr key={app._id} {...trHover}>
                        <Td {...tdStyle} fontWeight="700">{app.job?.title}</Td>
                        <Td {...tdStyle}><Badge colorScheme="blue">{app.status}</Badge></Td>
                        <Td {...tdStyle}>{new Date(app.appliedDate).toLocaleDateString()}</Td>
                        <Td {...tdStyle}><Button size="xs" colorScheme="blue" variant="ghost">View Job</Button></Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

          </TabPanels>
        </Tabs>
      </Box>
      <PageFooter />
    </Box>
  );
};

export default ViewCandidate;
