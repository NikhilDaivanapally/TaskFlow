export interface User {
  _id: string;
  name: string;
  email: string;
  profile: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date;
  user?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSave: (task: Task) => void;
}
