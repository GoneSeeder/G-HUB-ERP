# Related Config Inventory For Setup_GEI_DEC_26

This inventory scans sibling config files in `C:/Users/User/Desktop/Config` without copying raw sensitive content into the project.
Connection/server/password-like values are redacted in previews.

## Extension Counts

- `.cfg`: 17
- `.gei`: 2
- `.inf`: 77
- `.ini`: 1
- `.inq`: 32
- `.rg`: 1
- `.rpp`: 1
- `.rt`: 1
- `.txt`: 2

## Best Candidates To Reuse In G-HUB

- `*.Inf`, `*.Inq`: legacy document/form/query definitions. Use as reference for screen/report field mappings.
- `POS.GEI`, `POS.RG`, `POS.RPP`, `POS.RT`: POS behavior flags, printer setup, barcode/cash-register/tax-invoice settings. Convert into company/branch/device settings tables.
- `SYSPA.CFG`, `System.cfg`: legacy SQL connection and company/job settings. Use only to identify database names and old environment layout; do not migrate secrets directly.
- `PRINT*.cfg`, `*.txt`: print template/device mapping. Useful for report/receipt template migration.
- `*-POSENTST*.cfg`, `POSENTM*.cfg`, `POSFin.cfg`: POS entry/state configuration. Useful for per-site POS setup rules.

## Top Keys Found

- `"FINDSQLPOS`: 105
- `"DBGRID1`: 64
- `"DBGRID1FIND`: 48
- `PRINTERSLP`: 31
- `PRINTERTAX`: 29
- `PRINTERCER`: 29
- `STATECASHREGISTER`: 9
- `USEPORT`: 9
- `CODECASHREGISTER`: 9
- `PRINTERSLIP`: 9
- `TABLEHAVE`: 9
- `CASHM`: 9
- `SALECFG`: 9
- `NATIONCFG`: 9
- `PRINTERNAME`: 8
- `BARCODE`: 7
- `CUSDISPLAYPORT`: 3
- `PRINTERREFUND`: 3
- `TRANSPORT`: 2
- `PRINTCOPY`: 2
- `MACHINENO`: 2
- `TOPMARGIN`: 2
- `LEFTMARGIN`: 2
- `TABLEGROUP`: 2
- `SQL`: 2
- `SQLCONNECT`: 2
- `THAI`: 2
- `ACCESS`: 2
- `COMPANYNAME`: 2
- `JOBNAME`: 2
- `MACHINETYPE`: 1
- `SALECODE`: 1
- `SHOWDISCOUNT`: 1
- `REBILL`: 1
- `SHOWPCS`: 1
- `CLEVEL`: 1
- `MONEYCHANGE`: 1
- `AUTOBONUS`: 1
- `AUTONEWBILL`: 1
- `TAXINVFULL`: 1
- `REFRESH`: 1
- `OVER`: 1
- `SQLCONNECTNET`: 1
- `SERVERNAME`: 1

## Files With Connection/Sensitive Markers

- `SYSPA.CFG`
- `System.cfg`

## Redacted File Previews

### ACCBOOK.Inq
- size: `60` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1409.953,3390.236,"
"FindSQLPos=0,0,0,0"
```

### ACCLINK.Inq
- size: `69` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1409.953,3660.095,1860.095,"
"FindSQLPos=0,0,0,0"
```

### AR_PAID_BUY.Inq
- size: `51` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=3030.236,"
"FindSQLPos=0,0,0,0"
```

### AR_PAID_PAY_1.Inq
- size: `51` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=3030.236,"
"FindSQLPos=0,0,0,0"
```

### BNCINF.Inq
- size: `59` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=3585.26,1844.787,"
"FindSQLPos=0,0,0,0"
```

### BNCINF_-.Inq
- size: `59` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1425.26,3300.095,"
"FindSQLPos=0,0,0,0"
```

### BNCINF_A.Inq
- size: `60` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=689.9528,3209.953,"
"FindSQLPos=0,0,0,0"
```

### CERTIFY.Inq
- size: `87` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1230.236,959.8111,1140.095,959.8111,1860.095,"
"FindSQLPos=0,0,0,0"
```

### Company.ini
- size: `0` bytes

### COSTING.Inf
- size: `80` bytes
```text
90
1350
2715
615
645
1020
975
735
945
975
1065
1035
```

### COSTING.Inq
- size: `60` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=5969.764,3929.953,"
"FindSQLPos=0,0,0,0"
```

### CUSTOMER_CUSTOMER.Inf
- size: `30` bytes
- keys: `"FindSQLPos`
```text
""
""
"FindSQLPos=0,0,0,0"
```

### DOCTYPE_SUB_-.Inq
- size: `60` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1409.953,3660.095,"
"FindSQLPos=0,0,0,0"
```

### ExpressImport.cfg
- size: `34` bytes
```text
C:\Program Files\ExpressD\SKDATA
```

### FIXCERTIFICATE.Inq
- size: `92` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=870.2363,1230.236,1800,1049.953,1289.764,1140.095,"
"FindSQLPos=0,0,0,0"
```

### GUIINF.Inq
- size: `60` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1500.095,6930.142,"
"FindSQLPos=0,0,0,0"
```

### GUIINF_-.Inq
- size: `60` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1319.811,1860.095,"
"FindSQLPos=0,0,0,0"
```

### GYU-POSENTST.cfg
- size: `158` bytes
- keys: `CASHM`, `CODECASHREGISTER`, `NATIONCFG`, `PRINTERNAME`, `PRINTERSLIP`, `SALECFG`, `STATECASHREGISTER`, `TABLEHAVE`, `USEPORT`
```text
STATECASHREGISTER=1
USEPORT=COM1
CODECASHREGISTER=7
PRINTERSLIP=Y
PRINTERNAME=EPSON TM-U210B Partial cut
TABLEHAVE=Y
CASHM=N
SALECFG=Y
NATIONCFG=N

```

### ICMAST.Inq
- size: `60` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1230.236,3750.236,"
"FindSQLPos=0,0,0,0"
```

### Import.cfg
- size: `24` bytes
```text
A
C
G
I
A
B
C
E
```

### ISSBILL_BR.Inf
- size: `124` bytes
- keys: `"DBGrid1`
```text
"DBGrid1=900.2835,1409.953,1860.095,1769.953,1860.095,1244.976,1005.165,1860.095,689.9528,1769.953,1409.953,1860.095,"
""
```

### ISSBILL_IAG.Inf
- size: `97` bytes
- keys: `"DBGrid1`
```text
"DBGrid1=900.2835,959.8111,1769.953,1860.095,959.8111,1244.976,689.9528,1769.953,959.8111,"
""
```

### ISSBILL_IG.Inf
- size: `124` bytes
- keys: `"DBGrid1`
```text
"DBGrid1=900.2835,1409.953,1860.095,1769.953,1860.095,1244.976,1005.165,1860.095,689.9528,1769.953,1409.953,1860.095,"
""
```

### ISSCNT_CNT.Inf
- size: `89` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1769.953,2129.953,1319.811,1860.095,"
"FindSQLPos=5315,40,17200,7115"
```

### ISSCNT_SCAN_CNT.Inf
- size: `80` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1769.953,1860.095,1860.095,"
"FindSQLPos=4595,40,20410,6395"
```

### ISSCSK_CSK.Inf
- size: `89` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1769.953,1860.095,1319.811,6359.812,"
"FindSQLPos=5315,40,17200,7115"
```

### ISSGRN_GRN.Inf
- size: `110` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSPTA_PTA.Inf
- size: `119` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,1769.953,959.8111,959.8111,1769.953,1860.095,1860.095,510.2362,1319.811,"
""
"FindSQLPos=0,0,0,0"
```

### ISSPTG_A_PTG.Inf
- size: `178` bytes
- keys: `"DBGrid1`, `"DBGrid1Find`, `"FindSQLPos`
```text
"DBGrid1=705.2599,1769.953,959.8111,959.8111,1769.953,1860.095,1860.095,510.2362,1319.811,"
"DBGrid1Find=1769.953,2039.811,959.8111,959.8111,"
"FindSQLPos=4595,40,20410,6395"
```

### ISSPTG_PTG.Inf
- size: `180` bytes
- keys: `"DBGrid1`, `"DBGrid1Find`, `"FindSQLPos`
```text
"DBGrid1=705.2599,1769.953,959.8111,959.8111,1769.953,1860.095,1860.095,510.2362,1319.811,"
"DBGrid1Find=1769.953,1230.236,959.8111,959.8111,"
"FindSQLPos=4590,2865,15540,6395"
```

### ISSREC_REC.Inf
- size: `196` bytes
- keys: `"DBGrid1`, `"DBGrid1Find`, `"FindSQLPos`
```text
"DBGrid1=900.2835,959.8111,1244.976,1005.165,1860.095,689.9528,1769.953,959.8111,"
"DBGrid1Find=1769.953,1679.811,1140.095,959.8111,959.8111,1860.095,1860.095,"
"FindSQLPos=3335,40,11920,5135"
```

### ISSSK_ADJ.Inf
- size: `189` bytes
- keys: `"DBGrid1`, `"DBGrid1Find`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3330.142,675.2126,780.0945,945.0709,1124.787,1244.976,854.9292,1140.095,1365.165,"
"DBGrid1Find=1769.953,1500.095,1844.787,5355.213,"
"FindSQLPos=1530,3975,12390,6510"
```

### ISSSK_CN.Inf
- size: `110` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_CP.Inf
- size: `139` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,3330.142,1140.095,945.0709,1244.976,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=4595,40,17200,6395"
```

### ISSSK_CPS.Inf
- size: `243` bytes
- keys: `"DBGrid1`, `"DBGrid1Find`, `"FindSQLPos`
```text
"DBGrid1=750.0473,4394.835,975.1182,959.8111,945.0709,1244.976,1244.976,915.0237,1140.095,1260.284,"
"DBGrid1Find=1769.953,1409.953,1950.236,1409.953,1230.236,1230.236,1860.095,1230.236,1860.095,1860.095,"
"FindSQLPos=6165,2700,10590,3675"
```

### ISSSK_CRN.Inf
- size: `128` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,3330.142,1140.095,945.0709,1244.976,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_DN.Inf
- size: `139` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,3330.142,1140.095,945.0709,1244.976,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=4805,40,23650,6605"
```

### ISSSK_DO.Inf
- size: `110` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_DOCTYPE_GN7.Inf
- size: `137` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,3330.142,1860.095,1244.976,945.0709,1244.976,1860.095,1860.095,1769.953,1409.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_DOCTYPE_GR7.Inf
- size: `137` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,3330.142,1140.095,945.0709,1244.976,1244.976,1860.095,1860.095,1769.953,1409.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_DOCTYPE_PR7.Inf
- size: `140` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,3330.142,1860.095,1244.976,945.0709,1769.953,689.9528,870.2363,1500.095,"
""
"FindSQLPos=6920,-20,28840,8720"
```

### ISSSK_ENT.Inf
- size: `139` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,3330.142,1140.095,945.0709,1244.976,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=4595,40,15280,6395"
```

### ISSSK_GCH.Inf
- size: `101` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1470.047,1860.095,945.0709,1244.976,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_GCH.Inq
- size: `116` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1950.236,1860.095,1860.095,1500.095,1860.095,1860.095,1860.095,"
"FindSQLPos=4595,40,15280,6395"
```

### ISSSK_GPP.Inf
- size: `94` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,1860.095,1244.976,1409.953,1769.953,"
""
"FindSQLPos=4595,40,15280,6395"
```

### ISSSK_GRB.Inf
- size: `139` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,3330.142,1140.095,945.0709,1244.976,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=4595,40,15280,6395"
```

### ISSSK_GRN.Inf
- size: `276` bytes
- keys: `"DBGrid1`, `"DBGrid1Find`, `"FindSQLPos`
```text
"DBGrid1=705.2599,4470.236,1065.26,1049.953,1019.906,945.0709,1244.976,959.8111,1049.953,1094.74,1409.953,"
"DBGrid1Find=1769.953,1500.095,1860.095,959.8111,1500.095,870.2363,959.8111,1860.095,689.9528,1769.953,1769.953,1409.953,1409.953,"
"FindSQLPos=3315,720,14010,4335"
```

### ISSSK_GRN.Inq
- size: `324` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1500.095,689.9528,3300.095,1860.095,1860.095,1230.236,1049.953,1140.095,1860.095,1860.095,1860.095,1049.953,870.2363,870.2363,1769.953,1409.953,1049.953,1409.953,1409.953,1860.095,1769.953,1860.095,1049.953,1860.095,1860.095,1860.095,1049.953,1140.095,1049.953,1140.095,"
"FindSQLPos=3315,720,14010,4335"
```

### ISSSK_GRR.Inf
- size: `205` bytes
- keys: `"DBGrid1`, `"DBGrid1Find`, `"FindSQLPos`
```text
"DBGrid1=750.0473,2174.74,1065.26,780.0945,945.0709,1244.976,929.7639,780.0945,1049.953,1124.787,1319.811,"
"DBGrid1Find=1769.953,1409.953,1950.236,1500.095,1860.095,"
"FindSQLPos=3750,3615,12240,4110"
```

### ISSSK_I.Inf
- size: `368` bytes
- keys: `"DBGrid1`, `"DBGrid1Find`, `"FindSQLPos`
```text
"DBGrid1=705.2599,5265.071,854.9292,840.189,1035.213,1049.953,1860.095,1769.953,"
"DBGrid1Find=1500.095,2849.953,1140.095,1319.811,1860.095,1230.236,1140.095,1500.095,1319.811,1319.811,1769.953,1769.953,1230.236,1049.953,1860.095,1860.095,1860.095,1860.095,1860.095,1860.095,1860.095,1230.236,1860.095,1860.095,1590.236,1679.811,"
"FindSQLPos=5190,2430,11920,5135"
```

### ISSSK_I.Inq
- size: `118` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1860.095,2670.236,1049.953,1500.095,1860.095,1860.095,1860.095,"
"FindSQLPos=5190,2430,11920,5135"
```

### ISSSK_IA.Inf
- size: `139` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1860.095,1860.095,1769.953,1860.095,1049.953,"
""
"FindSQLPos=5580,45,17460,7380"
```

### ISSSK_IN.Inf
- size: `83` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,945.0709,1244.976,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_INV.Inf
- size: `131` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1409.953,1140.095,945.0709,1244.976,780.0945,1860.095,1769.953,"
""
"FindSQLPos=3840,105,15280,6395"
```

### ISSSK_INV.Inq
- size: `117` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1319.811,3209.953,1049.953,1500.095,1860.095,1860.095,1860.095,"
"FindSQLPos=3840,105,15280,6395"
```

### ISSSK_ISE.Inf
- size: `140` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,3330.142,1140.095,945.0709,1244.976,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=4335,4365,8025,3615"
```

### ISSSK_ISF.Inf
- size: `91` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=599.811,3195.213,1140.095,705.2599,1200.189,1470.047,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_ISP.Inf
- size: `128` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,3330.142,1140.095,945.0709,1244.976,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_ISR.Inf
- size: `149` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=645.1654,3300.095,870.2363,870.2363,689.9528,1019.906,989.8583,794.8347,1230.236,1230.236,1860.095,"
""
"FindSQLPos=4890,5670,8955,6390"
```

### ISSSK_ISS.Inf
- size: `102` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=599.811,5235.024,1140.095,705.2599,1200.189,1470.047,"
""
"FindSQLPos=4335,40,15280,6395"
```

### ISSSK_IST.Inf
- size: `101` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1769.953,3330.142,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_ORD.Inf
- size: `251` bytes
- keys: `"DBGrid1`, `"DBGrid1Find`, `"FindSQLPos`
```text
"DBGrid1=1110.047,3839.811,2009.764,945.0709,1244.976,959.8111,1860.095,1769.953,"
"DBGrid1Find=1140.095,1409.953,870.2363,870.2363,1409.953,1409.953,959.8111,1769.953,1140.095,1230.236,1769.953,1860.095,1860.095,"
"FindSQLPos=4020,-45,15280,6395"
```

### ISSSK_ORD.Inq
- size: `197` bytes
- keys: `"DBGrid1`, `"DBGrid1Find`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3825.071,2009.764,945.0709,1244.976,959.8111,1860.095,1769.953,"
"DBGrid1Find=1409.953,2835.213,959.8111,1230.236,1860.095,1860.095,1860.095,"
"FindSQLPos=4020,-45,15280,6395"
```

### ISSSK_PO.Inf
- size: `313` bytes
- keys: `"DBGrid1`, `"DBGrid1Find`, `"FindSQLPos`
```text
"DBGrid1=705.2599,4800.189,434.8347,2204.788,824.882,1094.74,1035.213,1170.142,675.2126,959.8111,1200.189,1230.236,689.9528,870.2363,1230.236,"
"DBGrid1Find=1769.953,1409.953,1409.953,1500.095,1409.953,1409.953,1860.095,1769.953,1769.953,510.2362,1860.095,1860.095,1860.095,"
"FindSQLPos=2595,-285,20410,6395"
```

### ISSSK_PO.Inq
- size: `323` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=689.9528,1230.236,2865.26,3585.26,1500.095,60.09449,60.09449,1140.095,1409.953,2039.811,1950.236,1049.953,870.2363,870.2363,1769.953,1409.953,1049.953,1409.953,1409.953,1860.095,1769.953,1860.095,1049.953,1860.095,1860.095,1860.095,1049.953,1140.095,1049.953,1140.095,"
"FindSQLPos=2595,-285,20410,6395"
```

### ISSSK_POS.Inf
- size: `110` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1860.095,945.0709,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_PR.Inf
- size: `141` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3764.977,1260.284,1860.095,1244.976,945.0709,1769.953,689.9528,1019.906,1500.095,"
""
"FindSQLPos=3525,-210,15280,6395"
```

### ISSSK_PR.Inq
- size: `118` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1860.095,3390.236,1860.095,1500.095,1860.095,1860.095,1860.095,"
"FindSQLPos=3525,-210,15280,6395"
```

### ISSSK_PR7.Inf
- size: `128` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,3330.142,1860.095,1244.976,945.0709,1769.953,689.9528,870.2363,1500.095,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_PRM.Inf
- size: `128` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,3330.142,1140.095,945.0709,1244.976,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_QT.Inf
- size: `123` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3044.977,1140.095,945.0709,1244.976,1860.095,1769.953,959.8111,"
""
"FindSQLPos=3840,2070,11070,6395"
```

### ISSSK_RCH.Inf
- size: `112` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,3330.142,1140.095,945.0709,1244.976,1769.953,"
""
"FindSQLPos=5585,40,21520,7385"
```

### ISSSK_RET.Inf
- size: `141` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,5204.977,900.2835,959.8111,945.0709,1244.976,1244.976,1049.953,1230.236,1275.024,"
""
"FindSQLPos=5685,4350,10110,3165"
```

### ISSSK_SA_I.Inf
- size: `121` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=4595,40,15280,6395"
```

### ISSSK_SA_ORD.Inf
- size: `121` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=4595,40,15280,6395"
```

### ISSSK_SA_PO.Inf
- size: `110` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_SPR.Inf
- size: `110` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1860.095,945.0709,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_SR.Inf
- size: `124` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=-120,-120,29040,15840"
```

### ISSSK_TOB.Inf
- size: `92` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSSK_TRI.Inf
- size: `141` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,3330.142,1140.095,945.0709,1244.976,1244.976,1860.095,1860.095,1769.953,"
""
"FindSQLPos=4320,2595,15280,6395"
```

### ISSSK_TRO.Inf
- size: `112` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=720.0001,6494.74,1230.236,945.0709,1244.976,1769.953,3330.142,"
""
"FindSQLPos=240,7380,10740,8868"
```

### ISSSK_TRO.Inq
- size: `116` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1860.095,3390.236,1860.095,1500.095,1860.095,1860.095,1860.095,"
"FindSQLPos=240,7380,8010,6390"
```

### ISSUE1_ADJ.Inf
- size: `103` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1769.953,"
""
"FindSQLPos=3275,40,11920,5075"
```

### ISSUE1_CN.Inf
- size: `94` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,945.0709,1244.976,1769.953,"
""
"FindSQLPos=4595,40,15280,6395"
```

### ISSUE1_GRN.Inf
- size: `103` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1769.953,"
""
"FindSQLPos=3275,40,11920,5075"
```

### ISSUE1_I.Inf
- size: `139` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1860.095,1860.095,1769.953,959.8111,1049.953,"
""
"FindSQLPos=3350,40,11920,5150"
```

### ISSUE1_IA.Inf
- size: `139` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,4215.118,1140.095,945.0709,1244.976,1860.095,1860.095,1769.953,959.8111,1049.953,"
""
"FindSQLPos=3275,40,11920,5075"
```

### ISSUE1_IN.Inf
- size: `94` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,945.0709,1244.976,1769.953,"
""
"FindSQLPos=3350,40,11920,5150"
```

### ISSUE1_INV.Inf
- size: `92` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSUE1_ORD.Inf
- size: `103` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1769.953,"
""
"FindSQLPos=4595,40,15280,6395"
```

### ISSUE1_PO.Inf
- size: `94` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,945.0709,1244.976,1769.953,"
""
"FindSQLPos=4595,40,15280,6395"
```

### ISSUE1_RET.Inf
- size: `83` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,945.0709,1244.976,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSUE1_SA.Inf
- size: `92` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,1140.095,945.0709,1244.976,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### ISSUE1_SR.Inf
- size: `83` bytes
- keys: `"DBGrid1`, `"FindSQLPos`
```text
"DBGrid1=705.2599,3000.189,945.0709,1244.976,1769.953,"
""
"FindSQLPos=0,0,0,0"
```

### MAC5DB.CFG
- size: `350` bytes
```text
!8ä Váë];	
Z¼Iª§J·¯¤®§F±·¤®§R«°§R£«´b§»¸[µ¿¸W04/11/2012!8ä Váë];	
Z¼Iª§J·¯¤®§F±·¤®§R«°§R£«´b§»¸[µ¿¸W04/11/2012!8ä Váë];	
Z¼Iª§J·¯¤®§F±·¤®§R«°§R£«´b§»¸[µ¿¸W04/11/2012!8ä Váë];	
Z¼Iª§J·¯¤®§F±·¤®§R«°§R£«´b§»¸[µ¿¸W04/11/2012!8ä Váë];	
Z¼Iª§J·¯¤®§F±·¤®§R«°§R£«´b§»¸[µ¿¸W04/11/2012
```

### MALI-POSENTST.cfg
- size: `167` bytes
- keys: `BARCODE`, `CASHM`, `CODECASHREGISTER`, `NATIONCFG`, `PRINTERNAME`, `PRINTERSLIP`, `SALECFG`, `STATECASHREGISTER`, `TABLEHAVE`, `USEPORT`
```text
STATECASHREGISTER=1
USEPORT=COM1
CODECASHREGISTER=7
PRINTERSLIP=N
PRINTERNAME=EPSON TM-U210B Partial cut
TABLEHAVE=N
CASHM=N
SALECFG=N
NATIONCFG=Y
BARCODE=Y
```

### MALI-POSENTST_Back.cfg
- size: `156` bytes
- keys: `CASHM`, `CODECASHREGISTER`, `NATIONCFG`, `PRINTERNAME`, `PRINTERSLIP`, `SALECFG`, `STATECASHREGISTER`, `TABLEHAVE`, `USEPORT`
```text
STATECASHREGISTER=1
USEPORT=COM1
CODECASHREGISTER=7
PRINTERSLIP=N
PRINTERNAME=EPSON TM-U210B Partial cut
TABLEHAVE=N
CASHM=N
SALECFG=N
NATIONCFG=Y
```

### MALI-POSENTST_Back2.cfg
- size: `57` bytes
```text
1
COM1
7
Y
EPSON TM-U210B Partial cut
N
N
N
Y

```

### MAST1_BANKACC.Inq
- size: `141` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1409.953,2580.095,1860.095,1409.953,1679.811,1679.811,1590.236,1950.236,2399.811,2039.811,1950.236,"
"FindSQLPos=0,0,0,0"
```

### MAST1_CARDTYPE.Inq
- size: `114` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1409.953,3209.953,1860.095,1409.953,1679.811,1679.811,1590.236,1950.236,"
"FindSQLPos=0,0,0,0"
```

### MAST1_COMPANY.Inf
- size: `41` bytes
- keys: `"FindSQLPos`
```text
""
""
"FindSQLPos=4595,40,15280,6395"
```

### MAST1_CUSTOMER.Inf
- size: `154` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1140.095,3374.929,4965.166,2310.236,1860.095,1860.095,1860.095,1860.095,1049.953,1860.095,1140.095,"
"FindSQLPos=4155,-285,11940,5075"
```

### MAST1_ICGROUP.Inf
- size: `41` bytes
- keys: `"FindSQLPos`
```text
""
""
"FindSQLPos=3350,40,11920,5150"
```

### MAST1_ICMAST.Inf
- size: `127` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1409.953,6735.119,1230.236,1140.095,1500.095,1950.236,1319.811,1319.811,"
"FindSQLPos=4725,2550,11920,5075"
```

### MAST1_ICUNIT.Inf
- size: `30` bytes
- keys: `"FindSQLPos`
```text
""
""
"FindSQLPos=0,0,0,0"
```

### MAST1_SALE.Inf
- size: `80` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1140.095,1860.095,3119.811,"
"FindSQLPos=3335,40,11920,5135"
```

### MAST1_SALE.Inq
- size: `60` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1230.236,2759.811,"
"FindSQLPos=0,0,0,0"
```

### MAST1_SENDPLACE.Inf
- size: `41` bytes
- keys: `"FindSQLPos`
```text
""
""
"FindSQLPos=4595,40,15280,6395"
```

### MAST1_SUPPLIER.Inf
- size: `41` bytes
- keys: `"FindSQLPos`
```text
""
""
"FindSQLPos=3350,40,11920,5150"
```

### MAST1_SUPPLIER.Inq
- size: `60` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1214.929,3209.953,"
"FindSQLPos=0,0,0,0"
```

### MAST1_ZICACCGROUP.Inq
- size: `141` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1409.953,2849.953,1860.095,1409.953,1679.811,1679.811,1590.236,1950.236,2399.811,2039.811,1950.236,"
"FindSQLPos=0,0,0,0"
```

### MAST1_ZONE.Inf
- size: `43` bytes
- keys: `"FindSQLPos`
```text
""
""
"FindSQLPos=3450,-405,15280,6395"
```

### MNYENT_-.Inq
- size: `69` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1409.953,2940.095,1860.095,"
"FindSQLPos=0,0,0,0"
```

### MONEY.Inq
- size: `69` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1409.953,3030.236,1860.095,"
"FindSQLPos=0,0,0,0"
```

### POS.GEI
- size: `705` bytes
- keys: `AUTOBONUS`, `AUTONEWBILL`, `BARCODE`, `CASHM`, `CLEVEL`, `CODECASHREGISTER`, `CUSDISPLAYPORT`, `MONEYCHANGE`, `MachineType`, `NATIONCFG`, `PRINTCOPY`, `PRINTERCER`, `PRINTERSLIP`, `PRINTERSLP`, `PRINTERTAX`, `REBILL`, `SALECFG`, `SALECODE`, `SHOWDISCOUNT`, `SHOWPCS`
```text
PRINTERSLP=
PRINTERTAX=Foxit Reader PDF Printer
PRINTERCER=Foxit Reader PDF Printer
PRINTERSLP=
TRANSPORT=Y
MachineType=TK
//MachineNo=12
STATECASHREGISTER=1
USEPORT=COM3
CUSDISPLAYPORT=COM4
CODECASHREGISTER=3
PRINTERSLIP=N
```

### POS.RG
- size: `2031` bytes
- keys: `MachineNo`, `PRINTERCER`, `PRINTERSLP`, `PRINTERTAX`, `TRANSPORT`
```text
MachineNo=202
PRINTERTAX=PDFCreator
PRINTERCER=SnagIt 7
PRINTERSLP=
PRINTERTAX=PDFCreator
PRINTERCER=SnagIt 7
PRINTERSLP=
PRINTERTAX=PDFCreator
PRINTERCER=SnagIt 7
PRINTERSLP=
PRINTERTAX=PDFCreator
PRINTERCER=PDFCreator
```

### POS.RPP
- size: `209` bytes
- keys: `BARCODE`, `CASHM`, `CODECASHREGISTER`, `CUSDISPLAYPORT`, `MACHINENO`, `NATIONCFG`, `PRINTCOPY`, `PRINTERNAME`, `PRINTERSLIP`, `SALECFG`, `STATECASHREGISTER`, `TABLEHAVE`, `USEPORT`
```text
STATECASHREGISTER=1
USEPORT=COM3
CUSDISPLAYPORT=COM4
CODECASHREGISTER=3
PRINTERNAME=EPSON TM-T88IV Receipt
TABLEHAVE=N
CASHM=N
SALECFG=N
NATIONCFG=Y
PRINTERSLIP=N
BARCODE=Y
PRINTCOPY=2
```

### POS.RT
- size: `184` bytes
- keys: `BARCODE`, `CASHM`, `CODECASHREGISTER`, `CUSDISPLAYPORT`, `NATIONCFG`, `PRINTERNAME`, `PRINTERSLIP`, `SALECFG`, `STATECASHREGISTER`, `TABLEHAVE`, `USEPORT`
```text
STATECASHREGISTER=1
USEPORT=COM3
CUSDISPLAYPORT=COM4
CODECASHREGISTER=7
PRINTERSLIP=Y
PRINTERNAME=EPSON TM-T88IV Receipt
TABLEHAVE=N
CASHM=N
SALECFG=N
NATIONCFG=Y
BARCODE=Y
```

### POSCOM_NOP.Inq
- size: `123` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=870.2363,1860.095,3119.811,1860.095,1860.095,1140.095,1860.095,1860.095,1860.095,"
"FindSQLPos=0,0,0,0"
```

### POSENTM.cfg
- size: `51` bytes
```text
1
COM1
7
Y
EPSON TM-U210B Partial cut
N
N

```

### POSENTM_Back.cfg
- size: `51` bytes
```text
1
COM1
7
Y
EPSON TM-U210B Partial cut
Y
N

```

### POSFin.cfg
- size: `21` bytes
- keys: `over`, `refresh`
```text
refresh=10
over=20
```

### PRINTFRM_I1_Epson LQ-2550.cfg
- size: `27` bytes
- keys: `LeftMargin`, `TopMargin`
```text
TopMargin=1
LeftMargin=3
```

### PRINTFRM_I1_HP LaserJet 1022.cfg
- size: `34` bytes
- keys: `LeftMargin`, `TopMargin`
```text
LeftMargin=0.60
TopMargin=-0.20
```

### PRINTPE_I.txt
- size: `304` bytes
```text
 qJ3 JÞÔ¢li%qþ´6Xü9LÛÁÙ
Ñ3!ÂØÄ¿>âiGþVÁÍÉÂÈkð·½íìYPýçÕ×*NHh£^z0-ÏÚ?ÇõlÉbÜ/ô@+Níz¼-3_*¨¦Øx
¤²9ð¶]|
=Ý?BiÍÐÂ;F*¤´^I$o¿,u[(2QJ'½IÖî_ÓürLæDÚø³Hu,ïå [}º×µ
¼Á´R^Ã¶8IÛ¨p75¯@³?[­
Z¹fmÄy6Í`´×MîýüîçáI@s³OÃËxÊ[åpÂFÝ+[½¡Än5%è¨øÁÙ÷w
Übâ^qzw$^º'ÆNcb]t%¶À
```

### PRINTPE_IA.txt
- size: `304` bytes
```text
 qJ3 JÞÔ¢li%qþLRn,yyø6äY
WÉ.­á²hudq<ÀËhCØþâ7²ÐW8_Ô[N¦çxu%æÿ9a6Í8xQCûÍéMúÅçñ|n=Kþ"cs©¾[?¯O;ãýI¦l&9úótS.äÓ6GmtÌµ²¹Öòl­¼ ¶ª`üY,Ã¥kÜ$ºWU~^ñ_÷ùBíªcwª3'rgãÏèçÈjgÎSÜV¦ÆR ´sæ³d	]K4E=W]7Ë(Û
©ßUæÎÒÇ7OxÃEÉ§8þ
]Dîp
ÿÝ:»¾T"	
R©/%Þ_X+$
xÖô­^Ð(>>¡¡t2*ÂÐFØ\T
```

### Refund.GEI
- size: `143` bytes
- keys: `PRINTERREFUND`
```text
PRINTERREFUND=Foxit Reader PDF Printer
PRINTERREFUND=\\110.100.111.30\HP LaserJet Professional P1102
PRINTERREFUND=Foxit Reader PDF Printer
```

### RSR-FRONT-POSENTST.cfg
- size: `185` bytes
- keys: `BARCODE`, `CASHM`, `CODECASHREGISTER`, `NATIONCFG`, `PRINTERNAME`, `PRINTERSLIP`, `SALECFG`, `STATECASHREGISTER`, `TABLEGROUP`, `TABLEHAVE`, `USEPORT`
```text
STATECASHREGISTER=1
USEPORT=COM1
CODECASHREGISTER=7
PRINTERSLIP=Y
PRINTERNAME=EPSON TM-U210B Partial cut
TABLEHAVE=N
CASHM=N
SALECFG=Y
NATIONCFG=N
BARCODE=Y
TABLEGROUP=N

```

### RSR-POSENTST-2.cfg
- size: `169` bytes
- keys: `BARCODE`, `CASHM`, `CODECASHREGISTER`, `NATIONCFG`, `PRINTERNAME`, `PRINTERSLIP`, `SALECFG`, `STATECASHREGISTER`, `TABLEHAVE`, `USEPORT`
```text
STATECASHREGISTER=1
USEPORT=COM1
CODECASHREGISTER=7
PRINTERSLIP=N
PRINTERNAME=EPSON TM-U210B Partial cut
TABLEHAVE=N
CASHM=N
SALECFG=Y
NATIONCFG=N
BARCODE=Y

```

### RSR-POSENTST.cfg
- size: `183` bytes
- keys: `BARCODE`, `CASHM`, `CODECASHREGISTER`, `NATIONCFG`, `PRINTERNAME`, `PRINTERSLIP`, `SALECFG`, `STATECASHREGISTER`, `TABLEGROUP`, `TABLEHAVE`, `USEPORT`
```text
STATECASHREGISTER=1
USEPORT=COM1
CODECASHREGISTER=7
PRINTERSLIP=Y
PRINTERNAME=EPSON TM-U210B Partial cut
TABLEHAVE=Y
CASHM=N
SALECFG=Y
NATIONCFG=N
BARCODE=Y
TABLEGROUP=Y

```

### SELJOURNAL.Inq
- size: `141` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1409.953,3479.811,1860.095,1409.953,1679.811,1679.811,1590.236,1950.236,2399.811,2039.811,1950.236,"
"FindSQLPos=0,0,0,0"
```

### SYSPA.CFG
- size: `446` bytes
- keys: `Access`, `CompanyName`, `JobName`, `SQL`, `SQLCONNECTNet`, `SQLConnect`, `ServerName`, `Thai`
- contains connection/sensitive marker: `true`
```text
'DataDir    = C:\IVACC\
'DataFile   = 
'PrgDir      = c:\BET\PRG\
'ReportDir = c:\BTE\RPT\
'PicDir=C:\Picture\
'SourcePicDir=C:\Picture1\
SQL=Y

SQLConnect=Driver={SQL Server};Server=<redacted>;Database=GEI_ACC;UID=<redacted>;PWD=<redacted>;

SQLCONNECTNet=Data Source=<redacted>;Initial Catalog=GEI_ACC;User ID=<redacted>;Password=<redacted>;

```

### System.cfg
- size: `323` bytes
- keys: `Access`, `CompanyName`, `JobName`, `SQL`, `SQLConnect`, `Thai`
- contains connection/sensitive marker: `true`
```text
'DataDir    = C:\IVACC\
'DataFile   = 
'PrgDir      = c:\BET\PRG\
'ReportDir = c:\BTE\RPT\
'PicDir=C:\Picture\
'SourcePicDir=C:\Picture1\
SQL=Y
SQLConnect=Driver={SQL Server};Server=<redacted>;Database=RG_ACC;UID=<redacted>;PWD=<redacted>; 

'ServerName=Office1

Thai=Y
```

### TAXINVOICE.Inq
- size: `105` bytes
- keys: `"DBGrid1Find`, `"FindSQLPos`
```text
""
"DBGrid1Find=1860.095,1860.095,1230.236,780.0945,1409.953,1860.095,1860.095,"
"FindSQLPos=0,0,0,0"
```
