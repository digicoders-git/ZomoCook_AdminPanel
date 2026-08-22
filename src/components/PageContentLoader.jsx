import { Flex, Spinner } from '@chakra-ui/react';

const BRAND = '#2D2B75';

const PageContentLoader = () => (
  <Flex h="80vh" align="center" justify="center">
    <Spinner size="xl" color={BRAND} thickness="4px" />
  </Flex>
);

export default PageContentLoader;
