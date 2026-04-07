import { useMemo } from "react";
import { useLocation, useParams } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { MenuProvider } from "@/providers/menus/type";
import { useResourceContext } from "@/components/layouts/resource-provider";

export type MenuItem = {
  name: string;
  key: string;
  label: string;
  meta?: MenuProvider["meta"] & {
    group?: string;
    icon?: ReactNode;
  };
  icon?: ReactNode;
  path: string | false;
  children: MenuItem[];
};

export type UseMenuOptions = {
  resources: MenuProvider[];
};

export type UseMenuReturn = {
  menuItems: MenuItem[];
  selectedKey: string;
  defaultOpenKeys: string[];
  pathParams: Record<string, string>;
};

function pathMatchesLocation(pattern: string, pathname: string): boolean {
  const regexStr = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&") // escape special regex chars (not * or /)
    .replace(/\\\$/g, "$") // unescape $ so we can detect $param
    .replace(/\$[^/]+/g, "[^/]+"); // replace $param segments with wildcard
  const regex = new RegExp(`^${regexStr}(/.*)?$`);
  return regex.test(pathname);
}

export function useMenu(): UseMenuReturn {
  const location = useLocation();
  const params = useParams({ strict: false });
  const { menuProvider } = useResourceContext();

  const menuItems = useMemo(() => {
    const buildItem = (resource: MenuProvider): MenuItem => {
      const identifier = resource.identifier ?? resource.name;
      const children = menuProvider
        .filter(
          (r) =>
            !r.meta?.hide &&
            (r.meta?.parent === resource.name || r.meta?.parent === identifier),
        )
        .map(buildItem);

      return {
        name: identifier,
        key: identifier,
        label: resource.meta?.label ?? resource.name,
        meta: resource.meta as MenuItem["meta"],
        icon: resource.meta?.icon as ReactNode,
        path: resource.path ?? false,
        children,
      };
    };

    return menuProvider
      .filter((r) => !r.meta?.parent && !r.meta?.hide)
      .map(buildItem);
  }, [menuProvider]);

  const selectedKey = useMemo(() => {
    const findSelected = (items: MenuItem[]): string => {
      for (const item of items) {
        if (item.children.length > 0) {
          const found = findSelected(item.children);
          if (found) return found;
        }
      }
      for (const item of items) {
        if (
          item.path &&
          pathMatchesLocation(item.path as string, location.pathname)
        ) {
          return item.key;
        }
      }
      return "";
    };

    return findSelected(menuItems);
  }, [menuItems, location.pathname]);

  const defaultOpenKeys = useMemo(() => {
    const findParents = (items: MenuItem[], targetKey: string): string[] => {
      for (const item of items) {
        if (item.children.length > 0) {
          const directMatch = item.children.some((c) => c.key === targetKey);
          if (directMatch) return [item.name];
          const nestedMatch = findParents(item.children, targetKey);
          if (nestedMatch.length > 0) return [item.name, ...nestedMatch];
        }
      }
      return [];
    };

    if (!selectedKey) return [];
    return findParents(menuItems, selectedKey);
  }, [menuItems, selectedKey]);

  return { menuItems, selectedKey, defaultOpenKeys, pathParams: params };
}
