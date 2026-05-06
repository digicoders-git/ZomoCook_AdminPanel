import { useState } from 'react';
import {
  Box, VStack, HStack, Text, Heading, Button, 
  useToast, Flex, Icon, Input, InputGroup, InputRightElement, IconButton,
} from '@chakra-ui/react';
import { Eye, EyeOff, ArrowRight, UtensilsCrossed, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BRAND = '#004aad';
const ACCENT = '#f59e0b'; // Soothing Amber color instead of aggressive red

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/admin/login`, {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data));

        toast({
          title: 'Login Successful',
          description: `Welcome back, ${response.data.name}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH="100dvh"
      w="100vw"
      display="flex"
      flexDirection={{ base: 'column', lg: 'row' }}
      bg="#f4f7fb"
      position="relative"
      overflowX="hidden"
    >
      {/* ── Mobile Top: Blue Header ── */}
      <Box
        display={{ base: 'flex', lg: 'none' }}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        bg={`linear-gradient(145deg, ${BRAND} 0%, #0062e6 100%)`}
        borderBottomRadius="24px"
        position="relative"
        py="6"
        px="4"
        w="100%"
        flexShrink={0}
      >
        {/* Decorative circles */}
        <Box position="absolute" top="-20px" right="-20px" w="100px" h="100px" borderRadius="full" bg="rgba(255,255,255,0.07)" />
        <Box position="absolute" bottom="-15px" left="-15px" w="70px" h="70px" borderRadius="full" bg="rgba(255,255,255,0.05)" />

        <Flex justify="center" mb="3" position="relative" zIndex="1">
          <Box
            w="52px"
            h="52px"
            p="2"
            borderRadius="14px"
            bg="white"
            overflow="hidden"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 6px 20px rgba(0,0,0,0.18)"
          >
            <img src="/logo.jpg" alt="ZomoCook" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
        </Flex>
        <Text fontSize="lg" fontWeight="900" color="white" lineHeight="1.1" letterSpacing="-0.3px" position="relative" zIndex="1">
          ZomoCook
        </Text>
        <Text fontSize="9px" color="rgba(255,255,255,0.85)" fontWeight="600" mt="0.5" letterSpacing="1px" textTransform="uppercase" position="relative" zIndex="1">
          Admin Portal
        </Text>
      </Box>

      {/* ── Desktop Left Panel ── */}
      <Box
        display={{ base: 'none', lg: 'flex' }}
        w="45%"
        flexDirection="column"
        bg={`linear-gradient(145deg, ${BRAND} 0%, #0062e6 60%, #0040a0 100%)`}
        position="relative"
        overflow="hidden"
        p="12"
        justifyContent="space-between"
        minH="100vh"
      >
        <Box position="absolute" top="-80px" right="-80px" w="320px" h="320px" borderRadius="full" bg="rgba(255,255,255,0.05)" />
        <Box position="absolute" bottom="-60px" left="-60px" w="260px" h="260px" borderRadius="full" bg="rgba(255,255,255,0.04)" />
        <Box position="absolute" top="40%" left="60%" w="180px" h="180px" borderRadius="full" bg="rgba(237,28,36,0.12)" />

        {/* Logo */}
        <Flex align="center" gap="3" position="relative" zIndex="1">
          <Box w="48px" h="48px" borderRadius="12px" bg="white" overflow="hidden" display="flex" alignItems="center" justifyContent="center" boxShadow="0 4px 16px rgba(0,0,0,0.15)">
            <img src="/logo.jpg" alt="ZomoCook" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
          <Box>
            <Text fontSize="xl" fontWeight="800" color="white" lineHeight="1.1">ZomoCook</Text>
            <Text fontSize="11px" color="rgba(255,255,255,0.65)" fontWeight="500" letterSpacing="0.5px">Admin Panel</Text>
          </Box>
        </Flex>

        {/* Center Content */}
        <VStack align="flex-start" spacing="8" position="relative" zIndex="1">
          <Box>
            <Box
              display="inline-flex"
              alignItems="center"
              gap="2"
              bg="rgba(237,28,36,0.2)"
              border="1px solid rgba(237,28,36,0.35)"
              px="3"
              py="1.5"
              borderRadius="full"
              mb="5"
            >
              <Box w="6px" h="6px" borderRadius="full" bg={ACCENT} />
              <Text fontSize="11px" fontWeight="700" color="rgba(255,255,255,0.9)" letterSpacing="0.5px" textTransform="uppercase">
                Secure Admin Access
              </Text>
            </Box>
            <Heading color="white" fontSize="3xl" fontWeight="800" lineHeight="1.2" mb="3">
              Manage Your<br />
              <Box as="span" color={ACCENT}>Culinary</Box> Platform
            </Heading>
            <Text color="rgba(255,255,255,0.65)" fontSize="sm" lineHeight="1.7" maxW="320px">
              Access the complete ZomoCook admin dashboard to manage jobs, candidates, customers, and more.
            </Text>
          </Box>

          <VStack align="flex-start" spacing="3">
            {[
              { icon: UtensilsCrossed, text: 'Manage cooking jobs & candidates' },
              { icon: ShieldCheck, text: 'Role-based access control' },
              { icon: Zap, text: 'Real-time dashboard analytics' },
            ].map(({ icon, text }) => (
              <HStack key={text} spacing="3">
                <Flex w="32px" h="32px" borderRadius="8px" bg="rgba(255,255,255,0.12)" align="center" justify="center" flexShrink={0}>
                  <Icon as={icon} boxSize={4} color="white" />
                </Flex>
                <Text fontSize="sm" color="rgba(255,255,255,0.8)" fontWeight="500">{text}</Text>
              </HStack>
            ))}
          </VStack>
        </VStack>

        <Text fontSize="xs" color="rgba(255,255,255,0.4)" position="relative" zIndex="1">
          © 2026 ZomoCook. All rights reserved. Crafted with ❤️ by <a href="https://digicoders.in/" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, textDecoration: 'underline', fontWeight: 'bold', fontSize: '14px' }}>Team Digicoders</a>
        </Text>
      </Box>

      {/* ── Right Panel: Login Form ── */}
      <Flex
        flex="1"
        w="full"
        alignItems="center"
        justifyContent="center"
        px="4"
        py="6"
        bg={{ base: '#f4f7fb', lg: 'transparent' }}
        position="relative"
        zIndex="1"
        minH={{ base: 'auto', lg: '100vh' }}
      >
        <Box w="full" maxW="420px">

          {/* Card */}
          <Box
            bg="white"
            borderRadius="2xl"
            overflow="hidden"
            boxShadow={{ base: '0 4px 16px rgba(0,74,173,0.08)', lg: '0 8px 40px rgba(0,74,173,0.1)' }}
            border="1px solid #e8edf5"
            position="relative"
            w="full"
          >
            {/* Top gradient bar */}
            <Box h="5px" bgGradient={`linear(to-r, ${BRAND}, ${ACCENT})`} />

            <Box px="5" pt="7" pb="7">

              {/* Heading */}
              <Box mb="6">
                <Heading fontSize="xl" fontWeight="900" color="#1e293b" mb="1.5" letterSpacing="-0.3px">Welcome Back</Heading>
                <Text fontSize="sm" color="#64748b" fontWeight="500" lineHeight="1.4">Sign in to continue to admin</Text>
              </Box>

              <form onSubmit={handleLogin}>

                {/* Email */}
                <Box mb="5">
                  <Text fontSize="xs" fontWeight="700" color="#475569" textTransform="uppercase" letterSpacing="0.8px" mb="2">
                    Email Address
                  </Text>
                  <Input
                    type="email"
                    placeholder="admin@zomocook.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    h="44px"
                    fontSize="14px"
                    color="#1e293b"
                    bg="#f8faff"
                    border="1.5px solid"
                    borderColor="#dde6f5"
                    borderRadius="10px"
                    _focus={{ bg: 'white', borderColor: BRAND, boxShadow: `0 0 0 3px ${BRAND}20` }}
                    _hover={{ borderColor: '#aec6ef' }}
                    transition="all 0.18s"
                  />
                </Box>

                {/* Password */}
                <Box mb="6">
                  <Text fontSize="xs" fontWeight="700" color="#475569" textTransform="uppercase" letterSpacing="0.8px" mb="2">
                    Password
                  </Text>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      h="44px"
                      fontSize="14px"
                      color="#1e293b"
                      bg="#f8faff"
                      border="1.5px solid"
                      borderColor="#dde6f5"
                      borderRadius="10px"
                      pr="44px"
                      _focus={{ bg: 'white', borderColor: BRAND, boxShadow: `0 0 0 3px ${BRAND}20` }}
                      _hover={{ borderColor: '#aec6ef' }}
                      transition="all 0.18s"
                    />
                    <InputRightElement h="44px" w="44px">
                      <IconButton
                        aria-label="Toggle password"
                        icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        variant="ghost"
                        size="sm"
                        color="#94a3b8"
                        _hover={{ color: BRAND, bg: 'transparent' }}
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  w="full"
                  h="44px"
                  fontSize="sm"
                  fontWeight="700"
                  bg={BRAND}
                  color="white"
                  borderRadius="10px"
                  rightIcon={<ArrowRight size={16} />}
                  isLoading={isLoading}
                  loadingText="Signing In..."
                  _hover={{ bg: '#003d91', transform: 'translateY(-1px)', boxShadow: `0 8px 24px ${BRAND}40` }}
                  _active={{ transform: 'translateY(0)', bg: '#003080' }}
                  transition="all 0.18s"
                  boxShadow={`0 4px 16px ${BRAND}30`}
                >
                  Sign In
                </Button>

              </form>

            </Box>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Login;
