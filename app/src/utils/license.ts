import { type Org, Plan } from "@prisma/client";

export const isAbovePro = (org?: Org | null) => {
  return (org?.plan === Plan.PROFESSIONAL || org?.plan === Plan.ENTERPRISE) && org.isActive;
}

export const isPaid = (org?: Org | null) => {
  return org?.plan !== Plan.FREE && org?.isActive;
}

export const getLimits = (plan: Plan) => {
  if (plan === Plan.BASIC) return { projects: 2, messages: 1000, documentSize: 5e6 };
  if (plan === Plan.PROFESSIONAL) return { projects: 5, messages: 5000, documentSize: 25e6 };
  if (plan === Plan.ENTERPRISE) return { projects: Infinity, messages: 12000, documentSize: 100e6 };

  return { projects: 1, messages: 30, documentSize: 2e6 };
}