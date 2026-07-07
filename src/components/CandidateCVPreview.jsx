import React, { forwardRef, useState } from 'react';
import { Box, Flex, Text, HStack, VStack, Image, Grid, Divider, Icon } from '@chakra-ui/react';

const CandidateCVPreview = forwardRef(({ candidate }, ref) => {
  const [imgError, setImgError] = useState(false);
  if (!candidate) return null;

  const DARK_BLUE = '#004aad';
  const LIGHT_TEXT = '#ffffff';
  const PRIMARY_TEXT = '#004aad';
  const SECONDARY_TEXT = '#475569';
  const LIGHT_BLUE = '#e0e7ff';

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
  
  const placeholderBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2QxZDVkYiI+PHBhdGggZD0iTTEyIDJhNSA1IDAgMSAwIDUgNSAgNSA1IDAgMCAwLTUtNXptMCA4YTMgMyAwIDEgMSAzLTMgIDMgMyAwIDAgMS0zIDN6bTkgMTF2LTFhNyA3IDAgMCAwLTctNyA3IDcgMCAwIDAtNyA3diFIM3YtMWE5IDkgMCAwIDEgOS05IDkgOSAwIDAgMSA5IDl2MXoiLz48L3N2Zz4=';

  const profileImageSrc = candidate.profileImage && !candidate.profileImage.includes('default') && !imgError
    ? `${apiBase}/${candidate.profileImage}` 
    : placeholderBase64;

  const SectionHeading = ({ title }) => (
    <Box mt="6" mb="3">
      <Text fontSize="sm" fontWeight="800" color={PRIMARY_TEXT} textTransform="uppercase" letterSpacing="wider">
        {title}
      </Text>
      <Divider borderColor={LIGHT_BLUE} borderWidth="1.5px" mt="2" opacity={1} />
    </Box>
  );

  const SidebarHeading = ({ title }) => (
    <Box mt="8" mb="4" w="full">
      <Text fontSize="sm" fontWeight="800" color={LIGHT_TEXT} textTransform="uppercase" letterSpacing="wider">
        {title}
      </Text>
      <Divider borderColor="#3b82f6" borderWidth="1px" mt="2" opacity={0.6} />
    </Box>
  );

  const role = candidate.jobPreference?.jobPositions?.[0] || candidate.jobPreference?.jobCategory?.[0] || 'Professional Chef';
  const expValueRaw = candidate.jobPreference?.experience?.value || '0';
  const expUnitRaw = candidate.jobPreference?.experience?.unit === 'months' ? 'Months' : 'Years';
  const expString = String(expValueRaw).toLowerCase().includes('year') ? expValueRaw : `${expValueRaw}+ ${expUnitRaw}`;
  const subtitle = `${role} - ${expString} Experience`;

  const expectedSalary = parseInt(candidate.jobPreference?.expectedSalary);
  const expectedSalaryText = isNaN(expectedSalary) || expectedSalary === 0 ? 'Not Disclosed' : `₹${expectedSalary} - ₹${expectedSalary + 5000} / Month`;

  const currentSalary = parseInt(candidate.jobPreference?.currentSalary);
  const currentSalaryText = isNaN(currentSalary) || currentSalary === 0 ? 'Not Disclosed' : `₹${currentSalary} - ₹${currentSalary + 5000} / Month`;

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
          <Text fontSize="4xl" fontWeight="900" color={PRIMARY_TEXT} letterSpacing="tight" textTransform="uppercase" lineHeight="1.1">
            {candidate.name}
          </Text>
          <Text fontSize="sm" fontWeight="800" color={PRIMARY_TEXT} mt="2" mb="6">
            {subtitle}
          </Text>
          
          <SectionHeading title="Summary" />
          <Text fontSize="xs" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall">
            {candidate.about || `Experienced and dedicated hospitality professional with ${expValueRaw}+ ${expUnitRaw.toLowerCase()} of expertise in food service operations, team coordination, guest handling, and maintaining high standards of hygiene and service. Seeking a challenging role to contribute to operational excellence and customer satisfaction.`}
          </Text>

          <SectionHeading title="Work Experience" />
          
          {/* Last Company */}
          {candidate.workExperience?.lastCompany?.name && (
            <Box mb="5">
              <HStack justify="space-between" align="flex-end" mb="1">
                <Text fontSize="sm" fontWeight="800" color={PRIMARY_TEXT}>
                  {candidate.workExperience.lastCompany.name}
                </Text>
                <Text fontSize="xs" fontWeight="800" color={PRIMARY_TEXT}>
                  {candidate.workExperience.lastCompany.duration || 'Duration N/A'}
                </Text>
              </HStack>
              <Text fontSize="xs" fontWeight="700" color={PRIMARY_TEXT} mb="2">
                {candidate.workExperience.lastCompany.role || 'Job Position'}
              </Text>
              <VStack align="start" spacing="2" pl="0" mt="2">
                <HStack align="start" spacing="2">
                  <Text color={SECONDARY_TEXT} fontSize="xs" mt="0.5">•</Text>
                  <Text fontSize="xs" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall">
                    Delivered high-quality service and maintained operational efficiency.
                  </Text>
                </HStack>
                <HStack align="start" spacing="2">
                  <Text color={SECONDARY_TEXT} fontSize="xs" mt="0.5">•</Text>
                  <Text fontSize="xs" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall">
                    Collaborated with team members and ensured all standards and procedures were followed.
                  </Text>
                </HStack>
              </VStack>
            </Box>
          )}

          {/* Previous Experiences */}
          {candidate.workExperience?.experiences?.map((exp, idx) => (
            <Box mb="4" key={idx}>
              <HStack justify="space-between" align="flex-end" mb="1">
                <Text fontSize="xs" fontWeight="800" color={PRIMARY_TEXT}>
                  {exp.jobProfile || 'Job Position'}
                </Text>
                <Text fontSize="xs" fontWeight="800" color={PRIMARY_TEXT}>
                  {exp.from} {exp.to ? `- ${exp.to}` : ''}
                </Text>
              </HStack>
              {exp.position && (
                <Text fontSize="xs" fontWeight="700" color={PRIMARY_TEXT} mb="2">
                  {exp.position}
                </Text>
              )}
              {exp.shortDetail && (
                <Text fontSize="xs" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall" pl="0" mt="1">
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
                    <Text fontSize="sm" fontWeight="800" color={PRIMARY_TEXT}>
                      {edu.title || 'Degree/Certificate'}
                    </Text>
                    <Text fontSize="xs" fontWeight="800" color={PRIMARY_TEXT}>
                      {edu.from} {edu.to ? `- ${edu.to}` : ''}
                    </Text>
                  </HStack>
                  {edu.shortDetail && (
                    <Text fontSize="xs" color={SECONDARY_TEXT} fontWeight="500" lineHeight="tall">
                      {edu.shortDetail}
                    </Text>
                  )}
                </Box>
              ))}
            </>
          )}
          
          <SectionHeading title="Additional Details" />
          <Flex wrap="wrap" rowGap="4" columnGap="0">
            <Box w="50%">
              <Text fontSize="xs" fontWeight="600" color={SECONDARY_TEXT} mb="1">Total Experience</Text>
              <Text fontSize="sm" fontWeight="800" color={PRIMARY_TEXT}>{expString}</Text>
            </Box>
            <Box w="50%">
              <Text fontSize="xs" fontWeight="600" color={SECONDARY_TEXT} mb="1">Expected Salary</Text>
              <Text fontSize="sm" fontWeight="800" color={PRIMARY_TEXT}>{expectedSalaryText}</Text>
            </Box>
            <Box w="50%">
              <Text fontSize="xs" fontWeight="600" color={SECONDARY_TEXT} mb="1">Current Salary</Text>
              <Text fontSize="sm" fontWeight="800" color={PRIMARY_TEXT}>{currentSalaryText}</Text>
            </Box>
            <Box w="50%">
              <Text fontSize="xs" fontWeight="600" color={SECONDARY_TEXT} mb="1">Ready to Relocate</Text>
              <Text fontSize="sm" fontWeight="800" color={PRIMARY_TEXT}>Yes</Text>
            </Box>
          </Flex>
        </Box>

        {/* Right Sidebar Column */}
        <Box flex="4" bg="linear-gradient(135deg, #004aad 0%, #0062e6 100%)" p="10" pl="8" color={LIGHT_TEXT}>
          
          {/* Profile Picture at Top Right */}
          <Flex justify="center" mb="8" mt="2">
            <Box 
              border="4px solid rgba(255, 255, 255, 0.2)" 
              borderRadius="full" 
              overflow="hidden"
              w="150px"
              h="150px"
              bg="white"
            >
              <Image 
                src={profileImageSrc} 
                alt={candidate.name} 
                w="full" 
                h="full" 
                objectFit="cover" 
                onError={() => setImgError(true)}
              />
            </Box>
          </Flex>

          {/* Contact Info */}
          <Box w="full">
            <Flex mb="4" align="center" gap="3">
              <Flex bg="white" borderRadius="full" w="24px" h="24px" align="center" justify="center" flexShrink={0} style={{ position: 'relative', top: '2px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#004aad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </Flex>
              <Text fontSize="xs" fontWeight="600">{currentAddress}</Text>
            </Flex>
            <Flex mb="4" align="center" gap="3">
              <Flex bg="white" borderRadius="full" w="24px" h="24px" align="center" justify="center" flexShrink={0} style={{ position: 'relative', top: '2px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#004aad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </Flex>
              <Text fontSize="xs" fontWeight="600">{candidate.phone}</Text>
            </Flex>
            <Flex align="center" gap="3">
              <Flex bg="white" borderRadius="full" w="24px" h="24px" align="center" justify="center" flexShrink={0} style={{ position: 'relative', top: '2px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#004aad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </Flex>
              <Text fontSize="xs" fontWeight="600" wordBreak="break-word">{candidate.email || 'N/A'}</Text>
            </Flex>
          </Box>

          <SidebarHeading title="Core Qualifications" />
          <VStack align="start" spacing="2" pl="1" w="full">
            {skills.map((skill, idx) => (
              <HStack key={idx} align="start" spacing="3">
                <Text color="white" fontSize="xs" mt="0.5">•</Text>
                <Text fontSize="xs" fontWeight="600">{skill}</Text>
              </HStack>
            ))}
          </VStack>

          <SidebarHeading title="Personal Details" />
          <Flex direction="column" gap="3" w="full">
            <Flex w="full">
              <Text fontSize="xs" fontWeight="500" color="whiteAlpha.800" w="100px">Age</Text>
              <Text fontSize="xs" fontWeight="700" flex="1">{candidate.age ? `${candidate.age} Years` : calculateAge(candidate.dob)}</Text>
            </Flex>

            <Flex w="full">
              <Text fontSize="xs" fontWeight="500" color="whiteAlpha.800" w="100px">Gender</Text>
              <Text fontSize="xs" fontWeight="700" flex="1">{candidate.gender ? candidate.gender.charAt(0).toUpperCase() + candidate.gender.slice(1) : 'N/A'}</Text>
            </Flex>

            <Flex w="full">
              <Text fontSize="xs" fontWeight="500" color="whiteAlpha.800" w="100px">Marital Status</Text>
              <Text fontSize="xs" fontWeight="700" flex="1">{candidate.maritalStatus ? candidate.maritalStatus.charAt(0).toUpperCase() + candidate.maritalStatus.slice(1) : 'N/A'}</Text>
            </Flex>

            <Box w="full" mt="1">
              <Text fontSize="xs" fontWeight="500" color="whiteAlpha.800" mb="1">Languages</Text>
              <Text fontSize="xs" fontWeight="700">{languages}</Text>
            </Box>
          </Flex>

          <SidebarHeading title="Certifications" />
          <VStack align="start" spacing="2" pl="1" w="full">
            <HStack align="start" spacing="3">
              <Text color="white" fontSize="xs" mt="0.5">•</Text>
              <Text fontSize="xs" fontWeight="600">Verified Profile – ZomoCook</Text>
            </HStack>
            <HStack align="start" spacing="3">
              <Text color="white" fontSize="xs" mt="0.5">•</Text>
              <Text fontSize="xs" fontWeight="600">Aadhaar & Mobile Verified</Text>
            </HStack>
          </VStack>

        </Box>
      </Flex>

      {/* Footer Section */}
      <Box w="full" bg="white" mt="auto">
        <Box p="5" px="8" pt="3">
          {/* <Box mb="3">
            <Text fontSize="sm" fontWeight="bold">🛡️</Text>
          </Box> */}
          <Flex justify="space-between" align="center" mb="3" wrap="wrap" gap="2">
            <Flex align="center" gap="2" minW="fit-content">
              <Text fontSize="sm" color="#38a169" fontWeight="bold">✓</Text>
              <Text fontSize="xs" fontWeight="700" color="#334155" whiteSpace="nowrap">Aadhaar Verified</Text>
            </Flex>
            <Flex align="center" gap="2" minW="fit-content">
              <Text fontSize="sm" color="#38a169" fontWeight="bold">✓</Text>
              <Text fontSize="xs" fontWeight="700" color="#334155" whiteSpace="nowrap">Mobile Verified</Text>
            </Flex>
            <Flex align="center" gap="2" minW="fit-content">
              <Text fontSize="sm" color="#38a169" fontWeight="bold">✓</Text>
              <Text fontSize="xs" fontWeight="700" color="#334155" whiteSpace="nowrap">Address Verified</Text>
            </Flex>
            <Flex align="center" gap="2" minW="fit-content">
              <Text fontSize="sm" color="#38a169" fontWeight="bold">✓</Text>
              <Text fontSize="xs" fontWeight="700" color="#334155" whiteSpace="nowrap">Experience Verified</Text>
            </Flex>
          </Flex>

          <Flex justify="center" mt="4">
            <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap: '8px' }}>
              {/* <div style={{ width: '14px', height: '14px', backgroundColor: '#16a34a', borderRadius: '50%', marginBottom: '3px', flexShrink: 0 }} /> */}
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#166534', whiteSpace: 'nowrap' }}>Profile Reviewed by ZomoCook</div>
            </div>
          </Flex>
        </Box>
        
        <div style={{ background: 'linear-gradient(135deg, #004aad 0%, #0062e6 100%)', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', top: '2px' }}>
              <img src="/logo.png" alt="ZomoCook" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '11px', lineHeight: '1.5' }}>This profile has been verified by ZomoCook Recruitment Team.</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '500', fontSize: '10px', lineHeight: '1.5' }}>We ensure trusted, skilled & professional staff for your business.</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <Text fontSize="sm" color="white" fontWeight="bold">🌐</Text>
            <div style={{ color: 'white', fontSize: '11px', fontWeight: '600' }}>www.zomocook.com</div>
          </div>
        </div>
      </Box>
    </Flex>
  );
});

export default CandidateCVPreview;
