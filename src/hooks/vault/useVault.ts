import { useQuery } from "@tanstack/react-query";
import { vaultService, type VaultParams } from "../../services/vaultService";

export const useVault = (params: VaultParams) => {
  return useQuery({
    queryKey: ["vault", params],
    queryFn: () => vaultService.getVaultItems(params),
    placeholderData: (previousData) => previousData, // smooth transition during filtering
  });
};
