export type createTraining = {
  title: string;
  description?: string;
  content?: string;
  trackId: string;
  userId: string;
};

export type Training = {
  id: string;
  title: string;
  description?: string;
  content?: string;
  createAt: Date;
  updateAt?: Date;
};
