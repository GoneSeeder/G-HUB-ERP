UPDATE "NameList"
SET
  "code" = regexp_replace("code", '^GEI-N-L/([0-9]{2})/([0-9]{2})/([0-9]{4})$', 'GEI-N-L\1\2\3'),
  "partyCode" = regexp_replace("partyCode", '^GEI-N-L/([0-9]{2})/([0-9]{2})/([0-9]{4})$', 'GEI-N-L\1\2\3')
WHERE
  "code" ~ '^GEI-N-L/[0-9]{2}/[0-9]{2}/[0-9]{4}$'
  OR "partyCode" ~ '^GEI-N-L/[0-9]{2}/[0-9]{2}/[0-9]{4}$';

UPDATE "NameListItem"
SET "code" = regexp_replace("code", '^GEI-N-L/([0-9]{2})/([0-9]{2})/([0-9]{4})$', 'GEI-N-L\1\2\3')
WHERE "code" ~ '^GEI-N-L/[0-9]{2}/[0-9]{2}/[0-9]{4}$';
