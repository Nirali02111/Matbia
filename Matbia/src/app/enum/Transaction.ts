export enum TransactionStatus {
  SUCCESS = 'Success',
  PENDING = 'Pending',
  FAILED = 'Failed',
  SCHEDULED = 'Scheduled',
  SCHEDULE_IN_PROGRESS = 'In Progress',
  QUEUED = 'Queued',
  CANCELLED = 'Cancelled',
  FUNDING = 'Funding',
  VOIDED = 'Voided',
  COMPLETED = 'Completed',
  STOPPED = 'Stopped',
  DECLINED = 'Declined',
  GENERATED = 'Generated',
  EXPIRED = 'Expired',
  SUBMITTED = 'Submitted',
}

export enum TransactionTypes {
  DEPOSIT = 'Deposit',
  DONATION = 'Donation',
  DONATION_TRANSFER = 'Donation Transfer',
  REFUND = 'Refund',
  MATBIA_FEE = 'Matbia Fee',
  REDEEMED = 'Redeemed',
  REDEEMED_And_MATBIA_FEE = 'Redeems/Fees',
  FAILED_DEPOSIT = 'Failed Deposit Fee',
}
