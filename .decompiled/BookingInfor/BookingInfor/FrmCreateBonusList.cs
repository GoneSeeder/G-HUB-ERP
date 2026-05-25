using System;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Windows.Forms;
using BookingInfor.DB;
using DevExpress.Images;
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

public class FrmCreateBonusList : RibbonForm
{
	private int _runningCN = 0;

	private int _runningTW = 800;

	private IContainer components = null;

	private RibbonControl ribbon;

	private RibbonPage ribbonPage1;

	private RibbonPageGroup ribbonPageGroup1;

	private RibbonStatusBar ribbonStatusBar;

	private BarButtonItem btnExit;

	private RibbonPageGroup ribbonPageGroup2;

	private BarButtonItem btnRefresh;

	private BarButtonItem btnGenBonusAuto;

	private BarEditItem beiDate;

	private RepositoryItemDateEdit repositoryItemDateEdit1;

	private RibbonPageGroup ribbonPageGroup4;

	private RibbonPageGroup ribbonPageGroup3;

	private GridControl gridControl1;

	private GridView gridView1;

	private GridColumn gridColumn1;

	private GridColumn gridColumn2;

	private GridColumn gridColumn3;

	private GridColumn gridColumn4;

	private GridColumn gridColumn5;

	private GridColumn gridColumn6;

	private GridColumn gridColumn10;

	private GridColumn gridColumn9;

	private GridColumn gridColumn7;

	private GridColumn gridColumn8;

	private GridColumn gridColumn11;

	private GridColumn gridColumn12;

	private GridColumn gridColumn14;

	private GridColumn gridColumn15;

	private BarButtonItem btnUpLoad;

	private BarButtonItem btnRemoveBonusTemp;

	private BarButtonItem btnGenBonusManual;

	private RibbonPageGroup ribbonPageGroup5;

	private GridColumn gridColumn13;

	private RepositoryItemImageComboBox repositoryItemImageComboBox1;

	private ImageCollection image16x16;

	private SplashScreenManager splashScreenManager1;

	private GridColumn gridColumn16;

	private GridColumn gridColumn17;

	private BarButtonItem btnClearBonusCode;

	private RepositoryItemImageComboBox repositoryItemImageComboBox2;

	public FrmCreateBonusList()
	{
		InitializeComponent();
	}

	private void btnExit_ItemClick(object sender, ItemClickEventArgs e)
	{
		base.DialogResult = DialogResult.Cancel;
	}

	private void ShowData()
	{
		if (beiDate.EditValue == null)
		{
			BindData(gridControl1, null);
			return;
		}
		DateTime shopDate = Convert.ToDateTime(beiDate.EditValue);
		DataTable dataBookingFromBookDateJW = DataSQL.GetDataBookingFromBookDateJW(shopDate);
		BindData(gridControl1, dataBookingFromBookDateJW);
		gridView1.BestFitColumns();
	}

	private void BindData(GridControl gridControl, DataTable dt)
	{
		gridControl.BeginUpdate();
		gridControl.DataSource = null;
		gridControl.DataSource = dt;
		gridControl.EndUpdate();
	}

	private void beiDate_EditValueChanged(object sender, EventArgs e)
	{
		ShowData();
	}

	private void btnRefresh_ItemClick(object sender, ItemClickEventArgs e)
	{
		ShowData();
	}

	private void btnGenBonusAuto_ItemClick(object sender, ItemClickEventArgs e)
	{
		if (gridView1.RowCount == 0)
		{
			XtraMessageBox.Show("No item");
			return;
		}
		if (gridView1.SelectedRowsCount == 0)
		{
			XtraMessageBox.Show("No item selected");
			return;
		}
		DialogResult dialogResult = MessageBox.Show("Do you want to running bonus code automation ?", "Comfirm running auto", MessageBoxButtons.YesNo);
		if (dialogResult != DialogResult.No)
		{
			ShowWaitForm();
			string formatCodeGenBonusCode = AppConfig.FormatCodeGenBonusCode;
			if (formatCodeGenBonusCode == "GEI")
			{
				GEIFormatRunning();
			}
			CloseWaitForm();
			ShowData();
		}
	}

	private void GEIFormatRunning()
	{
		int selectedRowsCount = gridView1.SelectedRowsCount;
		_runningCN = 0;
		_runningTW = 800;
		for (int i = 0; i < gridView1.SelectedRowsCount; i++)
		{
			splashScreenManager1.SetWaitFormCaption("Procesing..." + (i + 1) + " of " + selectedRowsCount);
			DataRow dataRow = gridView1.GetDataRow(gridView1.GetSelectedRows()[i]);
			string text = dataRow["DocNo"].ToString();
			string text2 = dataRow["PartyCode"].ToString();
			string text3 = dataRow["NationCode"].ToString();
			DateTime bonusDate = Convert.ToDateTime(dataRow["DateBookJW"]);
			if (!DataSQL.IsCheckValidateBooking(dataRow))
			{
				MessageBox.Show("Doc no : " + text + " , Party code : " + text2 + " ไม\u0e48สามารถสร\u0e49าง Bonus Code ได\u0e49", "แจ\u0e49งเต\u0e37อน", MessageBoxButtons.OK, MessageBoxIcon.Hand);
				continue;
			}
			string text4 = "";
			text4 = GetBonusCode(text3);
			if (IsHasBonusInBookingOrTableBonus(bonusDate, text4))
			{
				MessageBox.Show("bonus card :" + text4 + " ม\u0e35ซ\u0e49ำใน Booking หร\u0e37อ ม\u0e35การสร\u0e49างใน Bonus จร\u0e34งแล\u0e49ว ", "แจ\u0e49งเต\u0e37อน", MessageBoxButtons.OK, MessageBoxIcon.Hand);
				bool flag = false;
				while (!flag)
				{
					text4 = GetBonusCode(text3);
					if (!IsHasBonusInBookingOrTableBonus(bonusDate, text4))
					{
						flag = true;
					}
				}
			}
			if (IsCheckBonusCodeOverCondition(text3, text4))
			{
				MessageBox.Show("ชนชาต\u0e34 " + text3 + " Bonus Code : " + text4 + " ได\u0e49 Running เก\u0e34นเง\u0e37\u0e48อนไข ", "แจ\u0e49งเต\u0e37อน", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			}
			else
			{
				DataSQL.UpdateBonusRefToBookingInfor(text, text4);
			}
		}
	}

	private bool IsCheckBonusCodeOverCondition(string nationCode, string bonusCode)
	{
		bool result = false;
		int num = Convert.ToInt32(bonusCode);
		if (nationCode == "CN" && num > 8399)
		{
			result = true;
		}
		if (nationCode == "TW" && num > 8899)
		{
			result = true;
		}
		return result;
	}

	private bool IsHasBonusInBookingOrTableBonus(DateTime bonusDate, string bonusCode)
	{
		bool result = false;
		if (DataSQL.IsHasBonusInBooking(bonusDate, bonusCode))
		{
			result = true;
		}
		if (DataSQL.IsHasBonusCodeInTableBonus(bonusDate, bonusCode))
		{
			result = true;
		}
		return result;
	}

	private string GetBonusCode(string nationCode)
	{
		string result = "";
		if (nationCode == "CN")
		{
			_runningCN++;
			result = "8" + _runningCN.ToString("000");
		}
		if (nationCode == "TW")
		{
			_runningTW++;
			result = "8" + _runningTW;
		}
		return result;
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

	private void btnClearBonusCode_ItemClick(object sender, ItemClickEventArgs e)
	{
		if (gridView1.RowCount == 0)
		{
			XtraMessageBox.Show("No item");
			return;
		}
		if (gridView1.SelectedRowsCount == 0)
		{
			XtraMessageBox.Show("No item selected");
			return;
		}
		DialogResult dialogResult = MessageBox.Show("Do you want to clear bonus code ?", "Comfirm clear bonus code", MessageBoxButtons.YesNo);
		if (dialogResult == DialogResult.No)
		{
			return;
		}
		int focusedRowHandle = gridView1.FocusedRowHandle;
		ShowWaitForm();
		int selectedRowsCount = gridView1.SelectedRowsCount;
		for (int i = 0; i < gridView1.SelectedRowsCount; i++)
		{
			splashScreenManager1.SetWaitFormCaption("Procesing..." + (i + 1) + " of " + selectedRowsCount);
			DataRow dataRow = gridView1.GetDataRow(gridView1.GetSelectedRows()[i]);
			string docNo = dataRow["DocNo"].ToString();
			DateTime bonusDate = Convert.ToDateTime(dataRow["DateBookJW"]);
			string text = dataRow["Bonus_Ref"].ToString();
			if (DataSQL.IsHasBonusCodeInTableBonus(bonusDate, text))
			{
				MessageBox.Show("bonus card :" + text + " ม\u0e35การสร\u0e49างใน Bonus จร\u0e34งแล\u0e49ว ไม\u0e48สามารถ Clear ได\u0e49");
			}
			else if (!DataSQL.IsUploadDataToBonusList(docNo))
			{
				DataSQL.ClearBonusRefInBookingInfor(docNo);
			}
		}
		CloseWaitForm();
		XtraMessageBox.Show("Clear Success");
		ShowData();
		Util.SetFocusRow(gridView1, focusedRowHandle);
		gridView1.ClearSelection();
	}

	private void btnGenBonusManual_ItemClick(object sender, ItemClickEventArgs e)
	{
		if (gridView1.RowCount == 0)
		{
			XtraMessageBox.Show("No item");
			return;
		}
		if (gridView1.SelectedRowsCount == 0)
		{
			XtraMessageBox.Show("No item selected");
			return;
		}
		int focusedRowHandle = gridView1.FocusedRowHandle;
		DataRow dataRow = gridView1.GetDataRow(focusedRowHandle);
		string text = dataRow["DocNo"].ToString();
		string text2 = dataRow["PartyCode"].ToString();
		string text3 = dataRow["NationCode"].ToString();
		DateTime bonusDate = Convert.ToDateTime(dataRow["DateBookJW"]);
		if (!DataSQL.IsCheckValidateBooking(dataRow))
		{
			MessageBox.Show("Doc no : " + text + " , Party code : " + text2 + " ไม\u0e48สามารถสร\u0e49าง Bonus Code ได\u0e49", "แจ\u0e49งเต\u0e37อน", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			return;
		}
		string text4 = "";
		text4 = Util.ShowInputBox("กร\u0e38ณาใส\u0e48เลข Bonus Code", "กรอกเลข Bonus Code");
		if (text4.Length != 4)
		{
			MessageBox.Show("bonus code ต\u0e31วอ\u0e31กษรต\u0e49องเป\u0e47น 4 หล\u0e31ก");
			return;
		}
		if (DataSQL.IsHasBonusInBooking(bonusDate, text4))
		{
			MessageBox.Show("bonus card :" + text4 + " ม\u0e35 Bonus ซ\u0e49ำแล\u0e49ว ไม\u0e48สามารถ gen Code ได\u0e49", "แจ\u0e49งเต\u0e37อน", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			return;
		}
		if (DataSQL.IsHasBonusCodeInTableBonus(bonusDate, text4))
		{
			MessageBox.Show("bonus card :" + text4 + " ม\u0e35การสร\u0e49างใน Bonus จร\u0e34งแล\u0e49ว ไม\u0e48สามารถ gen Code ได\u0e49", "แจ\u0e49งเต\u0e37อน", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			return;
		}
		DataSQL.UpdateBonusRefToBookingInfor(text, text4);
		ShowData();
		Util.SetFocusRow(gridView1, focusedRowHandle);
		gridView1.ClearSelection();
	}

	private void btnUpLoad_ItemClick(object sender, ItemClickEventArgs e)
	{
		if (gridView1.RowCount == 0)
		{
			XtraMessageBox.Show("No item");
			return;
		}
		if (gridView1.SelectedRowsCount == 0)
		{
			XtraMessageBox.Show("No item selected");
			return;
		}
		DialogResult dialogResult = MessageBox.Show("Do you want to upload to bonus list (temp) ?", "Comfirm upload", MessageBoxButtons.YesNo);
		if (dialogResult == DialogResult.No)
		{
			return;
		}
		int focusedRowHandle = gridView1.FocusedRowHandle;
		ShowWaitForm();
		int selectedRowsCount = gridView1.SelectedRowsCount;
		for (int i = 0; i < gridView1.SelectedRowsCount; i++)
		{
			splashScreenManager1.SetWaitFormCaption("Procesing..." + (i + 1) + " of " + selectedRowsCount);
			DataRow dataRow = gridView1.GetDataRow(gridView1.GetSelectedRows()[i]);
			string text = dataRow["DocNo"].ToString();
			string text2 = dataRow["PartyCode"].ToString();
			string text3 = dataRow["NationCode"].ToString();
			DateTime bonusDate = Convert.ToDateTime(dataRow["DateBookJW"]);
			string text4 = dataRow["Bonus_Ref"].ToString();
			if (!DataSQL.IsCheckValidateBeforeUpload(dataRow))
			{
				MessageBox.Show("Doc no : " + text + " , Party code : " + text2 + " ไม\u0e48สามารถสร\u0e49าง Bonus list ได\u0e49", "แจ\u0e49งเต\u0e37อน", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			}
			else
			{
				if (DataSQL.IsHasBonusCodeInTableBonus(bonusDate, text4))
				{
					MessageBox.Show("bonus card :" + text4 + " ม\u0e35การสร\u0e49างใน Bonus จร\u0e34งแล\u0e49ว ไม\u0e48สามารถ gen Code ได\u0e49", "แจ\u0e49งเต\u0e37อน", MessageBoxButtons.OK, MessageBoxIcon.Hand);
					return;
				}
				DataSQL.InsertDataToBonusList(dataRow);
			}
		}
		CloseWaitForm();
		XtraMessageBox.Show("Upload Success");
		ShowData();
		Util.SetFocusRow(gridView1, focusedRowHandle);
		gridView1.ClearSelection();
	}

	private void btnRemoveBonusTemp_ItemClick(object sender, ItemClickEventArgs e)
	{
		if (gridView1.RowCount == 0)
		{
			XtraMessageBox.Show("No item");
			return;
		}
		if (gridView1.SelectedRowsCount == 0)
		{
			XtraMessageBox.Show("No item selected");
			return;
		}
		DialogResult dialogResult = MessageBox.Show("Do you want to remove from bonus list (temp) ?", "Comfirm remove", MessageBoxButtons.YesNo);
		if (dialogResult == DialogResult.No)
		{
			return;
		}
		int focusedRowHandle = gridView1.FocusedRowHandle;
		ShowWaitForm();
		int selectedRowsCount = gridView1.SelectedRowsCount;
		for (int i = 0; i < gridView1.SelectedRowsCount; i++)
		{
			splashScreenManager1.SetWaitFormCaption("Procesing..." + (i + 1) + " of " + selectedRowsCount);
			DataRow dataRow = gridView1.GetDataRow(gridView1.GetSelectedRows()[i]);
			string text = dataRow["DocNo"].ToString();
			DateTime bonusDate = Convert.ToDateTime(dataRow["DateBookJW"]);
			string text2 = dataRow["Bonus_Ref"].ToString();
			if (DataSQL.IsHasBonusCodeInTableBonus(bonusDate, text2))
			{
				MessageBox.Show("bonus card :" + text2 + " ม\u0e35การสร\u0e49างใน Bonus จร\u0e34งแล\u0e49ว ไม\u0e48สามารถ gen Code ได\u0e49", "แจ\u0e49งเต\u0e37อน", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			}
			else
			{
				DataSQL.RemoveDataFromBonusList(dataRow);
			}
		}
		CloseWaitForm();
		XtraMessageBox.Show("Remove Success");
		ShowData();
		Util.SetFocusRow(gridView1, focusedRowHandle);
		gridView1.ClearSelection();
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
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(BookingInfor.FrmCreateBonusList));
		this.ribbon = new DevExpress.XtraBars.Ribbon.RibbonControl();
		this.btnExit = new DevExpress.XtraBars.BarButtonItem();
		this.btnRefresh = new DevExpress.XtraBars.BarButtonItem();
		this.btnGenBonusAuto = new DevExpress.XtraBars.BarButtonItem();
		this.beiDate = new DevExpress.XtraBars.BarEditItem();
		this.repositoryItemDateEdit1 = new DevExpress.XtraEditors.Repository.RepositoryItemDateEdit();
		this.btnUpLoad = new DevExpress.XtraBars.BarButtonItem();
		this.btnRemoveBonusTemp = new DevExpress.XtraBars.BarButtonItem();
		this.btnGenBonusManual = new DevExpress.XtraBars.BarButtonItem();
		this.btnClearBonusCode = new DevExpress.XtraBars.BarButtonItem();
		this.ribbonPage1 = new DevExpress.XtraBars.Ribbon.RibbonPage();
		this.ribbonPageGroup4 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPageGroup5 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPageGroup1 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPageGroup3 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonPageGroup2 = new DevExpress.XtraBars.Ribbon.RibbonPageGroup();
		this.ribbonStatusBar = new DevExpress.XtraBars.Ribbon.RibbonStatusBar();
		this.gridControl1 = new DevExpress.XtraGrid.GridControl();
		this.gridView1 = new DevExpress.XtraGrid.Views.Grid.GridView();
		this.gridColumn15 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.repositoryItemImageComboBox2 = new DevExpress.XtraEditors.Repository.RepositoryItemImageComboBox();
		this.image16x16 = new DevExpress.Utils.ImageCollection(this.components);
		this.gridColumn14 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn1 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn2 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn3 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn4 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn5 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn6 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn10 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn9 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn7 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn8 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn11 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn12 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn17 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn13 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.repositoryItemImageComboBox1 = new DevExpress.XtraEditors.Repository.RepositoryItemImageComboBox();
		this.gridColumn16 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.splashScreenManager1 = new DevExpress.XtraSplashScreen.SplashScreenManager(this, typeof(BookingInfor.WaitForm1), true, true);
		((System.ComponentModel.ISupportInitialize)this.ribbon).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemDateEdit1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemDateEdit1.CalendarTimeProperties).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.gridControl1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemImageComboBox2).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.image16x16).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemImageComboBox1).BeginInit();
		base.SuspendLayout();
		this.ribbon.ExpandCollapseItem.Id = 0;
		this.ribbon.Items.AddRange(new DevExpress.XtraBars.BarItem[9]
		{
			this.ribbon.ExpandCollapseItem,
			this.btnExit,
			this.btnRefresh,
			this.btnGenBonusAuto,
			this.beiDate,
			this.btnUpLoad,
			this.btnRemoveBonusTemp,
			this.btnGenBonusManual,
			this.btnClearBonusCode
		});
		this.ribbon.Location = new System.Drawing.Point(0, 0);
		this.ribbon.MaxItemId = 9;
		this.ribbon.Name = "ribbon";
		this.ribbon.Pages.AddRange(new DevExpress.XtraBars.Ribbon.RibbonPage[1] { this.ribbonPage1 });
		this.ribbon.RepositoryItems.AddRange(new DevExpress.XtraEditors.Repository.RepositoryItem[1] { this.repositoryItemDateEdit1 });
		this.ribbon.ShowApplicationButton = DevExpress.Utils.DefaultBoolean.False;
		this.ribbon.ShowToolbarCustomizeItem = false;
		this.ribbon.Size = new System.Drawing.Size(915, 147);
		this.ribbon.StatusBar = this.ribbonStatusBar;
		this.ribbon.Toolbar.ShowCustomizeItem = false;
		this.btnExit.Caption = "Exit";
		this.btnExit.Glyph = (System.Drawing.Image)resources.GetObject("btnExit.Glyph");
		this.btnExit.Id = 1;
		this.btnExit.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnExit.LargeGlyph");
		this.btnExit.Name = "btnExit";
		this.btnExit.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnExit_ItemClick);
		this.btnRefresh.Caption = "Refresh";
		this.btnRefresh.Glyph = (System.Drawing.Image)resources.GetObject("btnRefresh.Glyph");
		this.btnRefresh.Id = 2;
		this.btnRefresh.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnRefresh.LargeGlyph");
		this.btnRefresh.Name = "btnRefresh";
		this.btnRefresh.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnRefresh_ItemClick);
		this.btnGenBonusAuto.Caption = "Gen. Bonus Auto";
		this.btnGenBonusAuto.Glyph = (System.Drawing.Image)resources.GetObject("btnGenBonusAuto.Glyph");
		this.btnGenBonusAuto.Id = 3;
		this.btnGenBonusAuto.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnGenBonusAuto.LargeGlyph");
		this.btnGenBonusAuto.Name = "btnGenBonusAuto";
		this.btnGenBonusAuto.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnGenBonusAuto_ItemClick);
		this.beiDate.Caption = "Book Date JW";
		this.beiDate.Edit = this.repositoryItemDateEdit1;
		this.beiDate.EditWidth = 100;
		this.beiDate.Id = 4;
		this.beiDate.Name = "beiDate";
		this.beiDate.EditValueChanged += new System.EventHandler(beiDate_EditValueChanged);
		this.repositoryItemDateEdit1.AutoHeight = false;
		this.repositoryItemDateEdit1.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.repositoryItemDateEdit1.CalendarTimeProperties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.repositoryItemDateEdit1.Name = "repositoryItemDateEdit1";
		this.repositoryItemDateEdit1.NullValuePrompt = "Please Select Date";
		this.repositoryItemDateEdit1.NullValuePromptShowForEmptyValue = true;
		this.btnUpLoad.Caption = "Upload to Bonus Temp";
		this.btnUpLoad.Glyph = (System.Drawing.Image)resources.GetObject("btnUpLoad.Glyph");
		this.btnUpLoad.Id = 5;
		this.btnUpLoad.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnUpLoad.LargeGlyph");
		this.btnUpLoad.Name = "btnUpLoad";
		this.btnUpLoad.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnUpLoad_ItemClick);
		this.btnRemoveBonusTemp.Caption = "Remove Bonus Temp";
		this.btnRemoveBonusTemp.Glyph = (System.Drawing.Image)resources.GetObject("btnRemoveBonusTemp.Glyph");
		this.btnRemoveBonusTemp.Id = 6;
		this.btnRemoveBonusTemp.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnRemoveBonusTemp.LargeGlyph");
		this.btnRemoveBonusTemp.Name = "btnRemoveBonusTemp";
		this.btnRemoveBonusTemp.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnRemoveBonusTemp_ItemClick);
		this.btnGenBonusManual.Caption = "Gen. Bonus Manual";
		this.btnGenBonusManual.Glyph = (System.Drawing.Image)resources.GetObject("btnGenBonusManual.Glyph");
		this.btnGenBonusManual.Id = 7;
		this.btnGenBonusManual.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnGenBonusManual.LargeGlyph");
		this.btnGenBonusManual.Name = "btnGenBonusManual";
		this.btnGenBonusManual.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnGenBonusManual_ItemClick);
		this.btnClearBonusCode.Caption = "Clear Bonus Code";
		this.btnClearBonusCode.Glyph = (System.Drawing.Image)resources.GetObject("btnClearBonusCode.Glyph");
		this.btnClearBonusCode.Id = 8;
		this.btnClearBonusCode.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnClearBonusCode.LargeGlyph");
		this.btnClearBonusCode.Name = "btnClearBonusCode";
		this.btnClearBonusCode.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnClearBonusCode_ItemClick);
		this.ribbonPage1.Groups.AddRange(new DevExpress.XtraBars.Ribbon.RibbonPageGroup[5] { this.ribbonPageGroup4, this.ribbonPageGroup5, this.ribbonPageGroup1, this.ribbonPageGroup3, this.ribbonPageGroup2 });
		this.ribbonPage1.Name = "ribbonPage1";
		this.ribbonPage1.Text = "Home";
		this.ribbonPageGroup4.ItemLinks.Add(this.beiDate);
		this.ribbonPageGroup4.Name = "ribbonPageGroup4";
		this.ribbonPageGroup4.ShowCaptionButton = false;
		this.ribbonPageGroup4.Text = "Date";
		this.ribbonPageGroup5.ItemLinks.Add(this.btnGenBonusAuto);
		this.ribbonPageGroup5.ItemLinks.Add(this.btnGenBonusManual);
		this.ribbonPageGroup5.ItemLinks.Add(this.btnClearBonusCode);
		this.ribbonPageGroup5.Name = "ribbonPageGroup5";
		this.ribbonPageGroup5.ShowCaptionButton = false;
		this.ribbonPageGroup5.Text = "Generate Bonus";
		this.ribbonPageGroup1.ItemLinks.Add(this.btnUpLoad);
		this.ribbonPageGroup1.ItemLinks.Add(this.btnRemoveBonusTemp);
		this.ribbonPageGroup1.Name = "ribbonPageGroup1";
		this.ribbonPageGroup1.ShowCaptionButton = false;
		this.ribbonPageGroup1.Text = "Controller";
		this.ribbonPageGroup3.ItemLinks.Add(this.btnRefresh);
		this.ribbonPageGroup3.Name = "ribbonPageGroup3";
		this.ribbonPageGroup3.ShowCaptionButton = false;
		this.ribbonPageGroup3.Text = "Refresh";
		this.ribbonPageGroup2.ItemLinks.Add(this.btnExit);
		this.ribbonPageGroup2.Name = "ribbonPageGroup2";
		this.ribbonPageGroup2.ShowCaptionButton = false;
		this.ribbonPageGroup2.Text = "Exit";
		this.ribbonStatusBar.Location = new System.Drawing.Point(0, 464);
		this.ribbonStatusBar.Name = "ribbonStatusBar";
		this.ribbonStatusBar.Ribbon = this.ribbon;
		this.ribbonStatusBar.Size = new System.Drawing.Size(915, 23);
		this.gridControl1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.gridControl1.Location = new System.Drawing.Point(0, 147);
		this.gridControl1.MainView = this.gridView1;
		this.gridControl1.MenuManager = this.ribbon;
		this.gridControl1.Name = "gridControl1";
		this.gridControl1.RepositoryItems.AddRange(new DevExpress.XtraEditors.Repository.RepositoryItem[2] { this.repositoryItemImageComboBox1, this.repositoryItemImageComboBox2 });
		this.gridControl1.Size = new System.Drawing.Size(915, 317);
		this.gridControl1.TabIndex = 2;
		this.gridControl1.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[1] { this.gridView1 });
		this.gridView1.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[17]
		{
			this.gridColumn15, this.gridColumn14, this.gridColumn1, this.gridColumn2, this.gridColumn3, this.gridColumn4, this.gridColumn5, this.gridColumn6, this.gridColumn10, this.gridColumn9,
			this.gridColumn7, this.gridColumn8, this.gridColumn11, this.gridColumn12, this.gridColumn17, this.gridColumn13, this.gridColumn16
		});
		this.gridView1.GridControl = this.gridControl1;
		this.gridView1.Name = "gridView1";
		this.gridView1.OptionsBehavior.Editable = false;
		this.gridView1.OptionsCustomization.AllowColumnMoving = false;
		this.gridView1.OptionsCustomization.AllowFilter = false;
		this.gridView1.OptionsCustomization.AllowSort = false;
		this.gridView1.OptionsSelection.CheckBoxSelectorColumnWidth = 60;
		this.gridView1.OptionsSelection.MultiSelect = true;
		this.gridView1.OptionsSelection.MultiSelectMode = DevExpress.XtraGrid.Views.Grid.GridMultiSelectMode.CheckBoxRowSelect;
		this.gridView1.OptionsView.EnableAppearanceEvenRow = true;
		this.gridView1.OptionsView.ShowGroupPanel = false;
		this.gridColumn15.Caption = "Status";
		this.gridColumn15.ColumnEdit = this.repositoryItemImageComboBox2;
		this.gridColumn15.FieldName = "Status";
		this.gridColumn15.Name = "gridColumn15";
		this.gridColumn15.Visible = true;
		this.gridColumn15.VisibleIndex = 1;
		this.repositoryItemImageComboBox2.AutoHeight = false;
		this.repositoryItemImageComboBox2.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.repositoryItemImageComboBox2.Items.AddRange(new DevExpress.XtraEditors.Controls.ImageComboBoxItem[3]
		{
			new DevExpress.XtraEditors.Controls.ImageComboBoxItem("Not Upload", "NotUpload", 1),
			new DevExpress.XtraEditors.Controls.ImageComboBoxItem("Upload", "Upload", 3),
			new DevExpress.XtraEditors.Controls.ImageComboBoxItem("Has Bonus", "HasBonus", 2)
		});
		this.repositoryItemImageComboBox2.Name = "repositoryItemImageComboBox2";
		this.repositoryItemImageComboBox2.SmallImages = this.image16x16;
		this.image16x16.ImageStream = (DevExpress.Utils.ImageCollectionStreamer)resources.GetObject("image16x16.ImageStream");
		this.image16x16.InsertGalleryImage("apply_16x16.png", "images/actions/apply_16x16.png", DevExpress.Images.ImageResourceCache.Default.GetImage("images/actions/apply_16x16.png"), 0);
		this.image16x16.Images.SetKeyName(0, "apply_16x16.png");
		this.image16x16.InsertGalleryImage("cancel_16x16.png", "images/actions/cancel_16x16.png", DevExpress.Images.ImageResourceCache.Default.GetImage("images/actions/cancel_16x16.png"), 1);
		this.image16x16.Images.SetKeyName(1, "cancel_16x16.png");
		this.image16x16.InsertGalleryImage("warning_16x16.png", "images/status/warning_16x16.png", DevExpress.Images.ImageResourceCache.Default.GetImage("images/status/warning_16x16.png"), 2);
		this.image16x16.Images.SetKeyName(2, "warning_16x16.png");
		this.image16x16.InsertGalleryImage("status_16x16.png", "images/tasks/status_16x16.png", DevExpress.Images.ImageResourceCache.Default.GetImage("images/tasks/status_16x16.png"), 3);
		this.image16x16.Images.SetKeyName(3, "status_16x16.png");
		this.gridColumn14.Caption = "Bonus Code";
		this.gridColumn14.FieldName = "Bonus_Ref";
		this.gridColumn14.Name = "gridColumn14";
		this.gridColumn14.Visible = true;
		this.gridColumn14.VisibleIndex = 2;
		this.gridColumn1.Caption = "Date book JW";
		this.gridColumn1.FieldName = "DateBookJW";
		this.gridColumn1.Name = "gridColumn1";
		this.gridColumn1.Visible = true;
		this.gridColumn1.VisibleIndex = 3;
		this.gridColumn2.Caption = "Time";
		this.gridColumn2.FieldName = "TimeBookJW";
		this.gridColumn2.Name = "gridColumn2";
		this.gridColumn2.Visible = true;
		this.gridColumn2.VisibleIndex = 4;
		this.gridColumn3.Caption = "Agent Code";
		this.gridColumn3.FieldName = "AgentCode";
		this.gridColumn3.Name = "gridColumn3";
		this.gridColumn3.Visible = true;
		this.gridColumn3.VisibleIndex = 5;
		this.gridColumn4.Caption = "Agent Name";
		this.gridColumn4.FieldName = "AgentName";
		this.gridColumn4.Name = "gridColumn4";
		this.gridColumn4.Visible = true;
		this.gridColumn4.VisibleIndex = 6;
		this.gridColumn5.Caption = "Guide Code";
		this.gridColumn5.FieldName = "GuideCode";
		this.gridColumn5.Name = "gridColumn5";
		this.gridColumn5.Visible = true;
		this.gridColumn5.VisibleIndex = 7;
		this.gridColumn6.Caption = "Guide Name";
		this.gridColumn6.FieldName = "GuideName";
		this.gridColumn6.Name = "gridColumn6";
		this.gridColumn6.Visible = true;
		this.gridColumn6.VisibleIndex = 8;
		this.gridColumn10.Caption = "Nation";
		this.gridColumn10.FieldName = "NationCode";
		this.gridColumn10.Name = "gridColumn10";
		this.gridColumn10.Visible = true;
		this.gridColumn10.VisibleIndex = 9;
		this.gridColumn9.Caption = "Car Code";
		this.gridColumn9.FieldName = "CarCode";
		this.gridColumn9.Name = "gridColumn9";
		this.gridColumn9.Visible = true;
		this.gridColumn9.VisibleIndex = 10;
		this.gridColumn7.Caption = "Pax";
		this.gridColumn7.FieldName = "Pax";
		this.gridColumn7.Name = "gridColumn7";
		this.gridColumn7.Visible = true;
		this.gridColumn7.VisibleIndex = 11;
		this.gridColumn8.Caption = "Party Code";
		this.gridColumn8.FieldName = "PartyCode";
		this.gridColumn8.Name = "gridColumn8";
		this.gridColumn8.Visible = true;
		this.gridColumn8.VisibleIndex = 12;
		this.gridColumn11.Caption = "First Shop";
		this.gridColumn11.FieldName = "FirstShop";
		this.gridColumn11.Name = "gridColumn11";
		this.gridColumn11.Visible = true;
		this.gridColumn11.VisibleIndex = 13;
		this.gridColumn12.Caption = "Remark";
		this.gridColumn12.FieldName = "Remark";
		this.gridColumn12.Name = "gridColumn12";
		this.gridColumn12.Visible = true;
		this.gridColumn12.VisibleIndex = 14;
		this.gridColumn17.Caption = "Doc. No.";
		this.gridColumn17.FieldName = "DocNo";
		this.gridColumn17.Name = "gridColumn17";
		this.gridColumn17.Visible = true;
		this.gridColumn17.VisibleIndex = 15;
		this.gridColumn13.Caption = "Complete";
		this.gridColumn13.ColumnEdit = this.repositoryItemImageComboBox1;
		this.gridColumn13.FieldName = "Complete";
		this.gridColumn13.Name = "gridColumn13";
		this.gridColumn13.Visible = true;
		this.gridColumn13.VisibleIndex = 16;
		this.repositoryItemImageComboBox1.AutoHeight = false;
		this.repositoryItemImageComboBox1.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.repositoryItemImageComboBox1.Items.AddRange(new DevExpress.XtraEditors.Controls.ImageComboBoxItem[2]
		{
			new DevExpress.XtraEditors.Controls.ImageComboBoxItem("Complete", "Y", 0),
			new DevExpress.XtraEditors.Controls.ImageComboBoxItem("Not Complete", "N", 1)
		});
		this.repositoryItemImageComboBox1.Name = "repositoryItemImageComboBox1";
		this.repositoryItemImageComboBox1.SmallImages = this.image16x16;
		this.gridColumn16.Caption = "Doc. Date";
		this.gridColumn16.FieldName = "DocDate";
		this.gridColumn16.Name = "gridColumn16";
		this.splashScreenManager1.ClosingDelay = 500;
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(915, 487);
		base.Controls.Add(this.gridControl1);
		base.Controls.Add(this.ribbonStatusBar);
		base.Controls.Add(this.ribbon);
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.Name = "FrmCreateBonusList";
		this.Ribbon = this.ribbon;
		base.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
		this.StatusBar = this.ribbonStatusBar;
		this.Text = "Create Bonus list temp";
		base.WindowState = System.Windows.Forms.FormWindowState.Maximized;
		((System.ComponentModel.ISupportInitialize)this.ribbon).EndInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemDateEdit1.CalendarTimeProperties).EndInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemDateEdit1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridControl1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemImageComboBox2).EndInit();
		((System.ComponentModel.ISupportInitialize)this.image16x16).EndInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemImageComboBox1).EndInit();
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
