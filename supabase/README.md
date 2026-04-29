# Supabase Setup

## 1. Create Project
Go to https://supabase.com and create a new project named "paws-glow".

## 2. Run Schema
Copy the contents of `schema.sql` and run it in the Supabase SQL Editor.

## 3. Create Storage Bucket
In Supabase Dashboard > Storage, create a new bucket:
- Name: `pet-photos`
- Public: ✅ enabled

Then add these policies to `storage.objects`:
- INSERT: `WITH CHECK (bucket_id = 'pet-photos')`
- SELECT: `USING (bucket_id = 'pet-photos')`

## 4. Configure Environment Variables
Copy `.env.local` template and fill in your credentials from:
- Supabase Dashboard > Settings > API
- OpenAI Dashboard > API Keys
- Resend Dashboard > API Keys
- Twilio Console > Account Info
