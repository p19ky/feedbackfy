import React from "react";
import { Icon } from "@chakra-ui/icon";
import { Button } from "@chakra-ui/button";
import { useBreakpointValue } from "@chakra-ui/media-query";
import { Link as ReactRouterLink } from "react-router-dom";

const NavItem = ({ icon, title, to }) => {
  const shouldDisplayTitle = useBreakpointValue({ base: false, md: true });

  return (
    <Button
      as={ReactRouterLink}
      to={to}
      leftIcon={<Icon as={icon} />}
      variant="ghost"
      w="100%"
      justifyContent="flex-start"
      iconSpacing={shouldDisplayTitle ? 2 : 0}
    >
      {shouldDisplayTitle && title}
    </Button>
  );
};

export default NavItem;
