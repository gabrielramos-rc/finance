-- ============================================================================
-- Enable Row Level Security (RLS) on all tables
-- ============================================================================
-- This SQL script enables RLS and creates policies for all tables
-- Users can only access their own data (where userId = auth.uid())
-- System categories (userId IS NULL) are visible to all authenticated users
-- ============================================================================

-- ============================================================================
-- USERS TABLE
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own record
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = id);

-- Users can update their own record
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text = id);

-- Users can insert their own record (for initial setup)
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid()::text = id);

-- ============================================================================
-- ACCOUNTS TABLE
-- ============================================================================

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts"
ON accounts FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own accounts"
ON accounts FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own accounts"
ON accounts FOR UPDATE
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own accounts"
ON accounts FOR DELETE
USING (auth.uid()::text = "userId");

-- ============================================================================
-- CREDIT CARDS TABLE
-- ============================================================================

ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit cards"
ON credit_cards FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own credit cards"
ON credit_cards FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own credit cards"
ON credit_cards FOR UPDATE
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own credit cards"
ON credit_cards FOR DELETE
USING (auth.uid()::text = "userId");

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Users can view system categories (userId IS NULL) OR their own categories
CREATE POLICY "Users can view system and own categories"
ON categories FOR SELECT
USING (
  "userId" IS NULL OR 
  auth.uid()::text = "userId"
);

-- Users can only insert their own categories (not system categories)
CREATE POLICY "Users can insert own categories"
ON categories FOR INSERT
WITH CHECK (
  "userId" IS NOT NULL AND 
  auth.uid()::text = "userId"
);

-- Users can only update their own categories
CREATE POLICY "Users can update own categories"
ON categories FOR UPDATE
USING (
  "userId" IS NOT NULL AND 
  auth.uid()::text = "userId"
);

-- Users can only delete their own categories
CREATE POLICY "Users can delete own categories"
ON categories FOR DELETE
USING (
  "userId" IS NOT NULL AND 
  auth.uid()::text = "userId"
);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own transactions"
ON transactions FOR UPDATE
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own transactions"
ON transactions FOR DELETE
USING (auth.uid()::text = "userId");

-- ============================================================================
-- BUDGETS TABLE
-- ============================================================================

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets"
ON budgets FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own budgets"
ON budgets FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own budgets"
ON budgets FOR UPDATE
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own budgets"
ON budgets FOR DELETE
USING (auth.uid()::text = "userId");

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
ON subscriptions FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own subscriptions"
ON subscriptions FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own subscriptions"
ON subscriptions FOR UPDATE
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own subscriptions"
ON subscriptions FOR DELETE
USING (auth.uid()::text = "userId");

-- ============================================================================
-- INSTALLMENTS TABLE
-- ============================================================================

ALTER TABLE installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own installments"
ON installments FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own installments"
ON installments FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own installments"
ON installments FOR UPDATE
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own installments"
ON installments FOR DELETE
USING (auth.uid()::text = "userId");

-- ============================================================================
-- IMPORTS TABLE
-- ============================================================================

ALTER TABLE imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own imports"
ON imports FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own imports"
ON imports FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own imports"
ON imports FOR UPDATE
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own imports"
ON imports FOR DELETE
USING (auth.uid()::text = "userId");

-- ============================================================================
-- ALERTS TABLE
-- ============================================================================

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
ON alerts FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own alerts"
ON alerts FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own alerts"
ON alerts FOR UPDATE
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own alerts"
ON alerts FOR DELETE
USING (auth.uid()::text = "userId");

-- ============================================================================
-- CATEGORIZE RULES TABLE
-- ============================================================================

ALTER TABLE categorize_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rules"
ON categorize_rules FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own rules"
ON categorize_rules FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own rules"
ON categorize_rules FOR UPDATE
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own rules"
ON categorize_rules FOR DELETE
USING (auth.uid()::text = "userId");

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- Important: This assumes that User.id matches Supabase auth.users.id
-- When creating a user in your application, ensure the User.id is set to
-- the Supabase auth user's UUID.
--
-- Example in your application code:
--   const { data: { user } } = await supabase.auth.getUser();
--   await prisma.user.create({
--     data: {
--       id: user.id,  // Use Supabase auth user ID
--       email: user.email!,
--       name: user.user_metadata.name || user.email!,
--     }
--   });
--
-- ============================================================================


