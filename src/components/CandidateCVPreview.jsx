import React, { forwardRef } from 'react';
import { Box, Flex, Text, HStack, VStack, Image, Grid, GridItem, Divider, Icon } from '@chakra-ui/react';
import { MapPin, Phone, Mail, Shield, CheckCircle2, Globe } from 'lucide-react';

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
    <Flex 
      ref={ref} 
      bg="white" 
      w="800px" 
      minH="1131px" 
      direction="column"
      color={PRIMARY_TEXT} 
      fontFamily="'Outfit', sans-serif" 
      style={{ WebkitFontSmoothing: 'antialiased' }}
    >
      <Flex flex="1">
        
        {/* Left Main Column */}
        <Box flex="6" p="10" pr="8" pt="12">
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
          
          {/* Last Company */}
          {candidate.workExperience?.lastCompany?.name && (
            <Box mb="4">
              <HStack justify="space-between" align="flex-end" mb="1">
                <Text fontSize="md" fontWeight="800" color={PRIMARY_TEXT}>
                  {candidate.workExperience.lastCompany.role || 'Job Position'}
                </Text>
                <Text fontSize="sm" fontWeight="700" color={PRIMARY_TEXT}>
                  {candidate.workExperience.lastCompany.duration || 'Duration N/A'}
                </Text>
              </HStack>
              <Text fontSize="sm" fontWeight="700" color={PRIMARY_TEXT} mb="3">
                {candidate.workExperience.lastCompany.name}
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
              </VStack>
            </Box>
          )}

          {/* Previous Experiences */}
          {candidate.workExperience?.experiences?.map((exp, idx) => (
            <Box mb="4" key={idx}>
              <HStack justify="space-between" align="flex-end" mb="1">
                <Text fontSize="md" fontWeight="800" color={PRIMARY_TEXT}>
                  {exp.jobProfile || 'Job Position'}
                </Text>
                <Text fontSize="sm" fontWeight="700" color={PRIMARY_TEXT}>
                  {exp.from} {exp.to ? `- ${exp.to}` : ''}
                </Text>
              </HStack>
              <Text fontSize="sm" fontWeight="700" color={PRIMARY_TEXT} mb="2">
                {exp.position || 'Company Name'}
              </Text>
              {exp.shortDetail && (
                <Text fontSize="sm" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall" pl="4">
                  {exp.shortDetail}
                </Text>
              )}
            </Box>
          ))}

          {/* Education Section */}
          {candidate.education && candidate.education.length > 0 && (
            <>
              <SectionHeading title="Education" />
              {candidate.education.map((edu, idx) => (
                <Box mb="4" key={idx}>
                  <HStack justify="space-between" align="flex-end" mb="1">
                    <Text fontSize="md" fontWeight="800" color={PRIMARY_TEXT}>
                      {edu.title || 'Degree/Certificate'}
                    </Text>
                    <Text fontSize="sm" fontWeight="700" color={PRIMARY_TEXT}>
                      {edu.from} {edu.to ? `- ${edu.to}` : ''}
                    </Text>
                  </HStack>
                  {edu.shortDetail && (
                    <Text fontSize="sm" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall">
                      {edu.shortDetail}
                    </Text>
                  )}
                </Box>
              ))}
            </>
          )}
          
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
        <Box flex="4" bg="linear-gradient(135deg, #004aad 0%, #0062e6 100%)" p="10" pl="8" color={LIGHT_TEXT}>
          
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
            <Box>
              <Flex bg="white" color={DARK_BLUE} p="1.5" borderRadius="full" align="center" justify="center" minW="26px" minH="26px" display="inline-flex" verticalAlign="middle" mr="3">
                <Icon as={MapPin} boxSize="14px" />
              </Flex>
              <Text as="span" fontSize="sm" fontWeight="600" display="inline-block" verticalAlign="middle">{currentAddress}</Text>
            </Box>
            <Box>
              <Flex bg="white" color={DARK_BLUE} p="1.5" borderRadius="full" align="center" justify="center" minW="26px" minH="26px" display="inline-flex" verticalAlign="middle" mr="3">
                <Icon as={Phone} boxSize="14px" />
              </Flex>
              <Text as="span" fontSize="sm" fontWeight="600" display="inline-block" verticalAlign="middle">{candidate.phone}</Text>
            </Box>
            <Box>
              <Flex bg="white" color={DARK_BLUE} p="1.5" borderRadius="full" align="center" justify="center" minW="26px" minH="26px" display="inline-flex" verticalAlign="middle" mr="3">
                <Icon as={Mail} boxSize="14px" />
              </Flex>
              <Text as="span" fontSize="sm" fontWeight="600" wordBreak="break-word" display="inline-block" verticalAlign="middle">{candidate.email || 'N/A'}</Text>
            </Box>
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
      </Flex>

      {/* Footer Section */}
      <Box w="full" bg="white" mt="auto">
        <Box p="6" px="8" pt="4">
          <HStack mb="4" spacing="3" align="center">
            <Flex bg="#004aad" color="white" p="1.5" borderRadius="full" align="center" justify="center">
              <Icon as={Shield} size={18} />
            </Flex>
            <Text color="#004aad" fontWeight="800" fontSize="lg" letterSpacing="wide">
              VERIFICATION STATUS
            </Text>
          </HStack>
          
          <Flex justify="space-between" align="center" mb="5">
            <Box whiteSpace="nowrap">
              <Icon as={CheckCircle2} color="#38a169" boxSize="18px" display="inline-block" verticalAlign="middle" mr="2" />
              <Text as="span" fontSize="sm" fontWeight="700" color="#334155" display="inline-block" verticalAlign="middle">Aadhaar Verified</Text>
            </Box>
            <Box whiteSpace="nowrap">
              <Icon as={CheckCircle2} color="#38a169" boxSize="18px" display="inline-block" verticalAlign="middle" mr="2" />
              <Text as="span" fontSize="sm" fontWeight="700" color="#334155" display="inline-block" verticalAlign="middle">Mobile Verified</Text>
            </Box>
            <Box whiteSpace="nowrap">
              <Icon as={CheckCircle2} color="#38a169" boxSize="18px" display="inline-block" verticalAlign="middle" mr="2" />
              <Text as="span" fontSize="sm" fontWeight="700" color="#334155" display="inline-block" verticalAlign="middle">Address Verified</Text>
            </Box>
            <Box whiteSpace="nowrap">
              <Icon as={CheckCircle2} color="#38a169" boxSize="18px" display="inline-block" verticalAlign="middle" mr="2" />
              <Text as="span" fontSize="sm" fontWeight="700" color="#334155" display="inline-block" verticalAlign="middle">Experience Verified</Text>
            </Box>
          </Flex>

          <Flex justify="center" mb="2">
            <Box bg="#f0fdf4" border="1px solid" borderColor="#bbf7d0" borderRadius="full" px="6" py="2" whiteSpace="nowrap">
              <Icon as={CheckCircle2} color="#16a34a" boxSize="18px" display="inline-block" verticalAlign="middle" mr="2" />
              <Text as="span" fontSize="sm" fontWeight="800" color="#166534" display="inline-block" verticalAlign="middle">Profile Reviewed by ZomoCook</Text>
            </Box>
          </Flex>
        </Box>
        
        <Flex bg="linear-gradient(135deg, #004aad 0%, #0062e6 100%)" p="4" px="8" justify="space-between" align="center">
          <Box>
            <Flex bg="white" p="1.5" borderRadius="md" color="#004aad" align="center" justify="center" minW="32px" minH="32px" display="inline-flex" verticalAlign="middle" mr="4">
              <Icon as={Shield} boxSize="20px" />
            </Flex>
            <Box display="inline-block" verticalAlign="middle">
              <Text color="white" fontWeight="700" fontSize="sm">This profile has been verified by ZomoCook Recruitment Team.</Text>
              <Text color="whiteAlpha.900" fontSize="xs" fontWeight="500">We ensure trusted, skilled & professional staff for your business.</Text>
            </Box>
          </Box>
          <Box whiteSpace="nowrap">
            <Icon as={Globe} boxSize="18px" color="white" display="inline-block" verticalAlign="middle" mr="2" />
            <Text as="span" color="white" fontSize="sm" fontWeight="600" display="inline-block" verticalAlign="middle">www.zomocook.com</Text>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
});

export default CandidateCVPreview;
