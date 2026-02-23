DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT
            c.relname AS table_name,
            a.attname AS column_name,
            s.relname AS sequence_name
        FROM pg_class s
        JOIN pg_depend d ON d.objid = s.oid
        JOIN pg_class c ON d.refobjid = c.oid
        JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.refobjsubid
        WHERE s.relkind = 'S'
    LOOP
        EXECUTE format(
            'SELECT setval(''%I'', COALESCE((SELECT MAX(%I) FROM %I), 1), true)',
            r.sequence_name,
            r.column_name,
            r.table_name
        );
    END LOOP;
END $$;