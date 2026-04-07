import {
  Accordion,
  Box,
  Button,
  Container,
  Heading,
  Image,
  Link as ChakraLink,
  LinkBox,
  LinkOverlay,
  Span,
  Stack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ReactNode, useEffect, useState } from "react";
import { useMenu } from "@/hooks/useMenu";
import { CanAccess } from "./can-access";

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const refineMenu = useMenu();
  const [collapsed, setCollapsed] = useState(false);
  const isSmallScreen = useBreakpointValue({
    base: true,
    sm: true,
    md: true,
    lg: false,
    xl: false,
    "2xl": false,
  });

  useEffect(() => {
    if (isSmallScreen === undefined) return;
    setCollapsed(isSmallScreen);
  }, [isSmallScreen]);

  return (
    <Stack
      position="relative"
      minH="100vh"
      pt="80px"
      pl={collapsed ? "90px" : "300px"}
      transition="all ease .5s"
    >
      <Header menuProps={refineMenu} collapsed={collapsed} />
      <Sidebar menuProps={refineMenu} collapsed={collapsed} />
      <Container p="16px">{children}</Container>
    </Stack>
  );
}

type HeaderProps = {
  menuProps: ReturnType<typeof useMenu>;
  collapsed: boolean;
};

function Header({ collapsed }: HeaderProps) {
  const handleLogout = () => {};
  return (
    <Stack
      position="fixed"
      top="0"
      left={collapsed ? "90px" : "300px"}
      direction="row"
      width={`calc(100% - ${collapsed ? "90px" : "300px"})`}
      minH="80px"
      boxShadow="md"
      bgColor="white"
      justifyContent="space-between"
      alignItems="center"
      padding="10px 80px 10px 40px"
      transition="all ease .5s"
    >
      <Box />
      <Stack direction="row" justifyContent="flex-end">
        <Button onClick={handleLogout}>Logout</Button>
      </Stack>
    </Stack>
  );
}

type SideBarProps = {
  menuProps: ReturnType<typeof useMenu>;
  collapsed: boolean;
};

function Sidebar({ menuProps, collapsed }: SideBarProps) {
  const { menuItems } = menuProps;

  return (
    <Stack
      position="fixed"
      top="0"
      left="0"
      width={collapsed ? "90px" : "300px"}
      height="100vh"
      bgColor="white"
      boxShadow="md"
      gap="16px"
      transition="all ease .5s"
      _dark={{ bgColor: "blackAlpha.800" }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={collapsed ? "center" : "start"}
        p="20px"
        transition="all ease .5s"
      >
        <ChakraLink display="flex" variant="plain" href="/" target="_blank">
          <Image
            src="/logo-app.png"
            alt="Tanstack Start"
            boxSize="40px"
            bg="blue.900"
            borderRadius="full"
          />
          {!collapsed && (
            <Heading
              as="h1"
              fontSize="18px"
              textWrap="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              Tanstack Start
            </Heading>
          )}
        </ChakraLink>
      </Stack>
      <Stack>
        {menuItems.map((item) => (
          <MenuItem
            key={item.name}
            item={item}
            collapsed={collapsed}
            menuProps={menuProps}
          />
        ))}
      </Stack>
    </Stack>
  );
}

type MenuItemProps = {
  item: ReturnType<typeof useMenu>["menuItems"][number];
  menuProps: ReturnType<typeof useMenu>;
  collapsed: boolean;
  parents?: string[];
};

function MenuItem({ item, menuProps, collapsed, parents = [] }: MenuItemProps) {
  const { selectedKey, defaultOpenKeys } = menuProps;
  const fontSize = "1rem";
  const isSelected = selectedKey === item.key;
  const hasChildren = item.children.length > 0;

  if (hasChildren) {
    return (
      <CanAccess
        key={item.name}
        resource={item.name}
        action="list"
        params={{
          resource: item,
        }}
      >
        <Accordion.Root
          key={item.name}
          variant="plain"
          defaultValue={defaultOpenKeys}
          collapsible
        >
          <Accordion.Item value={item.name}>
            <Accordion.ItemTrigger
              fontSize={fontSize}
              p="10px 20px"
              cursor="pointer"
              _hover={{ bgColor: "blue.50" }}
            >
              <Span
                display="flex"
                flexDir="row"
                flex="1"
                gap="8px"
                justifyContent={collapsed ? "center" : "start"}
                alignItems="center"
              >
                {item.icon}
                {!collapsed && item.label}
              </Span>
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody py="0" pl="16px" pt="8px" spaceY="8px">
                {item.children.map((childItem) => (
                  <MenuItem
                    key={childItem.name}
                    item={childItem}
                    menuProps={menuProps}
                    parents={[...parents, item.name]}
                    collapsed={collapsed}
                  />
                ))}
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      </CanAccess>
    );
  }

  return (
    <CanAccess
      key={item.name}
      resource={item.name}
      action="list"
      params={{
        resource: item,
      }}
    >
      <LinkBox
        key={item.name}
        display="flex"
        flexDir="row"
        alignItems="center"
        gap="8px"
        p="10px 20px"
        fontSize={fontSize}
        justifyContent={collapsed ? "center" : "start"}
        bgColor={isSelected ? "blue.50" : "transparent"}
        _hover={{ bgColor: "blue.50" }}
        transition="all ease .5s"
      >
        {item.meta?.icon}
        {!collapsed && (
          <LinkOverlay asChild>
            <ChakraLink href={item.path as string}>
              {item.meta?.label}
            </ChakraLink>
          </LinkOverlay>
        )}
      </LinkBox>
    </CanAccess>
  );
}
