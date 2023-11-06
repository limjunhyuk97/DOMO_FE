/* eslint-disable react/jsx-no-useless-fragment */
import useUser from '@/hooks/user/useUser';
import { PropsWithChildren } from 'react';

export default function User({ children }: PropsWithChildren) {
  useUser();
  return <>{children}</>;
}
