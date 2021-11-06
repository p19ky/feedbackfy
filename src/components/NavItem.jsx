import React from "react";
import { Icon } from "@chakra-ui/icon";
import { Button } from "@chakra-ui/button";
import { useBreakpointValue } from "@chakra-ui/media-query";
import {
  NavLink as ReactRouterLink,
  useResolvedPath,
  useMatch,
} from "react-router-dom";

const NavItem = ({
  icon,
  title,
  to = "",
  isLink = true,
  onClick = () => {},
}) => {
  const shouldDisplayTitle = useBreakpointValue({ base: false, md: true });
  let resolved = useResolvedPath(to);
  let match = useMatch({ path: resolved.pathname, end: true });

  return (
    <Button
      as={isLink ? ReactRouterLink : null}
      to={isLink ? to : null}
      leftIcon={<Icon as={icon} />}
      variant={isLink ? (match ? "solid" : "ghost") : "ghost"}
      w="100%"
      justifyContent="flex-start"
      iconSpacing={shouldDisplayTitle ? 2 : 0}
      onClick={onClick}
    >
      {shouldDisplayTitle && title}
    </Button>
  );
};

export default NavItem;
