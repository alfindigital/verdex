export interface ScanSelection {
  platform: string;
  address: string;
}

export function makeScanRequestBody(query: string, platform?: string, selection?: ScanSelection) {
  return {
    query,
    platform: platform || undefined,
    selection: selection ? { platform: selection.platform, address: selection.address } : undefined,
  };
}
