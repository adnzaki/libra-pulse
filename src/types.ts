export interface BookCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  category: string;
  shelfId: string;
  shelfCode?: string;
  shelfName?: string;
  cover: string;
  synopsis: string;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  reservedCopies: number;
  barcode: string;
  rating: number;
  pages: number;
  language: string;
}

export interface Shelf {
  id: string;
  code: string;
  name: string;
  floor: number;
  zone: string;
  capacity: number;
  currentCount: number;
  category: string;
  color: string;
  description: string;
  shelfRow?: string;
}

export interface Member {
  id: string;
  cardNumber: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'member';
  avatar: string;
  joinDate: string;
  isSuspended: boolean;
  suspendReason?: string;
  suspendedUntil?: string | null;
  totalBorrowed: number;
  activeLoansCount: number;
  address?: string;
  password?: string;
}

export interface Booking {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  shelfCode: string;
  memberId: string;
  memberName: string;
  memberCardNumber: string;
  memberPhone: string;
  memberEmail: string;
  createdAt: string;
  expiresAt: string;
  status: 'active_hold' | 'collected' | 'cancelled_timeout' | 'cancelled_user';
  notes?: string;
}

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  shelfCode: string;
  memberId: string;
  memberName: string;
  memberCardNumber: string;
  memberPhone: string;
  memberEmail: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'active' | 'returned' | 'overdue';
  daysOverdue: number;
  handledBy: string;
}

export interface SuspendConfig {
  defaultSuspendDays: number; // 1-30 hari
  autoSuspendOnOverdue: boolean;
  maxActiveLoans: number;
  maxHoldHours: number;
}

export interface NotificationLog {
  id: string;
  memberId: string;
  memberName: string;
  recipient: string;
  type: 'email' | 'sms' | 'whatsapp';
  subject: string;
  message: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'read';
  triggerReason: 'overdue_reminder' | 'due_today' | 'booking_expiry_warning' | 'suspend_notice' | 'booking_success';
}

export interface LibraryStats {
  totalBooks: number;
  totalTitles: number;
  availableBooks: number;
  borrowedBooks: number;
  reservedBooks: number;
  totalMembers: number;
  activeMembers: number;
  suspendedMembers: number;
  activeLoans: number;
  overdueLoans: number;
  activeBookings: number;
  totalReturnedThisMonth: number;
  shelvesUtilizedPercent: number;
}
