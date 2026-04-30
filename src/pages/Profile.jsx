import React from 'react';
import { Box, VStack, HStack, Text, Icon, FormControl, FormLabel, Input, SimpleGrid, Image, Flex, Button, Divider } from '@chakra-ui/react';
import { User, Lock, Save, RotateCcw } from 'lucide-react';
import { PageHeader, PageFooter, BRAND, ACCENT, inputStyle, labelStyle } from '../components/ui';

const SectionHeader = ({ icon, title }) => (
  <HStack spacing="3" mb="5">
    <Flex w="32px" h="32px" borderRadius="lg" bg="#e6eeff" align="center" justify="center" flexShrink={0}>
      <Icon as={icon} boxSize={4} color={BRAND} />
    </Flex>
    <Text fontSize="sm" fontWeight="700" color="#1e293b">{title}</Text>
  </HStack>
);

const Profile = () => (
  <Box pb="10">
    <PageHeader title="Update Profile" breadcrumb="Update Profile" />

    <Box bg="white" borderRadius="xl" border="1px solid #e8edf5" boxShadow="0 2px 8px rgba(0,74,173,0.04)" overflow="hidden">
      {/* Top accent bar */}
      <Box h="4px" bg={`linear-gradient(90deg, ${BRAND}, ${ACCENT})`} />

      <Box p={{ base: '5', md: '8' }}>
        <VStack align="stretch" spacing="8">
          {/* Profile Section */}
          <Box>
            <SectionHeader icon={User} title="Update Profile" />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacingX="8" spacingY="5">
              <FormControl><FormLabel {...labelStyle}>Name</FormLabel><Input defaultValue="Zomo Cook" {...inputStyle} /></FormControl>
              <FormControl><FormLabel {...labelStyle}>Email Address</FormLabel><Input defaultValue="admin@zomocook.in" {...inputStyle} /></FormControl>
              <FormControl><FormLabel {...labelStyle}>Phone No</FormLabel><Input defaultValue="8009534847" {...inputStyle} /></FormControl>
              <FormControl>
                <FormLabel {...labelStyle}>Profile Pic</FormLabel>
                <VStack align="start" spacing="3">
                  <Input type="file" p="1" {...inputStyle} />
                  <Box p="2" bg="white" borderRadius="full" w="80px" h="80px" overflow="hidden" border={`3px solid ${BRAND}30`} boxShadow="0 2px 8px rgba(0,74,173,0.1)">
                    <Image src="https://images.unsplash.com/photo-1619946769363-107e822026a7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80" alt="profile" objectFit="cover" w="full" h="full" />
                  </Box>
                </VStack>
              </FormControl>
            </SimpleGrid>
          </Box>

          <Divider borderColor="#f1f5f9" />

          {/* Password Section */}
          <Box>
            <SectionHeader icon={Lock} title="Change Password" />
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing="5">
              <FormControl><FormLabel {...labelStyle}>Current Password</FormLabel><Input type="password" defaultValue="ZomoCook@2026" {...inputStyle} /></FormControl>
              <FormControl><FormLabel {...labelStyle}>New Password</FormLabel><Input type="password" placeholder="Enter new password" {...inputStyle} /></FormControl>
              <FormControl><FormLabel {...labelStyle}>Confirm Password</FormLabel><Input type="password" placeholder="Confirm new password" {...inputStyle} /></FormControl>
            </SimpleGrid>
          </Box>

          <HStack justify="flex-end" spacing="3" pt="2">
            <Button leftIcon={<RotateCcw size={14} />} variant="outline" borderColor="#dde6f5" color="#64748b" borderRadius="lg" size="sm" _hover={{ borderColor: BRAND, color: BRAND }}>Reset</Button>
            <Button leftIcon={<Save size={14} />} bg={BRAND} color="white" borderRadius="lg" size="sm" px="6" _hover={{ bg: '#003d91' }} boxShadow={`0 4px 12px ${BRAND}30`}>Update</Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
    <PageFooter />
  </Box>
);

export default Profile;
