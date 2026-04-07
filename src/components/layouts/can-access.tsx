import { ReactNode } from "react";

type CanAccessProps = {
  children: ReactNode;
  resource: string;
  action: string;
  params?: {
    [key: string]: any;
  };
};

export function CanAccess({ children }: CanAccessProps) {
  return <>{children}</>;
}
