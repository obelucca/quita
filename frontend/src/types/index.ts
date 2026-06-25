export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface AdminDashboardMetricsResponse {
  totalRevenue: number;
  approvedCount: number;
  pendingCount: number;
  failedCount: number;
}

export interface AdminPaymentEventResponse {
  id: string;
  eventType: string;
  oldStatus: string;
  newStatus: string;
  processingSource: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface AdminPaymentDetailResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  packageName: string;
  creditsQuantity: number;
  amount: number;
  status: string;
  mercadopagoPaymentId: string | null;
  mercadopagoPreferenceId: string | null;
  createdAt: string;
  approvedAt: string | null;
  events?: AdminPaymentEventResponse[];
}

export interface LoginResponse {
  token: string;
  type?: string;
  email?: string;
  name?: string;
}

export interface DocumentResponse {
  id: string;
  originalFilename: string;
  uploadDate: string;
  status: string;
}

export interface InstitutionInsight {
  institution: string;
  amount: number;
  operations: number;
}

export interface DebtInsightResponse {
  totalDebts: number;
  totalAmount: number;
  institutionsCount: number;
  largestInstitution: string | null;
  largestInstitutionAmount: number;
  institutions: InstitutionInsight[];
  recommendations: string[];
}

export interface ConsumerGovInstruction {
  step: number;
  description: string;
}

export interface ComplaintResponse {
  id: string;
  institution: string;
  title: string;
  complaint: string;
  attachments: string[];
  editable: boolean;
  disclaimer: string;
  consumerGovInstructions: ConsumerGovInstruction[];
  message?: string | null;
}

export interface ComplaintHistoryResponse {
  id: string;
  institution: string;
  title: string;
  complaintText: string;
  currentDebtValue: number;
  generatedBy: string;
  version: number;
  createdAt: string;
}

export interface DebtAdjustment {
  id: string;
  institution: string;
  operationType?: string;
  reportedValue: number;
  originalValue?: number;
  isEdited?: boolean;
  isManual?: boolean;
}

export interface WizardState {
  step: number;
  originalDebts: DebtAdjustment[];
  adjustedDebts: DebtAdjustment[];
  selectedInstitution: string | null;
  currentDebtValue: string;
  generatedComplaint: ComplaintResponse | null;
}

export interface LatestComplaintResponse {
  id: string;
  createdAt: string;
  status: string;
  bankName: string;
  content: string;
}

export interface RecentComplaintCheckResponse {
  exists: boolean;
  complaintId: string | null;
  createdAt: string | null;
}
