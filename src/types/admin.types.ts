
export type PendingRecharge = {
  rechargeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  bonusPoints: number;
  utrId: string;
  date: string;
};

export type RechargeHistory = {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  pointsAdded: number;
  bonusPoints: number;
  status: 'approved' | 'rejected';
  utrId: string;
  createdAt: string;
};
