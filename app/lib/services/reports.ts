/**
 * Report Service - API calls for reports and analytics
 */

import { api } from '@/app/lib/api-client';
import type { 
  AdminReportResponse,
  AdminReportType 
} from '@/types/api';

export const reportService = {
  /**
   * Get admin report (admin only)
   */
  getAdminReport: (
    reportType: AdminReportType, 
    params?: { startDate?: string; endDate?: string }
  ) => api.get<AdminReportResponse>('/reports/admin', { reportType, ...params }),

  /**
   * Get vendor report (vendor only)
   */
  getVendorReport: (
    reportType: string, 
    params?: { startDate?: string; endDate?: string }
  ) => api.get('/reports/vendor', { reportType, ...params }),
};
