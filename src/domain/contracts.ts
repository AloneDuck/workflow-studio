import accessibilityRequirements from "@/data/accessibility-requirements.json";
import autosaveProfiles from "@/data/autosave-profiles.json";
import collaborationPolicies from "@/data/collaboration-policies.json";
import fieldContracts from "@/data/field-contracts.json";
import migrationFixtures from "@/data/migration-fixtures.json";
import validationScenarios from "@/data/validation-scenarios.json";

export interface ContractRecord {
  id: string;
  [key: string]: unknown;
}

export const contractRegistry: Record<string, ContractRecord[]> = {
  accessibility: accessibilityRequirements,
  autosave: autosaveProfiles,
  collaboration: collaborationPolicies,
  fields: fieldContracts,
  migrations: migrationFixtures,
  validation: validationScenarios,
};

export function auditContractRegistry(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const [group, contracts] of Object.entries(contractRegistry)) {
    for (const [index, contract] of contracts.entries()) {
      if (!contract.id?.trim()) errors.push(`${group}.${index} has no id`);
      else if (ids.has(contract.id)) errors.push(`${group}.${index} duplicates ${contract.id}`);
      else ids.add(contract.id);
      if (Object.keys(contract).length < 3) errors.push(`${group}.${index} is underspecified`);
    }
  }
  return errors;
}

export function contractCount(): number {
  return Object.values(contractRegistry).reduce((total, contracts) => total + contracts.length, 0);
}
