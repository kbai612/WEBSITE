ALTER TABLE messages ADD COLUMN safety_flagged INTEGER CHECK (safety_flagged IN (0, 1));
