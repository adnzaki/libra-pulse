import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (maps Firebase Auth UID and library members)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('member'),
  cardNumber: text('card_number'),
  phone: text('phone'),
  avatar: text('avatar'),
  isSuspended: boolean('is_suspended').default(false),
  suspendReason: text('suspend_reason'),
  suspendedUntil: text('suspended_until'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  color: text('color').default('#3b82f6'),
  icon: text('icon').default('Bookmark'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Shelves table
export const shelves = pgTable('shelves', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  floor: integer('floor').default(1),
  zone: text('zone'),
  capacity: integer('capacity').default(50),
  currentCount: integer('current_count').default(0),
  category: text('category'),
  color: text('color').default('#3b82f6'),
  description: text('description'),
  shelfRow: text('shelf_row'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Books table
export const books = pgTable('books', {
  id: text('id').primaryKey(),
  isbn: text('isbn'),
  title: text('title').notNull(),
  author: text('author').notNull(),
  publisher: text('publisher'),
  year: integer('year'),
  category: text('category').notNull(),
  shelfId: text('shelf_id'),
  shelfCode: text('shelf_code'),
  shelfName: text('shelf_name'),
  cover: text('cover'),
  synopsis: text('synopsis'),
  totalCopies: integer('total_copies').default(1),
  availableCopies: integer('available_copies').default(1),
  borrowedCopies: integer('borrowed_copies').default(0),
  reservedCopies: integer('reserved_copies').default(0),
  barcode: text('barcode'),
  rating: integer('rating').default(5),
  pages: integer('pages').default(200),
  language: text('language').default('Bahasa Indonesia'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Loans table
export const loans = pgTable('loans', {
  id: text('id').primaryKey(),
  bookId: text('book_id').notNull(),
  bookTitle: text('book_title').notNull(),
  bookCover: text('book_cover'),
  shelfCode: text('shelf_code'),
  memberId: text('member_id').notNull(),
  memberName: text('member_name').notNull(),
  memberCardNumber: text('member_card_number'),
  memberPhone: text('member_phone'),
  memberEmail: text('member_email'),
  borrowDate: text('borrow_date').notNull(),
  dueDate: text('due_date').notNull(),
  returnDate: text('return_date'),
  status: text('status').default('active'),
  daysOverdue: integer('days_overdue').default(0),
  handledBy: text('handled_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Bookings table (24-hour holds)
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),
  bookId: text('book_id').notNull(),
  bookTitle: text('book_title').notNull(),
  bookCover: text('book_cover'),
  shelfCode: text('shelf_code'),
  memberId: text('member_id').notNull(),
  memberName: text('member_name').notNull(),
  memberCardNumber: text('member_card_number'),
  memberPhone: text('member_phone'),
  memberEmail: text('member_email'),
  createdAt: text('created_at').notNull(),
  expiresAt: text('expires_at').notNull(),
  status: text('status').default('active_hold'),
  notes: text('notes'),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  memberId: text('member_id').notNull(),
  memberName: text('member_name'),
  recipient: text('recipient'),
  type: text('type').default('email'),
  subject: text('subject'),
  message: text('message'),
  sentAt: text('sent_at'),
  status: text('status').default('sent'),
  triggerReason: text('trigger_reason'),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  loans: many(loans),
}));
