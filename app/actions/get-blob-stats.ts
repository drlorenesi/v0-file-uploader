"use server"

import { blobService } from "../../lib/blob-service"

export type { BlobStats } from "../../lib/blob-service"

export async function getBlobStats(forceRefresh = false) {
  return await blobService.getStatistics(forceRefresh)
}
