import React, { forwardRef } from 'react';
import { Box, Flex, Text, HStack, VStack, Image, Grid, Divider, Icon } from '@chakra-ui/react';
import { MapPin, Phone, Mail } from 'lucide-react';

const CandidateCVPreview = forwardRef(({ candidate }, ref) => {
  if (!candidate) return null;

  const DARK_BLUE = '#004aad'; // ZomoCook Brand Color
  const LIGHT_TEXT = '#ffffff';
  const PRIMARY_TEXT = '#004aad';
  const SECONDARY_TEXT = '#475569';
  const LIGHT_BLUE = '#e0e7ff'; // For horizontal lines

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const diff = Date.now() - new Date(dob).getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return Math.abs(age) + ' Years';
  };

  const currentAddress = [candidate.city, candidate.state].filter(Boolean).join(', ') || candidate.address || 'N/A';
  const languages = candidate.languages?.join(', ') || 'N/A';
  const skills = candidate.skills?.length > 0 ? candidate.skills : ['Table Service', 'Customer Handling', 'Food & Beverage Service', 'POS Basic', 'Hygiene & Cleanliness'];

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const apiBase = apiUrl.replace('/api', '');
  
  // A simple base64 encoded grey SVG avatar placeholder to avoid connection errors from external URLs during html2canvas
  const placeholderBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2QxZDVkYiI+PHBhdGggZD0iTTEyIDJhNSA1IDAgMSAwIDUgNSAgNSA1IDAgMCAwLTUtNXptMCA4YTMgMyAwIDEgMSAzLTMgIDMgMyAwIDAgMS0zIDN6bTkgMTF2LTFhNyA3IDAgMCAwLTctNyA3IDcgMCAwIDAtNyA3diFIM3YtMWE5IDkgMCAwIDEgOS05IDkgOSAwIDAgMSA5IDl2MXoiLz48L3N2Zz4=';

  const profileImageSrc = candidate.profileImage && !candidate.profileImage.includes('default') 
    ? `${apiBase}/${candidate.profileImage}` 
    : placeholderBase64;

  const SectionHeading = ({ title }) => (
    <Box mt="6" mb="2">
      <Text fontSize="lg" fontWeight="800" color={PRIMARY_TEXT} textTransform="uppercase" letterSpacing="wide">
        {title}
      </Text>
      <Divider borderColor={LIGHT_BLUE} borderWidth="1.5px" mt="1" opacity={1} />
    </Box>
  );

  const SidebarHeading = ({ title }) => (
    <Box mt="8" mb="3" w="full">
      <Text fontSize="md" fontWeight="800" color={LIGHT_TEXT} textTransform="uppercase" letterSpacing="wide">
        {title}
      </Text>
      <Divider borderColor="#3b82f6" borderWidth="1px" mt="1" opacity={0.6} />
    </Box>
  );

  return (
    <Box 
      ref={ref} 
      bg="white" 
      w="800px" 
      minH="1131px" 
      color={PRIMARY_TEXT} 
      fontFamily="'Outfit', sans-serif" 
      style={{ WebkitFontSmoothing: 'antialiased' }}
    >
      <Grid templateColumns="60% 40%" h="full" minH="1131px">
        
        {/* Left Main Column */}
        <Box p="10" pr="8" pt="12">
          <Text fontSize="5xl" fontWeight="900" color={PRIMARY_TEXT} letterSpacing="tighter" textTransform="uppercase" lineHeight="1.1">
            {candidate.name}
          </Text>
          <Text fontSize="xl" fontWeight="600" color={SECONDARY_TEXT} mt="2" mb="6">
            {candidate.jobPreference?.jobCategory?.join(' / ') || candidate.jobPreference?.jobPositions?.join(' / ') || 'Professional Chef'}
          </Text>
          
          <Divider borderColor={LIGHT_BLUE} borderWidth="2px" opacity={1} />

          <SectionHeading title="Summary Statement" />
          <Text fontSize="sm" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall">
            {candidate.about || `Experienced and dedicated professional with a background in food service and hospitality. Proven ability to handle guest relations, coordinate with teams, and maintain a high standard of hygiene and service. Seeking a challenging role to leverage my ${candidate.jobPreference?.experience?.value || '0'} ${candidate.jobPreference?.experience?.unit || 'Years'} of experience to contribute to operational excellence and customer satisfaction.`}
          </Text>

          <SectionHeading title="Work Experience" />
          <Box mb="4">
            <HStack justify="space-between" align="flex-end" mb="1">
              <Text fontSize="md" fontWeight="800" color={PRIMARY_TEXT}>
                {candidate.workExperience?.lastCompany?.role || 'Job Position'}
              </Text>
              <Text fontSize="sm" fontWeight="700" color={PRIMARY_TEXT}>
                {candidate.workExperience?.lastCompany?.duration || 'Duration N/A'}
              </Text>
            </HStack>
            <Text fontSize="sm" fontWeight="700" color={PRIMARY_TEXT} mb="3">
              {candidate.workExperience?.lastCompany?.name || 'Company Name'}
            </Text>
            <VStack align="start" spacing="2" pl="4">
              <HStack align="start">
                <Text color={SECONDARY_TEXT} fontSize="sm">•</Text>
                <Text fontSize="sm" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall">
                  Demonstrated excellence in delivering high-quality service and maintaining operational efficiency.
                </Text>
              </HStack>
              <HStack align="start">
                <Text color={SECONDARY_TEXT} fontSize="sm">•</Text>
                <Text fontSize="sm" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall">
                  Collaborated with team members to ensure all standards and procedures were strictly followed.
                </Text>
              </HStack>
              <HStack align="start">
                <Text color={SECONDARY_TEXT} fontSize="sm">•</Text>
                <Text fontSize="sm" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall">
                  Handled various responsibilities effectively, adapting to fast-paced environments.
                </Text>
              </HStack>
            </VStack>
          </Box>
          
          <SectionHeading title="Additional Details" />
          <Grid templateColumns="1fr 1fr" gap="4">
            <Box>
              <Text fontSize="xs" fontWeight="700" color={SECONDARY_TEXT} textTransform="uppercase">Total Experience</Text>
              <Text fontSize="sm" fontWeight="700" color={PRIMARY_TEXT}>{candidate.jobPreference?.experience?.value || '0'} {candidate.jobPreference?.experience?.unit === 'months' ? 'Months' : 'Years'}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="700" color={SECONDARY_TEXT} textTransform="uppercase">Expected Salary</Text>
              <Text fontSize="sm" fontWeight="700" color={PRIMARY_TEXT}>₹{candidate.jobPreference?.expectedSalary || '0'} / Month</Text>
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="700" color={SECONDARY_TEXT} textTransform="uppercase">Current Salary</Text>
              <Text fontSize="sm" fontWeight="700" color={PRIMARY_TEXT}>₹{candidate.jobPreference?.currentSalary || '0'} / Month</Text>
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="700" color={SECONDARY_TEXT} textTransform="uppercase">Ready to Relocate</Text>
              <Text fontSize="sm" fontWeight="700" color={PRIMARY_TEXT}>Yes</Text>
            </Box>
          </Grid>
        </Box>

        {/* Right Sidebar Column */}
        <Box bg={DARK_BLUE} p="10" pl="8" h="full" color={LIGHT_TEXT}>
          
          {/* Profile Picture at Top Right */}
          <Flex justify="center" mb="8" mt="2">
            <Box 
              border="4px solid rgba(255, 255, 255, 0.2)" 
              borderRadius="full" 
              overflow="hidden"
              w="180px"
              h="180px"
              bg="white"
            >
              <Image 
                src={profileImageSrc} 
                alt={candidate.name} 
                w="full" 
                h="full" 
                objectFit="cover" 
              />
            </Box>
          </Flex>

          {/* Contact Info */}
          <VStack align="start" spacing="4" w="full">
            <HStack align="flex-start" spacing="4">
              <Flex bg="white" color={DARK_BLUE} p="1.5" borderRadius="full">
                <Icon as={MapPin} size={14} />
              </Flex>
              <Text fontSize="sm" fontWeight="600" mt="1">{currentAddress}</Text>
            </HStack>
            <HStack align="flex-start" spacing="4">
              <Flex bg="white" color={DARK_BLUE} p="1.5" borderRadius="full">
                <Icon as={Phone} size={14} />
              </Flex>
              <Text fontSize="sm" fontWeight="600" mt="1">{candidate.phone}</Text>
            </HStack>
            <HStack align="flex-start" spacing="4">
              <Flex bg="white" color={DARK_BLUE} p="1.5" borderRadius="full">
                <Icon as={Mail} size={14} />
              </Flex>
              <Text fontSize="sm" fontWeight="600" mt="1" wordBreak="break-word">{candidate.email || 'N/A'}</Text>
            </HStack>
          </VStack>

          <SidebarHeading title="Core Qualifications" />
          <VStack align="start" spacing="3" pl="1" w="full">
            {skills.map((skill, idx) => (
              <HStack key={idx} align="start" spacing="3">
                <Text color="white" fontSize="sm">•</Text>
                <Text fontSize="sm" fontWeight="600">{skill}</Text>
              </HStack>
            ))}
          </VStack>

          <SidebarHeading title="Personal Details" />
          <VStack align="start" spacing="4" w="full">
            <Box>
              <Text fontSize="xs" fontWeight="700" color="#94a3b8">Age</Text>
              <Text fontSize="sm" fontWeight="700">{candidate.age ? `${candidate.age} Years` : calculateAge(candidate.dob)}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="700" color="#94a3b8">Gender</Text>
              <Text fontSize="sm" fontWeight="700">{candidate.gender ? candidate.gender.charAt(0).toUpperCase() + candidate.gender.slice(1) : 'N/A'}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="700" color="#94a3b8">Marital Status</Text>
              <Text fontSize="sm" fontWeight="700">{candidate.maritalStatus ? candidate.maritalStatus.charAt(0).toUpperCase() + candidate.maritalStatus.slice(1) : 'N/A'}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="700" color="#94a3b8">Languages</Text>
              <Text fontSize="sm" fontWeight="700">{languages}</Text>
            </Box>
          </VStack>

          <SidebarHeading title="Certifications" />
          <VStack align="start" spacing="3" pl="1" w="full">
            <HStack align="start" spacing="3">
              <Text color="white" fontSize="sm">•</Text>
              <Text fontSize="sm" fontWeight="600">Verified Profile – ZomoCook</Text>
            </HStack>
            <HStack align="start" spacing="3">
              <Text color="white" fontSize="sm">•</Text>
              <Text fontSize="sm" fontWeight="600">Aadhaar & Mobile Verified</Text>
            </HStack>
          </VStack>

        </Box>
      </Grid>
    </Box>
  );
});

export default CandidateCVPreview;
