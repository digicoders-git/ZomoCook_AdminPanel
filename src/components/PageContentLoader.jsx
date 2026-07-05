import { Flex, Spinner } from '@chakra-ui/react';

const BRAND = '#004aad';

const PageContentLoader = () => (
  <Flex h="80vh" align="center" justify="center">
    <Spinner size="xl" color={BRAND} thickness="4px" />
  </Flex>
);

export default PageContentLoader;
