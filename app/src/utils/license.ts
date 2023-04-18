import { type Org, Plan } from "@prisma/client";

export const isAbovePro = (org?: Org | null) => {
  return (org?.plan === Plan.PROFESSIONAL || org?.plan === Plan.ENTERPRISE) && org.isActive;
}

export const isPaid = (org?: Org | null) => {
  return org?.plan !== Plan.FREE && org?.isActive;
}

export const getLimits = (plan: Plan) => {
  if (plan === Plan.FREE) return { projects: 1, messages: 30, documentSize: 500_000 };
  if (plan === Plan.BASIC) return { projects: 2, messages: 1000, documentSize: 2_000_000 };
  if (plan === Plan.PROFESSIONAL) return { projects: 5, messages: 5000, documentSize: 4_000_000 };
  if (plan === Plan.ENTERPRISE) return { projects: -1, messages: 12000, documentSize: 8_000_000 };
}