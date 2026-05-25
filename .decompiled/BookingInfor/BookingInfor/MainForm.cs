using System;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Reflection;
using System.Windows.Forms;
using BookingInfor.DB;
using DevExpress.Images;
using DevExpress.LookAndFeel;
using DevExpress.Utils;
using DevExpress.XtraBars;
using DevExpress.XtraBars.Ribbon;
using DevExpress.XtraEditors;
using DevExpress.XtraEditors.Controls;
using DevExpress.XtraEditors.Repository;
using DevExpress.XtraGrid;
using DevExpress.XtraGrid.Columns;
using DevExpress.XtraGrid.Views.Base;
using DevExpress.XtraGrid.Views.Grid;
using DevExpress.XtraSplashScreen;

namespace BookingInfor;

public class MainForm : RibbonForm
{
	private IContainer components = null;

	private RibbonControl ribbon;

	private RibbonPage ribbonPage1;

	private RibbonPageGroup ribbonPageGroup1;

	private RibbonStatusBar ribbonStatusBar;

	private BarButtonItem btnExit;

	private SkinRibbonGalleryBarItem skinRibbonGalleryBarItem1;

	private BarButtonItem btnFind;

	private BarButtonItem btnRefresh;

	private BarButtonItem btnAdd;

	private BarButtonItem btnEdit;

	private BarButtonItem btnDelete;

	private RibbonPageGroup ribbonPageGroup4;

	public RibbonPageGroup ribbonPageGroup5;

	private RibbonPageGroup ribbonPageGroup2;

	private RibbonPageGroup ribbonPageGroup3;

	private PanelControl panelControl1;

	private BarStaticItem lblStatus;

	private BarStaticItem lblStatus01;

	private BarStaticItem lblAppVersion;

	private DefaultLookAndFeel defaultLookAndFeel1;

	private BarButtonItem btnPrint;

	private RibbonPageGroup ribbonPageGroup6;

	private BarButtonItem btnImportFromExcel;

	private RibbonPageGroup ribbonPageGroup7;

	private BarEditItem lookupEditStatusItem;

	private RepositoryItemLookUpEdit repositoryItemLookUpEdit1;

	private RibbonPageGroup ribbonPageGroup8;

	private GridControl gridControl1;

	private GridView gridView1;

	private GridColumn gridColumn1;

	private GridColumn gridColumn2;

	private GridColumn gridColumn3;

	private GridColumn gridColumn4;

	private GridColumn gridColumn5;

	private GridColumn gridColumn9;

	private GridColumn gridColumn6;

	private GridColumn gridColumn7;

	private GridColumn gridColumn8;

	private GridColumn gridColumn10;

	private GridColumn gridColumn11;

	private GridColumn gridColumn12;

	private GridColumn gridColumn13;

	private GridColumn gridColumn14;

	private GridColumn gridColumn15;

	private GridColumn gridColumn16;

	private GridColumn gridColumn17;

	private GridColumn gridColumn18;

	private GridColumn gridColumn19;

	private SplashScreenManager splashScreenManager1;

	private BarButtonItem btnDeleteImport;

	private BarButtonItem btnImportExcelSeparate;

	private GridColumn gridColumn20;

	private GridColumn gridColumn21;

	private GridColumn gridColumn22;

	private GridColumn gridColumn23;

	private GridColumn gridColumn24;

	private GridColumn gridColumn25;

	private GridColumn gridColumn26;

	private BarButtonItem btnAgentMaching;

	private RibbonPageGroup ribbonPageGroup9;

	private RibbonPage ribbonPage2;

	private RibbonPageGroup ribbonPageGroup10;

	private BarButtonItem btnCreateBonusList;

	private RibbonPageGroup ribbonPageGroup11;

	private BarButtonItem btnAppSetting;

	private GridColumn gridColumn27;

	private ImageCollection image16x16;

	private RepositoryItemImageComboBox repositoryItemImageComboBox1;

	private GridColumn gridColumn28;

	private RepositoryItemImageComboBox repositoryItemImageComboBox2;

	private BarButtonItem btnCreateToBonus;

	private RibbonPageGroup ribbonPageGroup12;

	private RepositoryItemComboBox repoCmbFilterMonth;

	private RibbonPageGroup ribbonPageGroup13;

	private BarEditItem beiFilterMonth;

	private RepositoryItemLookUpEdit repoLueFilterMonth;

	private GridColumn gridColumn29;

	public MainForm()
	{
		InitializeComponent();
		InitPage();
	}

	private void InitPage()
	{
		StCl.MT.Sysinit();
		string applicationName = Util.GetApplicationName();
		DAL.StringConnection = StCl.MT.StrSQLconnect + "Application Name=" + applicationName + ";";
		ParaClass.UserLogin = StCl.MT.StrLoginName;
		ParaClass.UserLoginName = DataSQL.GetUserName(ParaClass.UserLogin);
		string strCompanyCode = StCl.MT.StrCompanyCode;
		string strCompany_Name = StCl.MT.StrCompany_Name;
		string[] array = AppDomain.CurrentDomain.FriendlyName.ToString().Split('.');
		if (array[0].ToUpper() == "BOOKINGINFOR_A" || ParaClass.UserLogin.ToUpper() == "SUPPORT")
		{
			AppPrivilege.Level = AppPrivilege.PrivilageLevel.Admin;
		}
		Text = "Booking Infor [" + strCompany_Name + "]";
		AppConfig.InitialAppConfig(DAL.StringConnection, "BOOKINGINFOR");
		if (ParaClass.UserLogin.ToUpper() == "SUPPORT" || ParaClass.UserLogin.ToUpper() == "ADMIN")
		{
			ribbonPage2.Visible = true;
		}
		else
		{
			ribbonPage2.Visible = false;
		}
		lblStatus01.Caption = ParaClass.UserLogin + " | " + ParaClass.UserLoginName + " | " + strCompanyCode;
		lblAppVersion.Caption = " | Version : " + getVersionApplication();
		InitScreen();
		DataSQL.GetServerDate();
		InitLoadValue();
		lookupEditStatusItem.EditValue = 2;
		beiFilterMonth.EditValue = 1;
		lblStatus.Caption = "Ready";
		ShowData();
	}

	private void InitScreen()
	{
		if (AppConfig.AllowCreateBonusList)
		{
			ribbonPageGroup11.Visible = true;
			gridView1.Columns["Upload"].Visible = true;
		}
		else
		{
			ribbonPageGroup11.Visible = false;
			gridView1.Columns["Upload"].Visible = false;
		}
	}

	private string getVersionApplication()
	{
		Assembly executingAssembly = Assembly.GetExecutingAssembly();
		FileVersionInfo versionInfo = FileVersionInfo.GetVersionInfo(executingAssembly.Location);
		return versionInfo.FileVersion;
	}

	private void InitLoadValue()
	{
		DataTable dataTable = new DataTable();
		dataTable.Columns.Add("idx", typeof(int));
		dataTable.Columns.Add("Name", typeof(string));
		dataTable.Rows.Add(0, "All");
		dataTable.Rows.Add(1, "Complete");
		dataTable.Rows.Add(2, "Incomplete");
		repositoryItemLookUpEdit1.DataSource = dataTable;
		repositoryItemLookUpEdit1.DisplayMember = "Name";
		repositoryItemLookUpEdit1.ValueMember = "idx";
		DataTable dataTable2 = new DataTable();
		dataTable2.Columns.Add("idx", typeof(int));
		dataTable2.Columns.Add("Name", typeof(string));
		dataTable2.Rows.Add(0, "All Date");
		dataTable2.Rows.Add(1, "3 months");
		dataTable2.Rows.Add(2, "6 months");
		dataTable2.Rows.Add(3, "1 year");
		repoLueFilterMonth.DataSource = dataTable2;
		repoLueFilterMonth.DisplayMember = "Name";
		repoLueFilterMonth.ValueMember = "idx";
	}

	public void ShowWaitForm()
	{
		if (splashScreenManager1.IsSplashFormVisible)
		{
			splashScreenManager1.CloseWaitForm();
		}
		splashScreenManager1.ShowWaitForm();
	}

	public void CloseWaitForm()
	{
		if (splashScreenManager1.IsSplashFormVisible)
		{
			splashScreenManager1.CloseWaitForm();
		}
	}

	private void btnExit_ItemClick(object sender, ItemClickEventArgs e)
	{
		DialogResult dialogResult = MessageBox.Show("Do you want to exit program ?", "Exit Program", MessageBoxButtons.YesNo);
		if (dialogResult == DialogResult.Yes)
		{
			Application.Exit();
		}
	}

	private void ShowData()
	{
		ShowWaitForm();
		AppPrivilege.statusActive statusActive = Convert.ToInt32(lookupEditStatusItem.EditValue) switch
		{
			1 => AppPrivilege.statusActive.Complete, 
			2 => AppPrivilege.statusActive.Incomplete, 
			_ => AppPrivilege.statusActive.All, 
		};
		AppPrivilege.filterDate filterDate = Convert.ToInt32(beiFilterMonth.EditValue) switch
		{
			1 => AppPrivilege.filterDate.ThreeMonth, 
			2 => AppPrivilege.filterDate.SixMonth, 
			3 => AppPrivilege.filterDate.OneYear, 
			_ => AppPrivilege.filterDate.All, 
		};
		int focusedRowHandle = gridView1.FocusedRowHandle;
		DataTable dataBooking = DataSQL.GetDataBooking(statusActive, filterDate);
		BindData(gridControl1, dataBooking);
		gridView1.BestFitColumns();
		Util.SetFocusRow(gridView1, focusedRowHandle);
		CloseWaitForm();
	}

	private void btnFind_ItemClick(object sender, ItemClickEventArgs e)
	{
		if (gridView1.IsFindPanelVisible)
		{
			gridView1.HideFindPanel();
		}
		else
		{
			gridView1.ShowFindPanel();
		}
	}

	private void btnRefresh_ItemClick(object sender, ItemClickEventArgs e)
	{
		ShowData();
	}

	private void BindData(GridControl gridControl, DataTable dt)
	{
		gridControl.BeginUpdate();
		gridControl.DataSource = null;
		gridControl.DataSource = dt;
		gridControl.EndUpdate();
	}

	private void btnAdd_ItemClick(object sender, ItemClickEventArgs e)
	{
		FrmBookDetail frmBookDetail = new FrmBookDetail(Convert.ToInt32(lookupEditStatusItem.EditValue) switch
		{
			1 => AppPrivilege.statusActive.Complete, 
			2 => AppPrivilege.statusActive.Incomplete, 
			_ => AppPrivilege.statusActive.All, 
		});
		frmBookDetail.isEdit = false;
		frmBookDetail.ShowInTaskbar = false;
		DialogResult dialogResult = frmBookDetail.ShowDialog();
		if (dialogResult == DialogResult.OK || dialogResult == DialogResult.Cancel)
		{
			ShowData();
		}
	}

	private void btnEdit_ItemClick(object sender, ItemClickEventArgs e)
	{
		Edit();
	}

	private void Edit()
	{
		if (gridView1.DataRowCount != 0)
		{
			AppPrivilege.statusActive statusActive = Convert.ToInt32(lookupEditStatusItem.EditValue) switch
			{
				1 => AppPrivilege.statusActive.Complete, 
				2 => AppPrivilege.statusActive.Incomplete, 
				_ => AppPrivilege.statusActive.All, 
			};
			int focusedRowHandle = gridView1.FocusedRowHandle;
			DataRow dataRow = gridView1.GetDataRow(focusedRowHandle);
			FrmBookDetail frmBookDetail = new FrmBookDetail(statusActive, dataRow, "Edit");
			frmBookDetail.ShowInTaskbar = false;
			frmBookDetail.isEdit = true;
			DialogResult dialogResult = frmBookDetail.ShowDialog();
			if (dialogResult == DialogResult.OK || dialogResult == DialogResult.Cancel)
			{
				ShowData();
				Util.SetFocusRow(gridView1, focusedRowHandle);
			}
		}
	}

	private void btnDelete_ItemClick(object sender, ItemClickEventArgs e)
	{
		if (gridView1.DataRowCount != 0)
		{
			AppPrivilege.statusActive statusActive = Convert.ToInt32(lookupEditStatusItem.EditValue) switch
			{
				1 => AppPrivilege.statusActive.Complete, 
				2 => AppPrivilege.statusActive.Incomplete, 
				_ => AppPrivilege.statusActive.All, 
			};
			DataRow dataRow = gridView1.GetDataRow(gridView1.FocusedRowHandle);
			FrmBookDetail frmBookDetail = new FrmBookDetail(statusActive, dataRow, "Delete");
			frmBookDetail.ShowInTaskbar = false;
			frmBookDetail.isEdit = true;
			DialogResult dialogResult = frmBookDetail.ShowDialog();
			if (dialogResult == DialogResult.OK)
			{
				ShowData();
			}
		}
	}

	private void btnPrint_ItemClick(object sender, ItemClickEventArgs e)
	{
		if (gridView1.RowCount == 0)
		{
			return;
		}
		DataRow dataRow = gridView1.GetDataRow(gridView1.FocusedRowHandle);
		string text = dataRow["DocNo"].ToString();
		string recordSelectionFormula = "{BookingInfor.DocNo}  = '" + text + "' ";
		try
		{
			FrmPrint frmPrint = new FrmPrint();
			frmPrint.printAll = true;
			frmPrint.printImmediately = false;
			frmPrint.AddReport("BookingInfor.rpt", recordSelectionFormula, 1);
			frmPrint.ShowInTaskbar = false;
			DialogResult dialogResult = frmPrint.ShowDialog();
			if (dialogResult != DialogResult.OK && dialogResult != DialogResult.Cancel)
			{
			}
		}
		catch (Exception ex)
		{
			MessageBox.Show(ex.ToString());
		}
	}

	private void btnImportFromExcel_ItemClick(object sender, ItemClickEventArgs e)
	{
		FrmImportExcel frmImportExcel = new FrmImportExcel();
		frmImportExcel.ShowInTaskbar = false;
		DialogResult dialogResult = frmImportExcel.ShowDialog();
		if (dialogResult == DialogResult.OK || dialogResult == DialogResult.Cancel)
		{
			ShowData();
		}
	}

	private void lookupEditStatusItem_EditValueChanged(object sender, EventArgs e)
	{
		ShowData();
	}

	private void gridView1_DoubleClick(object sender, EventArgs e)
	{
		Edit();
	}

	private void btnImportExcelSeparate_ItemClick(object sender, ItemClickEventArgs e)
	{
		FrmImportExcelSeparate frmImportExcelSeparate = new FrmImportExcelSeparate();
		frmImportExcelSeparate.ShowInTaskbar = false;
		DialogResult dialogResult = frmImportExcelSeparate.ShowDialog();
		if (dialogResult == DialogResult.OK || dialogResult == DialogResult.Cancel)
		{
			ShowData();
		}
	}

	private void btnDeleteImport_ItemClick(object sender, ItemClickEventArgs e)
	{
		FrmDeleteFromImport frmDeleteFromImport = new FrmDeleteFromImport();
		frmDeleteFromImport.ShowInTaskbar = false;
		DialogResult dialogResult = frmDeleteFromImport.ShowDialog();
		if (dialogResult == DialogResult.OK || dialogResult == DialogResult.Cancel)
		{
			ShowData();
		}
	}

	private void btnAgentMaching_ItemClick(object sender, ItemClickEventArgs e)
	{
		FrmMachingAgent frmMachingAgent = new FrmMachingAgent();
		frmMachingAgent.ShowInTaskbar = false;
		DialogResult dialogResult = frmMachingAgent.ShowDialog();
		if (dialogResult != DialogResult.OK && dialogResult != DialogResult.Cancel)
		{
		}
	}

	private void btnCreateBonusList_ItemClick(object sender, ItemClickEventArgs e)
	{
		FrmCreateBonusList frmCreateBonusList = new FrmCreateBonusList();
		frmCreateBonusList.ShowInTaskbar = false;
		DialogResult dialogResult = frmCreateBonusList.ShowDialog();
		if (dialogResult == DialogResult.OK || dialogResult == DialogResult.Cancel)
		{
			ShowData();
		}
	}

	private void btnAppSetting_ItemClick(object sender, ItemClickEventArgs e)
	{
		if (!AuthenUserSetup())
		{
			XtraMessageBox.Show("Wrong Password");
			return;
		}
		FrmSetupAppConfig frmSetupAppConfig = new FrmSetupAppConfig();
		frmSetupAppConfig.ShowInTaskbar = false;
		DialogResult dialogResult = frmSetupAppConfig.ShowDialog();
		if (dialogResult != DialogResult.OK && dialogResult != DialogResult.Cancel)
		{
		}
	}

	private bool AuthenUserSetup()
	{
		bool result = false;
		string text = Util.ShowInputBoxPassword("Input Password", "Password");
		if (text == "adam4565")
		{
			result = true;
		}
		return result;
	}

	private void btnCreateToBonus_ItemClick(object sender, ItemClickEventArgs e)
	{
		FrmCreateBonus frmCreateBonus = new FrmCreateBonus();
		frmCreateBonus.ShowInTaskbar = false;
		DialogResult dialogResult = frmCreateBonus.ShowDialog();
		if (dialogResult == DialogResult.OK || dialogResult == DialogResult.Cancel)
		{
			ShowData();
		}
	}

	private void beiFilterMonth_EditValueChanged(object sender, EventArgs e)
	{
		ShowData();
	}

	protected override void Dispose(bool disposing)
	{
		if (disposing && components != null)
		{
			components.Dispose();
		}
		base.Dispose(disposing);
	}

	private void InitializeComponent()
	{
		this.components = new System.ComponentModel.Container();
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(BookingInfor.MainForm));
		this.splashScreenManager1 = new DevExpress.XtraSplashScreen.SplashScreenManager(this, typeof(BookingInfor.WaitForm1), true, true);
		this.ribbon = new DevExpress.XtraBars.Ribbon.RibbonControl();
		this.btnExit = new DevExpress.XtraBars.BarButtonItem();
		this.skinRibbonGalleryBarItem1 = new DevExpress.XtraBars.SkinRibbonGalleryBarItem();
		this.btnFind = new DevExpress.XtraBars.BarButtonItem();
		this.btnRefresh = new DevExpress.XtraBars.BarButtonItem();
		this.btnAdd = new DevExpress.XtraBars.BarButtonItem();
		this.btnEdit = new DevExpress.XtraBars.BarButtonItem();
		this.btnDelete = new DevExpress.XtraBars.BarButtonItem();
		this.lblStatus = new DevExpress.XtraBars.BarStaticItem();
		this.lblStatus01 = new DevExpress.XtraBars.BarStaticItem();
		this.lblAppVersion = new DevExpress.XtraBars.BarStaticItem();
		this.btnPrint = new DevExpress.XtraBars.BarButtonItem();
		this.btnImportFromExcel = new DevExpress.XtraBars.BarButtonItem();
		this.lookupEditStatusItem = new DevExpress.XtraBars.BarEditItem();
		this.repositoryItemLookUpEdit1 = new DevExpress.XtraEditors.Repository.RepositoryItemLookUpEdit();
		this.btnDeleteImport = new DevExpress.XtraBars.BarButtonItem();
		this.btnImportExcelSeparate = new DevExpress.XtraBars.BarButtonItem();
		this.btnAgentMaching = new DevExpress.XtraBars.BarButtonItem();
		this.btnCreateBonusList = new DevExpress.XtraBars.BarButtonItem();
		this.btnAppSetting = new DevExpress.XtraBars.BarButtonItem();
		this.btnCreateToBonus = new DevExpress.XtraBars.BarButtonItem();
		this.beiFilterMonth = new DevExpress.XtraBars.BarEditItem();
		this.repoLueFilterMonth = new DevExpress.XtraEditors.Repository.RepositoryItemLookUpEdit();
		this.ribbonPage1 = new DevExpress.XtraBars.Ribbon.RibbonPage();
		this.ribbonPageGroup4 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPageGroup5 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPageGroup1 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPageGroup6 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPageGroup8 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPageGroup7 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPageGroup9 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPageGroup11 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPageGroup13 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPageGroup2 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPageGroup3 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPageGroup12 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPage2 = new DevExpress.XtraBars.Ribbon.RibbonPage();
		this.ribbonPageGroup10 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.repoCmbFilterMonth = new DevExpress.XtraEditors.Repository.RepositoryItemComboBox();
		this.ribbonStatusBar = new DevExpress.XtraBars.Ribbon.RibbonStatusBar();
		this.panelControl1 = new DevExpress.XtraEditors.PanelControl();
		this.defaultLookAndFeel1 = new DevExpress.LookAndFeel.DefaultLookAndFeel(this.components);
		this.gridControl1 = new DevExpress.XtraGrid.GridControl();
		this.gridView1 = new DevExpress.XtraGrid.Views.Grid.GridView();
		this.gridColumn1 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn2 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn3 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn4 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn5 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn9 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn20 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn21 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn22 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn6 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn7 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn8 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn25 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn10 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn11 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn26 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn29 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn12 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn13 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn14 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn15 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn16 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn17 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn18 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn19 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn23 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn24 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn28 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.repositoryItemImageComboBox2 = new DevExpress.XtraEditors.Repository.RepositoryItemImageComboBox();
		this.image16x16 = new DevExpress.Utils.ImageCollection(this.components);
		this.gridColumn27 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.repositoryItemImageComboBox1 = new DevExpress.XtraEditors.Repository.RepositoryItemImageComboBox();
		((System.ComponentModel.ISupportInitialize)this.ribbon).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemLookUpEdit1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.repoLueFilterMonth).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.repoCmbFilterMonth).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.panelControl1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.gridControl1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemImageComboBox2).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.image16x16).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemImageComboBox1).BeginInit();
		base.SuspendLayout();
		this.splashScreenManager1.ClosingDelay = 500;
		this.ribbon.ExpandCollapseItem.Id = 0;
		this.ribbon.Items.AddRange(new DevExpress.XtraBars.BarItem[21]
		{
			this.ribbon.ExpandCollapseItem,
			this.btnExit,
			this.skinRibbonGalleryBarItem1,
			this.btnFind,
			this.btnRefresh,
			this.btnAdd,
			this.btnEdit,
			this.btnDelete,
			this.lblStatus,
			this.lblStatus01,
			this.lblAppVersion,
			this.btnPrint,
			this.btnImportFromExcel,
			this.lookupEditStatusItem,
			this.btnDeleteImport,
			this.btnImportExcelSeparate,
			this.btnAgentMaching,
			this.btnCreateBonusList,
			this.btnAppSetting,
			this.btnCreateToBonus,
			this.beiFilterMonth
		});
		this.ribbon.Location = new System.Drawing.Point(0, 0);
		this.ribbon.MaxItemId = 22;
		this.ribbon.Name = "ribbon";
		this.ribbon.Pages.AddRange(new DevExpress.XtraBars.Ribbon.RibbonPage[2] { this.ribbonPage1, this.ribbonPage2 });
		this.ribbon.RepositoryItems.AddRange(new DevExpress.XtraEditors.Repository.RepositoryItem[3] { this.repositoryItemLookUpEdit1, this.repoCmbFilterMonth, this.repoLueFilterMonth });
		this.ribbon.ShowApplicationButton = DevExpress.Utils.DefaultBoolean.False;
		this.ribbon.ShowToolbarCustomizeItem = false;
		this.ribbon.Size = new System.Drawing.Size(1132, 147);
		this.ribbon.StatusBar = this.ribbonStatusBar;
		this.ribbon.Toolbar.ShowCustomizeItem = false;
		this.btnExit.Caption = "Exit";
		this.btnExit.Glyph = (System.Drawing.Image)resources.GetObject("btnExit.Glyph");
		this.btnExit.Id = 1;
		this.btnExit.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnExit.LargeGlyph");
		this.btnExit.Name = "btnExit";
		this.btnExit.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnExit_ItemClick);
		this.skinRibbonGalleryBarItem1.Caption = "skinRibbonGalleryBarItem1";
		this.skinRibbonGalleryBarItem1.Id = 2;
		this.skinRibbonGalleryBarItem1.Name = "skinRibbonGalleryBarItem1";
		this.btnFind.Caption = "Find";
		this.btnFind.Glyph = (System.Drawing.Image)resources.GetObject("btnFind.Glyph");
		this.btnFind.Id = 3;
		this.btnFind.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnFind.LargeGlyph");
		this.btnFind.Name = "btnFind";
		this.btnFind.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnFind_ItemClick);
		this.btnRefresh.Caption = "Refresh";
		this.btnRefresh.Glyph = (System.Drawing.Image)resources.GetObject("btnRefresh.Glyph");
		this.btnRefresh.Id = 4;
		this.btnRefresh.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnRefresh.LargeGlyph");
		this.btnRefresh.Name = "btnRefresh";
		this.btnRefresh.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnRefresh_ItemClick);
		this.btnAdd.Caption = "Add";
		this.btnAdd.Glyph = (System.Drawing.Image)resources.GetObject("btnAdd.Glyph");
		this.btnAdd.Id = 5;
		this.btnAdd.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnAdd.LargeGlyph");
		this.btnAdd.Name = "btnAdd";
		this.btnAdd.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnAdd_ItemClick);
		this.btnEdit.Caption = "Edit";
		this.btnEdit.Glyph = (System.Drawing.Image)resources.GetObject("btnEdit.Glyph");
		this.btnEdit.Id = 6;
		this.btnEdit.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnEdit.LargeGlyph");
		this.btnEdit.Name = "btnEdit";
		this.btnEdit.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnEdit_ItemClick);
		this.btnDelete.Caption = "Delete";
		this.btnDelete.Glyph = (System.Drawing.Image)resources.GetObject("btnDelete.Glyph");
		this.btnDelete.Id = 7;
		this.btnDelete.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnDelete.LargeGlyph");
		this.btnDelete.Name = "btnDelete";
		this.btnDelete.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnDelete_ItemClick);
		this.lblStatus.Caption = "lblStatus";
		this.lblStatus.Id = 8;
		this.lblStatus.Name = "lblStatus";
		this.lblStatus.TextAlignment = System.Drawing.StringAlignment.Near;
		this.lblStatus01.Alignment = DevExpress.XtraBars.BarItemLinkAlignment.Right;
		this.lblStatus01.Caption = "lblStatus01";
		this.lblStatus01.Id = 9;
		this.lblStatus01.Name = "lblStatus01";
		this.lblStatus01.TextAlignment = System.Drawing.StringAlignment.Near;
		this.lblAppVersion.Alignment = DevExpress.XtraBars.BarItemLinkAlignment.Right;
		this.lblAppVersion.Caption = "lblAppVersion";
		this.lblAppVersion.Id = 10;
		this.lblAppVersion.Name = "lblAppVersion";
		this.lblAppVersion.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnPrint.Caption = "Print";
		this.btnPrint.Glyph = (System.Drawing.Image)resources.GetObject("btnPrint.Glyph");
		this.btnPrint.Id = 11;
		this.btnPrint.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnPrint.LargeGlyph");
		this.btnPrint.Name = "btnPrint";
		this.btnPrint.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnPrint_ItemClick);
		this.btnImportFromExcel.Caption = "Import From Excel";
		this.btnImportFromExcel.Glyph = (System.Drawing.Image)resources.GetObject("btnImportFromExcel.Glyph");
		this.btnImportFromExcel.Id = 12;
		this.btnImportFromExcel.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnImportFromExcel.LargeGlyph");
		this.btnImportFromExcel.Name = "btnImportFromExcel";
		this.btnImportFromExcel.Visibility = DevExpress.XtraBars.BarItemVisibility.Never;
		this.btnImportFromExcel.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnImportFromExcel_ItemClick);
		this.lookupEditStatusItem.Edit = this.repositoryItemLookUpEdit1;
		this.lookupEditStatusItem.EditWidth = 100;
		this.lookupEditStatusItem.Id = 13;
		this.lookupEditStatusItem.Name = "lookupEditStatusItem";
		this.lookupEditStatusItem.EditValueChanged += new System.EventHandler(lookupEditStatusItem_EditValueChanged);
		this.repositoryItemLookUpEdit1.AutoHeight = false;
		this.repositoryItemLookUpEdit1.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.repositoryItemLookUpEdit1.Name = "repositoryItemLookUpEdit1";
		this.btnDeleteImport.Caption = "Delete From Import";
		this.btnDeleteImport.Glyph = (System.Drawing.Image)resources.GetObject("btnDeleteImport.Glyph");
		this.btnDeleteImport.Id = 14;
		this.btnDeleteImport.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnDeleteImport.LargeGlyph");
		this.btnDeleteImport.Name = "btnDeleteImport";
		this.btnDeleteImport.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnDeleteImport_ItemClick);
		this.btnImportExcelSeparate.Caption = "Import File Separate";
		this.btnImportExcelSeparate.Glyph = (System.Drawing.Image)resources.GetObject("btnImportExcelSeparate.Glyph");
		this.btnImportExcelSeparate.Id = 15;
		this.btnImportExcelSeparate.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnImportExcelSeparate.LargeGlyph");
		this.btnImportExcelSeparate.Name = "btnImportExcelSeparate";
		this.btnImportExcelSeparate.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnImportExcelSeparate_ItemClick);
		this.btnAgentMaching.Caption = "Agent Matching";
		this.btnAgentMaching.Glyph = (System.Drawing.Image)resources.GetObject("btnAgentMaching.Glyph");
		this.btnAgentMaching.Id = 16;
		this.btnAgentMaching.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnAgentMaching.LargeGlyph");
		this.btnAgentMaching.Name = "btnAgentMaching";
		this.btnAgentMaching.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnAgentMaching_ItemClick);
		this.btnCreateBonusList.Caption = "Create Bonus List";
		this.btnCreateBonusList.Glyph = (System.Drawing.Image)resources.GetObject("btnCreateBonusList.Glyph");
		this.btnCreateBonusList.Id = 17;
		this.btnCreateBonusList.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnCreateBonusList.LargeGlyph");
		this.btnCreateBonusList.Name = "btnCreateBonusList";
		this.btnCreateBonusList.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnCreateBonusList_ItemClick);
		this.btnAppSetting.Caption = "Setting Program";
		this.btnAppSetting.Glyph = (System.Drawing.Image)resources.GetObject("btnAppSetting.Glyph");
		this.btnAppSetting.Id = 18;
		this.btnAppSetting.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnAppSetting.LargeGlyph");
		this.btnAppSetting.Name = "btnAppSetting";
		this.btnAppSetting.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnAppSetting_ItemClick);
		this.btnCreateToBonus.Caption = "Create to Bonus";
		this.btnCreateToBonus.Glyph = (System.Drawing.Image)resources.GetObject("btnCreateToBonus.Glyph");
		this.btnCreateToBonus.Id = 19;
		this.btnCreateToBonus.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnCreateToBonus.LargeGlyph");
		this.btnCreateToBonus.Name = "btnCreateToBonus";
		this.btnCreateToBonus.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnCreateToBonus_ItemClick);
		this.beiFilterMonth.Caption = "Filter";
		this.beiFilterMonth.Edit = this.repoLueFilterMonth;
		this.beiFilterMonth.EditWidth = 90;
		this.beiFilterMonth.Id = 21;
		this.beiFilterMonth.Name = "beiFilterMonth";
		this.beiFilterMonth.EditValueChanged += new System.EventHandler(beiFilterMonth_EditValueChanged);
		this.repoLueFilterMonth.AutoHeight = false;
		this.repoLueFilterMonth.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.repoLueFilterMonth.Name = "repoLueFilterMonth";
		this.ribbonPage1.Groups.AddRange(new DevExpress.XtraBars.Ribbon.RibbonPageGroup[12]
		{
			this.ribbonPageGroup4, this.ribbonPageGroup5, this.ribbonPageGroup1, this.ribbonPageGroup6, this.ribbonPageGroup8, this.ribbonPageGroup7, this.ribbonPageGroup9, this.ribbonPageGroup11, this.ribbonPageGroup13, this.ribbonPageGroup2,
			this.ribbonPageGroup3, this.ribbonPageGroup12
		});
		this.ribbonPage1.Name = "ribbonPage1";
		this.ribbonPage1.Text = "Home";
		this.ribbonPageGroup4.ItemLinks.Add(this.btnAdd);
		this.ribbonPageGroup4.ItemLinks.Add(this.btnEdit);
		this.ribbonPageGroup4.ItemLinks.Add(this.btnDelete);
		this.ribbonPageGroup4.Name = "ribbonPageGroup4";
		this.ribbonPageGroup4.ShowCaptionButton = false;
		this.ribbonPageGroup4.Text = "Editor";
		this.ribbonPageGroup5.ItemLinks.Add(this.btnRefresh);
		this.ribbonPageGroup5.Name = "ribbonPageGroup5";
		this.ribbonPageGroup5.ShowCaptionButton = false;
		this.ribbonPageGroup5.Text = "Refresh";
		this.ribbonPageGroup1.ItemLinks.Add(this.btnFind);
		this.ribbonPageGroup1.Name = "ribbonPageGroup1";
		this.ribbonPageGroup1.ShowCaptionButton = false;
		this.ribbonPageGroup1.Text = "Find";
		this.ribbonPageGroup6.ItemLinks.Add(this.btnPrint);
		this.ribbonPageGroup6.Name = "ribbonPageGroup6";
		this.ribbonPageGroup6.ShowCaptionButton = false;
		this.ribbonPageGroup6.Text = "Print";
		this.ribbonPageGroup8.ItemLinks.Add(this.lookupEditStatusItem);
		this.ribbonPageGroup8.Name = "ribbonPageGroup8";
		this.ribbonPageGroup8.ShowCaptionButton = false;
		this.ribbonPageGroup8.Text = "Status";
		this.ribbonPageGroup7.ItemLinks.Add(this.btnImportFromExcel);
		this.ribbonPageGroup7.ItemLinks.Add(this.btnImportExcelSeparate);
		this.ribbonPageGroup7.ItemLinks.Add(this.btnDeleteImport);
		this.ribbonPageGroup7.Name = "ribbonPageGroup7";
		this.ribbonPageGroup7.ShowCaptionButton = false;
		this.ribbonPageGroup7.Text = "Import";
		this.ribbonPageGroup9.ItemLinks.Add(this.btnAgentMaching);
		this.ribbonPageGroup9.Name = "ribbonPageGroup9";
		this.ribbonPageGroup9.ShowCaptionButton = false;
		this.ribbonPageGroup9.Text = "Agent Matching";
		this.ribbonPageGroup11.ItemLinks.Add(this.btnCreateToBonus);
		this.ribbonPageGroup11.Name = "ribbonPageGroup11";
		this.ribbonPageGroup11.ShowCaptionButton = false;
		this.ribbonPageGroup11.Text = "Create Bonus List";
		this.ribbonPageGroup13.ItemLinks.Add(this.beiFilterMonth);
		this.ribbonPageGroup13.Name = "ribbonPageGroup13";
		this.ribbonPageGroup13.ShowCaptionButton = false;
		this.ribbonPageGroup13.Text = "Filter Date";
		this.ribbonPageGroup2.ItemLinks.Add(this.skinRibbonGalleryBarItem1);
		this.ribbonPageGroup2.Name = "ribbonPageGroup2";
		this.ribbonPageGroup2.ShowCaptionButton = false;
		this.ribbonPageGroup2.Text = "Gallery";
		this.ribbonPageGroup3.ItemLinks.Add(this.btnExit);
		this.ribbonPageGroup3.Name = "ribbonPageGroup3";
		this.ribbonPageGroup3.ShowCaptionButton = false;
		this.ribbonPageGroup3.Text = "Exit";
		this.ribbonPageGroup12.ItemLinks.Add(this.btnCreateBonusList);
		this.ribbonPageGroup12.Name = "ribbonPageGroup12";
		this.ribbonPageGroup12.Text = "Not used";
		this.ribbonPageGroup12.Visible = false;
		this.ribbonPage2.Groups.AddRange(new DevExpress.XtraBars.Ribbon.RibbonPageGroup[1] { this.ribbonPageGroup10 });
		this.ribbonPage2.Name = "ribbonPage2";
		this.ribbonPage2.Text = "admin";
		this.ribbonPageGroup10.ItemLinks.Add(this.btnAppSetting);
		this.ribbonPageGroup10.Name = "ribbonPageGroup10";
		this.ribbonPageGroup10.ShowCaptionButton = false;
		this.ribbonPageGroup10.Text = "Setting";
		this.repoCmbFilterMonth.AutoHeight = false;
		this.repoCmbFilterMonth.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.repoCmbFilterMonth.Name = "repoCmbFilterMonth";
		this.ribbonStatusBar.ItemLinks.Add(this.lblStatus);
		this.ribbonStatusBar.ItemLinks.Add(this.lblStatus01);
		this.ribbonStatusBar.ItemLinks.Add(this.lblAppVersion);
		this.ribbonStatusBar.Location = new System.Drawing.Point(0, 492);
		this.ribbonStatusBar.Name = "ribbonStatusBar";
		this.ribbonStatusBar.Ribbon = this.ribbon;
		this.ribbonStatusBar.Size = new System.Drawing.Size(1132, 23);
		this.panelControl1.Dock = System.Windows.Forms.DockStyle.Top;
		this.panelControl1.Location = new System.Drawing.Point(0, 147);
		this.panelControl1.Name = "panelControl1";
		this.panelControl1.Size = new System.Drawing.Size(1132, 15);
		this.panelControl1.TabIndex = 5;
		this.defaultLookAndFeel1.LookAndFeel.SkinName = "Visual Studio 2013 Blue";
		this.gridControl1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.gridControl1.Location = new System.Drawing.Point(0, 162);
		this.gridControl1.MainView = this.gridView1;
		this.gridControl1.MenuManager = this.ribbon;
		this.gridControl1.Name = "gridControl1";
		this.gridControl1.RepositoryItems.AddRange(new DevExpress.XtraEditors.Repository.RepositoryItem[2] { this.repositoryItemImageComboBox1, this.repositoryItemImageComboBox2 });
		this.gridControl1.Size = new System.Drawing.Size(1132, 330);
		this.gridControl1.TabIndex = 12;
		this.gridControl1.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[1] { this.gridView1 });
		this.gridView1.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[29]
		{
			this.gridColumn1, this.gridColumn2, this.gridColumn3, this.gridColumn4, this.gridColumn5, this.gridColumn9, this.gridColumn20, this.gridColumn21, this.gridColumn22, this.gridColumn6,
			this.gridColumn7, this.gridColumn8, this.gridColumn25, this.gridColumn10, this.gridColumn11, this.gridColumn26, this.gridColumn29, this.gridColumn12, this.gridColumn13, this.gridColumn14,
			this.gridColumn15, this.gridColumn16, this.gridColumn17, this.gridColumn18, this.gridColumn19, this.gridColumn23, this.gridColumn24, this.gridColumn28, this.gridColumn27
		});
		this.gridView1.GridControl = this.gridControl1;
		this.gridView1.Name = "gridView1";
		this.gridView1.OptionsBehavior.Editable = false;
		this.gridView1.OptionsCustomization.AllowColumnMoving = false;
		this.gridView1.OptionsView.EnableAppearanceEvenRow = true;
		this.gridView1.OptionsView.ShowGroupPanel = false;
		this.gridView1.DoubleClick += new System.EventHandler(gridView1_DoubleClick);
		this.gridColumn1.Caption = "Doc Date";
		this.gridColumn1.FieldName = "DocDate";
		this.gridColumn1.Name = "gridColumn1";
		this.gridColumn1.Visible = true;
		this.gridColumn1.VisibleIndex = 0;
		this.gridColumn1.Width = 49;
		this.gridColumn2.Caption = "DocNo";
		this.gridColumn2.FieldName = "DocNo";
		this.gridColumn2.Name = "gridColumn2";
		this.gridColumn3.Caption = "Doc Time";
		this.gridColumn3.FieldName = "DocTime";
		this.gridColumn3.Name = "gridColumn3";
		this.gridColumn3.Visible = true;
		this.gridColumn3.VisibleIndex = 1;
		this.gridColumn3.Width = 49;
		this.gridColumn4.Caption = "Agent Code";
		this.gridColumn4.FieldName = "AgentCode";
		this.gridColumn4.Name = "gridColumn4";
		this.gridColumn4.Visible = true;
		this.gridColumn4.VisibleIndex = 2;
		this.gridColumn4.Width = 49;
		this.gridColumn5.Caption = "Agent Name";
		this.gridColumn5.FieldName = "AgentName";
		this.gridColumn5.Name = "gridColumn5";
		this.gridColumn5.Visible = true;
		this.gridColumn5.VisibleIndex = 3;
		this.gridColumn5.Width = 49;
		this.gridColumn9.Caption = "PartyCode";
		this.gridColumn9.FieldName = "PartyCode";
		this.gridColumn9.Name = "gridColumn9";
		this.gridColumn9.Visible = true;
		this.gridColumn9.VisibleIndex = 4;
		this.gridColumn9.Width = 49;
		this.gridColumn20.Caption = "Nation";
		this.gridColumn20.FieldName = "NationCode";
		this.gridColumn20.Name = "gridColumn20";
		this.gridColumn20.Visible = true;
		this.gridColumn20.VisibleIndex = 5;
		this.gridColumn20.Width = 49;
		this.gridColumn21.Caption = "Arrive Date";
		this.gridColumn21.FieldName = "ArriveDate";
		this.gridColumn21.Name = "gridColumn21";
		this.gridColumn21.Visible = true;
		this.gridColumn21.VisibleIndex = 6;
		this.gridColumn21.Width = 49;
		this.gridColumn22.Caption = "Dapart Date";
		this.gridColumn22.FieldName = "DepartureDate";
		this.gridColumn22.Name = "gridColumn22";
		this.gridColumn22.Visible = true;
		this.gridColumn22.VisibleIndex = 7;
		this.gridColumn22.Width = 49;
		this.gridColumn6.Caption = "Guide Code";
		this.gridColumn6.FieldName = "GuideCode";
		this.gridColumn6.Name = "gridColumn6";
		this.gridColumn6.Visible = true;
		this.gridColumn6.VisibleIndex = 8;
		this.gridColumn6.Width = 49;
		this.gridColumn7.Caption = "Guide Name";
		this.gridColumn7.FieldName = "GuideName";
		this.gridColumn7.Name = "gridColumn7";
		this.gridColumn7.OptionsColumn.FixedWidth = true;
		this.gridColumn7.Visible = true;
		this.gridColumn7.VisibleIndex = 9;
		this.gridColumn7.Width = 100;
		this.gridColumn8.Caption = "Tel Guide";
		this.gridColumn8.FieldName = "TelGuide";
		this.gridColumn8.Name = "gridColumn8";
		this.gridColumn8.Visible = true;
		this.gridColumn8.VisibleIndex = 10;
		this.gridColumn8.Width = 44;
		this.gridColumn25.Caption = "Tel Driver";
		this.gridColumn25.FieldName = "Tel_Driver";
		this.gridColumn25.Name = "gridColumn25";
		this.gridColumn25.Visible = true;
		this.gridColumn25.VisibleIndex = 11;
		this.gridColumn25.Width = 44;
		this.gridColumn10.Caption = "Pax";
		this.gridColumn10.FieldName = "Pax";
		this.gridColumn10.Name = "gridColumn10";
		this.gridColumn10.Visible = true;
		this.gridColumn10.VisibleIndex = 12;
		this.gridColumn10.Width = 44;
		this.gridColumn11.Caption = "CarCode";
		this.gridColumn11.FieldName = "CarCode";
		this.gridColumn11.Name = "gridColumn11";
		this.gridColumn11.Visible = true;
		this.gridColumn11.VisibleIndex = 13;
		this.gridColumn11.Width = 44;
		this.gridColumn26.Caption = "Shop";
		this.gridColumn26.FieldName = "FirstShop";
		this.gridColumn26.Name = "gridColumn26";
		this.gridColumn26.Visible = true;
		this.gridColumn26.VisibleIndex = 14;
		this.gridColumn26.Width = 44;
		this.gridColumn29.Caption = "Book Remark";
		this.gridColumn29.FieldName = "Remark_Book";
		this.gridColumn29.Name = "gridColumn29";
		this.gridColumn29.OptionsColumn.FixedWidth = true;
		this.gridColumn29.Visible = true;
		this.gridColumn29.VisibleIndex = 15;
		this.gridColumn29.Width = 110;
		this.gridColumn12.Caption = "DateBookJW";
		this.gridColumn12.FieldName = "DateBookJW";
		this.gridColumn12.Name = "gridColumn12";
		this.gridColumn12.Visible = true;
		this.gridColumn12.VisibleIndex = 16;
		this.gridColumn12.Width = 37;
		this.gridColumn13.Caption = "TimeBookJW";
		this.gridColumn13.FieldName = "TimeBookJW";
		this.gridColumn13.Name = "gridColumn13";
		this.gridColumn13.Visible = true;
		this.gridColumn13.VisibleIndex = 17;
		this.gridColumn13.Width = 37;
		this.gridColumn14.Caption = "DateBookBKF";
		this.gridColumn14.FieldName = "DateBookBKF";
		this.gridColumn14.Name = "gridColumn14";
		this.gridColumn15.Caption = "TimeBookBKF";
		this.gridColumn15.FieldName = "TimeBookBKF";
		this.gridColumn15.Name = "gridColumn15";
		this.gridColumn16.Caption = "DateBookRTH";
		this.gridColumn16.FieldName = "DateBookRTH";
		this.gridColumn16.Name = "gridColumn16";
		this.gridColumn17.Caption = "TimeBookRTH";
		this.gridColumn17.FieldName = "TimeBookRTH";
		this.gridColumn17.Name = "gridColumn17";
		this.gridColumn18.Caption = "DateBookTRP";
		this.gridColumn18.FieldName = "DateBookTRP";
		this.gridColumn18.Name = "gridColumn18";
		this.gridColumn19.Caption = "TimeBookTRP";
		this.gridColumn19.FieldName = "TimeBookTRP";
		this.gridColumn19.Name = "gridColumn19";
		this.gridColumn23.Caption = "PTY Start Date";
		this.gridColumn23.FieldName = "PTYDateStart";
		this.gridColumn23.Name = "gridColumn23";
		this.gridColumn23.Visible = true;
		this.gridColumn23.VisibleIndex = 18;
		this.gridColumn23.Width = 37;
		this.gridColumn24.Caption = "PTY End Date";
		this.gridColumn24.FieldName = "PTYDateEnd";
		this.gridColumn24.Name = "gridColumn24";
		this.gridColumn24.Visible = true;
		this.gridColumn24.VisibleIndex = 19;
		this.gridColumn24.Width = 37;
		this.gridColumn28.Caption = "Status";
		this.gridColumn28.ColumnEdit = this.repositoryItemImageComboBox2;
		this.gridColumn28.FieldName = "Complete";
		this.gridColumn28.Name = "gridColumn28";
		this.gridColumn28.Visible = true;
		this.gridColumn28.VisibleIndex = 20;
		this.gridColumn28.Width = 37;
		this.repositoryItemImageComboBox2.AutoHeight = false;
		this.repositoryItemImageComboBox2.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.repositoryItemImageComboBox2.Items.AddRange(new DevExpress.XtraEditors.Controls.ImageComboBoxItem[2]
		{
			new DevExpress.XtraEditors.Controls.ImageComboBoxItem("Not", "N", 1),
			new DevExpress.XtraEditors.Controls.ImageComboBoxItem("Complete", "Y", 0)
		});
		this.repositoryItemImageComboBox2.Name = "repositoryItemImageComboBox2";
		this.repositoryItemImageComboBox2.SmallImages = this.image16x16;
		this.image16x16.ImageStream = (DevExpress.Utils.ImageCollectionStreamer)resources.GetObject("image16x16.ImageStream");
		this.image16x16.InsertGalleryImage("apply_16x16.png", "images/actions/apply_16x16.png", DevExpress.Images.ImageResourceCache.Default.GetImage("images/actions/apply_16x16.png"), 0);
		this.image16x16.Images.SetKeyName(0, "apply_16x16.png");
		this.image16x16.InsertGalleryImage("cancel_16x16.png", "images/actions/cancel_16x16.png", DevExpress.Images.ImageResourceCache.Default.GetImage("images/actions/cancel_16x16.png"), 1);
		this.image16x16.Images.SetKeyName(1, "cancel_16x16.png");
		this.gridColumn27.Caption = "Upload";
		this.gridColumn27.ColumnEdit = this.repositoryItemImageComboBox1;
		this.gridColumn27.FieldName = "Upload";
		this.gridColumn27.Name = "gridColumn27";
		this.gridColumn27.Visible = true;
		this.gridColumn27.VisibleIndex = 21;
		this.gridColumn27.Width = 55;
		this.repositoryItemImageComboBox1.AutoHeight = false;
		this.repositoryItemImageComboBox1.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.repositoryItemImageComboBox1.Items.AddRange(new DevExpress.XtraEditors.Controls.ImageComboBoxItem[2]
		{
			new DevExpress.XtraEditors.Controls.ImageComboBoxItem("Not Up", "N", 1),
			new DevExpress.XtraEditors.Controls.ImageComboBoxItem("Up", "Y", 0)
		});
		this.repositoryItemImageComboBox1.Name = "repositoryItemImageComboBox1";
		this.repositoryItemImageComboBox1.SmallImages = this.image16x16;
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(1132, 515);
		base.Controls.Add(this.gridControl1);
		base.Controls.Add(this.panelControl1);
		base.Controls.Add(this.ribbonStatusBar);
		base.Controls.Add(this.ribbon);
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.Name = "MainForm";
		this.Ribbon = this.ribbon;
		this.StatusBar = this.ribbonStatusBar;
		this.Text = "MainForm";
		base.WindowState = System.Windows.Forms.FormWindowState.Maximized;
		((System.ComponentModel.ISupportInitialize)this.ribbon).EndInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemLookUpEdit1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.repoLueFilterMonth).EndInit();
		((System.ComponentModel.ISupportInitialize)this.repoCmbFilterMonth).EndInit();
		((System.ComponentModel.ISupportInitialize)this.panelControl1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridControl1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemImageComboBox2).EndInit();
		((System.ComponentModel.ISupportInitialize)this.image16x16).EndInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemImageComboBox1).EndInit();
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
