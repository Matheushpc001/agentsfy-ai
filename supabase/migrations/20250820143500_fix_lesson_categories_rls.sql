-- Fix RLS policies for lesson_categories table

-- Drop existing policy
DROP POLICY IF EXISTS "Admins can manage lesson categories" ON lesson_categories;

-- Create separate policies for different operations
CREATE POLICY "Anyone can view lesson categories" ON lesson_categories
FOR SELECT USING (true);

CREATE POLICY "Admins can insert lesson categories" ON lesson_categories
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update lesson categories" ON lesson_categories
FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete lesson categories" ON lesson_categories
FOR DELETE USING (is_admin(auth.uid()));

-- Also ensure lessons policies are correctly set
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;

CREATE POLICY "Anyone can view published lessons" ON lessons
FOR SELECT USING (is_published = true OR is_admin(auth.uid()));

CREATE POLICY "Admins can insert lessons" ON lessons
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update lessons" ON lessons
FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete lessons" ON lessons
FOR DELETE USING (is_admin(auth.uid()));