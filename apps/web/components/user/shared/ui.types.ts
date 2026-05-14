import type { EnterpriseAndUser } from 'lib/interfaces/entities/enterprise-and-user.entity';

export type HeaderProps = EnterpriseAndUser & {
  nextLink?: string;
  nextLabelLink?: string;
  prevLink?: string;
  prevLabelLink?: string;
  description?: string;
};
