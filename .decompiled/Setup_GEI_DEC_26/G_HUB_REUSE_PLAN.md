# G-HUB Reuse Plan From Setup_GEI_DEC_26

## Verdict

`Setup_GEI_DEC_26.exe` is a VB6 native setup/config utility, not a recoverable .NET source project. It is useful as a legacy reference, but not as direct source code to paste into G-HUB.

The most useful material is:

- SQL/table names and business-rule fragments from the executable strings.
- Sibling config files in `C:/Users/User/Desktop/Config`, especially POS/device/report layout config.
- Existing `.decompiled/BookingInfor` C# output, which is much closer to reusable application logic than this VB6 setup executable.

## Directly Reusable In G-HUB

### 1. Legacy Database Map

Use the extracted SQL/table strings to build a read-only legacy database inventory.

Important tables/entities found:

- `CompanyList`
- `DocType`
- `POSMain`
- `POSMainH`
- `POSItem`
- `POSItemH`
- `Product`
- `Bonus`
- `BonusCom`
- `BonusComAgent`
- `BonusComGuide`
- `TourGroup`
- `Agent`
- `CardType`
- `SysComUse`
- `zicmast`
- `zICGroup`

Suggested G-HUB target:

- Backend legacy import service.
- Prisma models or read-only SQL views for POS, bonus/commission, company, product, and document type migration.

### 2. Company / Branch / Environment Settings

The setup utility references old company/environment config keys:

- `COMPANYCODE`
- `COMPANYNAME`
- `JOBNAME`
- `SERVERNAME`
- `DATABASENAME`
- `DATADIR`
- `DATAFILE`
- `PRGDIR`
- `CONFIGDIR`
- `REPORTDIR`
- `PICDIR`
- `IMAGEDIR`
- `THAI`
- `ACCESS`
- `SQLCONNECT`
- `REPORTSQL`

Suggested G-HUB target:

- Company settings table.
- Branch environment settings.
- Legacy import connection profile, with secrets stored only in environment variables or encrypted secret storage.

Do not migrate raw passwords or old `sa` credentials into source code.

### 3. POS And Device Settings

The sibling config inventory shows strong POS/device settings:

- `PRINTERSLP`
- `PRINTERTAX`
- `PRINTERCER`
- `PRINTERREFUND`
- `PRINTERNAME`
- `STATECASHREGISTER`
- `CODECASHREGISTER`
- `USEPORT`
- `CUSDISPLAYPORT`
- `PRINTERSLIP`
- `TABLEHAVE`
- `CASHM`
- `SALECFG`
- `NATIONCFG`
- `BARCODE`
- `PRINTCOPY`
- `MACHINETYPE`
- `MACHINENO`
- `TAXINVFULL`
- `SHOWDISCOUNT`
- `REBILL`
- `SHOWPCS`
- `MONEYCHANGE`
- `AUTOBONUS`
- `AUTONEWBILL`

Suggested G-HUB target:

- POS station settings.
- Printer profile settings.
- Branch/device configuration UI.
- Receipt/tax invoice print profile.

### 4. Report / Inquiry Layouts

The `.Inf` and `.Inq` files look like legacy layout/search/grid configuration.

Suggested G-HUB target:

- Import as reference data for old report widths/columns.
- Build a mapper from old report names to new report screens.
- Use only as reference; do not assume these are complete report definitions.

### 5. Commission / Bonus Logic Reference

The executable contains SQL fragments around:

- Agent commission: `AgentCom`, `AgentComPct`, `BonusComAgent`.
- Guide commission: `GuideComPct`, `BonusComGuide`.
- Rate group correction: `rategroup`, `zICGroup`, `zicmast`, `POSItem`.
- POS net recalculation: `Net=Total-Discount+Fee`.
- Bonus close/update flag: `bonuscom='Y'`.

Suggested G-HUB target:

- Commission calculation service.
- Data repair/migration scripts.
- Reconciliation reports between old POS and new G-HUB data.

These snippets are incomplete and should be validated against the live legacy database before implementation.

## Not Directly Reusable

- VB6 form code and event handlers: compiled as native code, not recoverable as clean source here.
- Old installer behavior: should not be reused in G-HUB.
- Raw connection strings or passwords: treat as sensitive.
- WinAPI/ICMP/WinSock calls: likely old setup checks, not needed in modern web app flow.
- VB6 controls such as `MSADODC.OCX` and `MSCOMCTL.OCX`: not relevant to React/NestJS.

## Recommended Next Steps

1. Create a read-only legacy SQL Server connection profile outside source control.
2. Introspect schema for the tables listed above.
3. Compare extracted table names with existing Prisma schema and `.decompiled/BookingInfor`.
4. Build a migration map:
   - Legacy company/branch -> G-HUB company/branch.
   - Legacy POS bills/items -> G-HUB sales/POS entities.
   - Legacy bonus/commission -> G-HUB commission module.
   - Legacy printer/device config -> G-HUB branch device settings.
5. Keep `.decompiled/Setup_GEI_DEC_26/raw` out of production code and review for sensitive data before committing.

## Artifact References

- `README.md`: static decompilation summary.
- `metadata.json`: hash and PE section metadata.
- `categorized_strings.json`: grouped extracted strings.
- `sql_strings.sql`: SQL-like fragments.
- `related_config_inventory.md`: redacted inventory of sibling config files.
- `related_config_inventory.json`: machine-readable redacted inventory.
