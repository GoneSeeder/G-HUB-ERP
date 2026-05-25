using System;
using System.ComponentModel;
using System.Data;
using System.Data.OleDb;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using BookingInfor.DB;
using DevExpress.Data;
using DevExpress.Images;
using DevExpress.Utils;
using DevExpress.XtraBars;
using DevExpress.XtraEditors;
using DevExpress.XtraEditors.Controls;
using DevExpress.XtraEditors.Repository;
using DevExpress.XtraGrid;
using DevExpress.XtraGrid.Columns;
using DevExpress.XtraGrid.Views.Base;
using DevExpress.XtraGrid.Views.Grid;
using DevExpress.XtraSplashScreen;
using DevExpress.XtraTab;
using Microsoft.Win32;

namespace BookingInfor;

public class FrmImportExcelSeparate : XtraForm
{
	private string _fileExcelMain = "";

	private string _fileExcelDetail = "";

	private IContainer components = null;

	private BarManager barManager1;

	private Bar bar1;

	private Bar bar3;

	private BarDockControl barDockControlTop;

	private BarDockControl barDockControlBottom;

	private BarDockControl barDockControlLeft;

	private BarDockControl barDockControlRight;

	private BarLargeButtonItem btnImport;

	private BarLargeButtonItem btnClearAll;

	private BarStaticItem barStaticItem1;

	private BarLargeButtonItem btnExit;

	private XtraTabControl xtraTabControl1;

	private XtraTabPage xtraTabPage1;

	private XtraTabPage xtraTabPage2;

	private StandaloneBarDockControl standaloneBarDockControl1;

	private StandaloneBarDockControl standaloneBarDockControl2;

	private BarDockControl barDockControl3;

	private BarDockControl barDockControl4;

	private BarDockControl barDockControl2;

	private BarDockControl barDockControl1;

	private BarDockControl barDockControl7;

	private BarDockControl barDockControl8;

	private BarDockControl barDockControl6;

	private BarDockControl barDockControl5;

	private BarManager barManager2;

	private Bar bar2;

	private BarLargeButtonItem btnBrowseMain;

	private BarStaticItem barStaticItem2;

	private BarLargeButtonItem btnClearGridMain;

	private BarManager barManager3;

	private Bar bar4;

	private BarLargeButtonItem btnBrowseDetail;

	private BarStaticItem barStaticItem3;

	private BarLargeButtonItem btnClearGridDetail;

	private GridControl gridControl1;

	private GridView gridView1;

	private GridColumn gridColumn1;

	private GridColumn gridColumn2;

	private GridColumn gridColumn3;

	private GridColumn gridColumn4;

	private GridColumn gridColumn5;

	private GridColumn gridColumn6;

	private GridColumn gridColumn7;

	private GridColumn gridColumn8;

	private GridColumn gridColumn9;

	private GridColumn gridColumn10;

	private GridColumn gridColumn11;

	private GridColumn gridColumn12;

	private GridColumn gridColumn13;

	private GridColumn gridColumn14;

	private GridControl gridControl2;

	private GridView gridView2;

	private GridColumn gridColumn15;

	private GridColumn gridColumn16;

	private GridColumn gridColumn17;

	private GridColumn gridColumn18;

	private GridColumn gridColumn19;

	private GridColumn gridColumn20;

	private GridColumn gridColumn21;

	private SplashScreenManager splashScreenManager1;

	private BarLargeButtonItem btnTestCheckOleDB;

	private BarLargeButtonItem btnCheckDup;

	private GridColumn gridColumn22;

	private GridColumn gridColumn23;

	private ImageCollection image16x16;

	private RepositoryItemImageComboBox repositoryItemImageComboBox1;

	private RepositoryItemImageComboBox repositoryItemImageComboBox2;

	private GridColumn gridColumn24;

	private GridColumn gridColumn25;

	public FrmImportExcelSeparate()
	{
		InitializeComponent();
		InitPage();
	}

	private void InitPage()
	{
		enableButtonControl(isEnable: false);
	}

	private void enableButtonControl(bool isEnable)
	{
		btnImport.Enabled = isEnable;
	}

	private void btnExit_ItemClick(object sender, ItemClickEventArgs e)
	{
		base.DialogResult = DialogResult.Cancel;
	}

	private void BindData(GridControl gridControl, DataTable dt)
	{
		gridControl.BeginUpdate();
		gridControl.DataSource = null;
		gridControl.DataSource = dt;
		gridControl.EndUpdate();
	}

	private void btnBrowseMain_ItemClick(object sender, ItemClickEventArgs e)
	{
		BrowseFile("Main");
	}

	private void btnBrowseDetail_ItemClick(object sender, ItemClickEventArgs e)
	{
		BrowseFile("Detail");
	}

	private void BrowseFile(string TypeImport)
	{
		enableButtonControl(isEnable: false);
		Stream stream = null;
		OpenFileDialog openFileDialog = new OpenFileDialog();
		openFileDialog.InitialDirectory = "";
		openFileDialog.Filter = " All Files (*.*)|*.* | Excel files (*.txt) | *.txt";
		openFileDialog.FilterIndex = 2;
		openFileDialog.RestoreDirectory = true;
		if (openFileDialog.ShowDialog() != DialogResult.OK)
		{
			return;
		}
		try
		{
			if ((stream = openFileDialog.OpenFile()) == null)
			{
				return;
			}
			using (stream)
			{
				FileStream fileStream = stream as FileStream;
				string name = fileStream.Name;
				if (!(TypeImport == "Main"))
				{
					if (TypeImport == "Detail")
					{
						DataTable dt = OpenFileReturnDateTable(name);
						BindData(gridControl2, dt);
						gridView2.BestFitColumns();
						_fileExcelDetail = name;
					}
				}
				else
				{
					DataTable dt2 = OpenFileReturnDateTable(name);
					BindData(gridControl1, dt2);
					gridView1.BestFitColumns();
					_fileExcelMain = name;
				}
			}
		}
		catch (Exception ex)
		{
			MessageBox.Show("Error: Could not read file from disk. Original error: " + ex.Message);
		}
	}

	private DataTable OpenFileReturnDateTable(string fileName)
	{
		if (!File.Exists(fileName))
		{
			XtraMessageBox.Show("File not found");
			return null;
		}
		string text = "";
		text = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source={0};Extended Properties=Excel 12.0;";
		try
		{
			string text2 = string.Format(text, fileName);
			OleDbConnection oleDbConnection = new OleDbConnection(text2);
			oleDbConnection.Open();
			DataTable oleDbSchemaTable = oleDbConnection.GetOleDbSchemaTable(OleDbSchemaGuid.Tables, null);
			if (oleDbSchemaTable == null)
			{
				return null;
			}
			DataSet dataSet = new DataSet();
			DataTable result = null;
			if (oleDbSchemaTable.Rows.Count > 0)
			{
				for (int i = 0; i < oleDbSchemaTable.Rows.Count; i++)
				{
					string text3 = oleDbSchemaTable.Rows[i]["TABLE_NAME"].ToString();
					OleDbDataAdapter oleDbDataAdapter = new OleDbDataAdapter("select '' as isDup,* from [" + text3 + "]", text2);
					string srcTable = text3.Replace("$", "");
					oleDbDataAdapter.Fill(dataSet, srcTable);
					result = dataSet.Tables[0];
				}
			}
			else
			{
				result = null;
			}
			return result;
		}
		catch (IOException ex)
		{
			if (ex.Source != null)
			{
				Console.WriteLine("IOException source: {0}", ex.Source);
			}
			throw;
		}
	}

	private void btnClearGridMain_ItemClick(object sender, ItemClickEventArgs e)
	{
		BindData(gridControl1, null);
	}

	private void btnClearGridDetail_ItemClick(object sender, ItemClickEventArgs e)
	{
		BindData(gridControl2, null);
	}

	private void btnClearAll_ItemClick(object sender, ItemClickEventArgs e)
	{
		clearGrid();
	}

	private void clearGrid()
	{
		enableButtonControl(isEnable: false);
		BindData(gridControl1, null);
		BindData(gridControl2, null);
	}

	private void btnImport_ItemClick(object sender, ItemClickEventArgs e)
	{
		if (gridView1.SelectedRowsCount == 0)
		{
			XtraMessageBox.Show("No Select Data");
			return;
		}
		if (gridView2.RowCount == 0)
		{
			DialogResult dialogResult = XtraMessageBox.Show("ไม\u0e48ม\u0e35ข\u0e49อม\u0e39ลรายละเอ\u0e35ยด ต\u0e49องการ Import ข\u0e49อม\u0e39ลใช\u0e48หร\u0e37อไม\u0e48?", "Confirmation", MessageBoxButtons.YesNo);
			if (dialogResult == DialogResult.No)
			{
				return;
			}
		}
		if (gridView2.SelectedRowsCount == 0)
		{
			DialogResult dialogResult2 = XtraMessageBox.Show("ไม\u0e48ได\u0e49เล\u0e37อกรายการ Detail ต\u0e49องการ Import ข\u0e49อม\u0e39ลใช\u0e48หร\u0e37อไม\u0e48?", "Confirmation", MessageBoxButtons.YesNo);
			if (dialogResult2 == DialogResult.No)
			{
				return;
			}
		}
		bool flag = false;
		for (int i = 0; i < gridView1.SelectedRowsCount; i++)
		{
			DataRow dataRow = gridView1.GetDataRow(gridView1.GetSelectedRows()[i]);
			string text = dataRow["isDup"].ToString();
			if (text == "Y")
			{
				flag = true;
			}
		}
		if (flag)
		{
			DialogResult dialogResult3 = XtraMessageBox.Show("ม\u0e35ข\u0e49อม\u0e39ล Party Code Ref ซ\u0e49ำ ต\u0e49องการ Import ข\u0e49อม\u0e39ลใช\u0e48หร\u0e37อไม\u0e48?", "Confirmation", MessageBoxButtons.YesNo);
			if (dialogResult3 == DialogResult.No)
			{
				return;
			}
		}
		ShowWaitForm();
		splashScreenManager1.SetWaitFormCaption("Procesing 1 of 2 ");
		int selectedRowsCount = gridView1.SelectedRowsCount;
		int maxSeriesNo = DataSQL.GetMaxSeriesNo();
		maxSeriesNo++;
		for (int j = 0; j < gridView1.SelectedRowsCount; j++)
		{
			splashScreenManager1.SetWaitFormDescription("Import row ..." + (j + 1) + " of " + selectedRowsCount);
			DataRow dataRow2 = gridView1.GetDataRow(gridView1.GetSelectedRows()[j]);
			bookArg bookArg = new bookArg();
			string serverTime = DataSQL.GetServerTime();
			string docNo = DataSQL.GenerateDocNo();
			bookArg.docDate = ParaClass.ServerDate;
			bookArg.docTime = serverTime;
			bookArg.docNo = docNo;
			string agentCodeRef = dataRow2["AGENTCODE_REF"].ToString();
			string agentCodeFromAgentCodeRef = DataSQL.GetAgentCodeFromAgentCodeRef(agentCodeRef);
			bookArg.agentCode = agentCodeFromAgentCodeRef;
			bookArg.agentName = dataRow2["AGENT_NAME"].ToString();
			bookArg.partyCode = dataRow2["PARTYCODE"].ToString();
			bookArg.guideCode = "";
			bookArg.guideName = dataRow2["GUIDENAME"].ToString();
			bookArg.telGuide = dataRow2["TEL_GUIDE"].ToString();
			bookArg.carCode = dataRow2["CARCODE"].ToString();
			bookArg.pax = Convert.ToInt16(dataRow2["PAX"]);
			bookArg.remark = "";
			bookArg.telDriver = dataRow2["TEL_DRIVER"].ToString();
			bookArg.dateBookJW = null;
			bookArg.timeBookJW = "";
			bookArg.dateBookBKF = null;
			bookArg.timeBookBKF = "";
			bookArg.dateBookRTH = null;
			bookArg.timeBookRTH = "";
			bookArg.dateBookTRP = null;
			bookArg.timeBookTRP = "";
			bookArg.arriveDate = Convert.ToDateTime(dataRow2["ARRIVE_DATE"]);
			if (dataRow2["DEPARTURE_DATE"] != DBNull.Value)
			{
				bookArg.departureDate = Convert.ToDateTime(dataRow2["DEPARTURE_DATE"]);
			}
			else
			{
				bookArg.departureDate = null;
			}
			bookArg.nationCode = dataRow2["NATION_CODE"].ToString();
			bookArg.firstShop = "G";
			bookArg.complete = "N";
			bookArg.orderDate = Convert.ToDateTime(dataRow2["ORDER_DATE"]);
			bookArg.faxNo = Convert.ToInt16(dataRow2["FAX_NO"]);
			bookArg.agentCodeRef = agentCodeRef;
			bookArg.partyCodeRef = dataRow2["PARTYCODE_REF"].ToString();
			bookArg.remarkBook = dataRow2["BOOK_REMARK"].ToString();
			bookArg.importType = "ExcelImport";
			bookArg.seriesNo = maxSeriesNo;
			bookArg.ptyDateStart = null;
			bookArg.ptyDateEnd = null;
			for (int k = 0; k < gridView2.RowCount; k++)
			{
				DataRow dataRow3 = gridView2.GetDataRow(k);
				DateTime dateTime = Convert.ToDateTime(dataRow3["ORDER_DATE"]);
				short num = Convert.ToInt16(dataRow3["FAX_NO"]);
				string text2 = dataRow3["AGENT_CODE"].ToString();
				string text3 = dataRow3["CODE"].ToString();
				string text4 = dataRow3["PLACE_CODE"].ToString();
				DateTime dateTime2 = dateTime;
				DateTime? orderDate = bookArg.orderDate;
				if (orderDate.HasValue && dateTime2 == orderDate.GetValueOrDefault() && num == bookArg.faxNo && text2 == bookArg.agentCodeRef && text3 == bookArg.partyCodeRef && text4 == "PTY")
				{
					DateTime? ptyDateStart = ((dataRow3["START_DATE"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?(Convert.ToDateTime(dataRow3["START_DATE"])));
					DateTime? ptyDateEnd = ((dataRow3["END_DATE"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?(Convert.ToDateTime(dataRow3["END_DATE"])));
					bookArg.ptyDateStart = ptyDateStart;
					bookArg.ptyDateEnd = ptyDateEnd;
				}
			}
			bool isEdit = false;
			DataSQL.SaveBookingData(isEdit, bookArg);
		}
		splashScreenManager1.SetWaitFormCaption("Procesing 2 of 2 ");
		selectedRowsCount = gridView2.SelectedRowsCount;
		for (int l = 0; l < gridView2.SelectedRowsCount; l++)
		{
			splashScreenManager1.SetWaitFormDescription("Import row ..." + (l + 1) + " of " + selectedRowsCount);
			DataRow dataRow4 = gridView2.GetDataRow(gridView2.GetSelectedRows()[l]);
			string text5 = dataRow4["isDup"].ToString();
			DateTime dateTime3 = Convert.ToDateTime(dataRow4["ORDER_DATE"]);
			short faxNo = Convert.ToInt16(dataRow4["FAX_NO"]);
			string agentCode = dataRow4["AGENT_CODE"].ToString();
			string partyCode = dataRow4["CODE"].ToString();
			string placeCode = dataRow4["PLACE_CODE"].ToString();
			bool flag2 = DataSQL.IsHasFaxOrderPlace(dateTime3, faxNo, agentCode, partyCode, placeCode);
			if (text5 == "" && !flag2)
			{
				BookFaxOrderPlaceArg bookFaxOrderPlaceArg = new BookFaxOrderPlaceArg();
				bookFaxOrderPlaceArg.orderDate = dateTime3;
				bookFaxOrderPlaceArg.faxNo = faxNo;
				bookFaxOrderPlaceArg.agentCode = agentCode;
				bookFaxOrderPlaceArg.partyCode = partyCode;
				bookFaxOrderPlaceArg.placeCode = placeCode;
				if (dataRow4["START_DATE"] != DBNull.Value)
				{
					bookFaxOrderPlaceArg.startDate = Convert.ToDateTime(dataRow4["START_DATE"]);
				}
				else
				{
					bookFaxOrderPlaceArg.startDate = null;
				}
				if (dataRow4["END_DATE"] != DBNull.Value)
				{
					bookFaxOrderPlaceArg.endDate = Convert.ToDateTime(dataRow4["END_DATE"]);
				}
				else
				{
					bookFaxOrderPlaceArg.endDate = null;
				}
				bookFaxOrderPlaceArg.seriesNo = maxSeriesNo;
				DataSQL.InsertFaxOrderPlace(bookFaxOrderPlaceArg);
			}
		}
		CloseWaitForm();
		int num2 = DataSQL.CountRowDataFromSeriesNo(maxSeriesNo, "Main");
		int num3 = DataSQL.CountRowDataFromSeriesNo(maxSeriesNo, "Detail");
		XtraMessageBox.Show("Import Main = " + num2 + " rows" + Environment.NewLine + "Import item = " + num3 + " rows" + Environment.NewLine + "Complete");
		clearGrid();
		DeleteFileExcel();
	}

	private void DeleteFileExcel()
	{
		if (_fileExcelMain != "")
		{
			try
			{
				File.Delete(_fileExcelMain);
			}
			catch (IOException ex)
			{
				MessageBox.Show(ex.Message);
			}
		}
		if (_fileExcelDetail != "")
		{
			try
			{
				File.Delete(_fileExcelDetail);
			}
			catch (IOException ex2)
			{
				MessageBox.Show(ex2.Message);
			}
		}
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

	private void btnTestCheckOleDB_ItemClick(object sender, ItemClickEventArgs e)
	{
		string empty = string.Empty;
		RegistryKey registryKey = Registry.LocalMachine.OpenSubKey("SOFTWARE\\Classes");
		if (registryKey == null)
		{
			return;
		}
		string[] subKeyNames = registryKey.GetSubKeyNames();
		foreach (string text in subKeyNames)
		{
			if (text.Contains("Microsoft.ACE.OLEDB"))
			{
				MessageBox.Show(text);
			}
		}
	}

	private void btnCheckDup_ItemClick(object sender, ItemClickEventArgs e)
	{
		if (gridView1.RowCount == 0)
		{
			XtraMessageBox.Show("No Data");
			return;
		}
		ShowWaitForm();
		for (int i = 0; i < gridView1.RowCount; i++)
		{
			DataRow dataRow = gridView1.GetDataRow(i);
			string text = dataRow["PARTYCODE_REF"].ToString();
			DateTime arriveDate = ((dataRow["ARRIVE_DATE"] == DBNull.Value) ? Convert.ToDateTime("1950-01-01") : Convert.ToDateTime(dataRow["ARRIVE_DATE"]));
			if (!DataSQL.IsDupPartyCodeRef(text, arriveDate))
			{
				continue;
			}
			gridView1.SetRowCellValue(i, gridView1.Columns["isDup"], "Y");
			DateTime dateTime = ((dataRow["ORDER_DATE"] == DBNull.Value) ? DateTime.Now : Convert.ToDateTime(dataRow["ORDER_DATE"]));
			short num = (short)((dataRow["FAX_NO"] != DBNull.Value) ? Convert.ToInt16(dataRow["FAX_NO"]) : 0);
			string text2 = ((dataRow["AGENTCODE_REF"] == DBNull.Value) ? "" : dataRow["AGENTCODE_REF"].ToString());
			for (int j = 0; j < gridView2.RowCount; j++)
			{
				DataRow dataRow2 = gridView2.GetDataRow(j);
				DateTime dateTime2 = Convert.ToDateTime(dataRow2["ORDER_DATE"]);
				short num2 = Convert.ToInt16(dataRow2["FAX_NO"]);
				string text3 = dataRow2["AGENT_CODE"].ToString();
				string text4 = dataRow2["CODE"].ToString();
				if (dateTime == dateTime2 && num == num2 && text2 == text3 && text == text4)
				{
					gridView2.SetRowCellValue(j, gridView2.Columns["isDup"], "Y");
				}
			}
		}
		CloseWaitForm();
		enableButtonControl(isEnable: true);
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
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(BookingInfor.FrmImportExcelSeparate));
		this.barManager1 = new DevExpress.XtraBars.BarManager(this.components);
		this.bar1 = new DevExpress.XtraBars.Bar();
		this.btnCheckDup = new DevExpress.XtraBars.BarLargeButtonItem();
		this.btnImport = new DevExpress.XtraBars.BarLargeButtonItem();
		this.btnClearAll = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem1 = new DevExpress.XtraBars.BarStaticItem();
		this.btnExit = new DevExpress.XtraBars.BarLargeButtonItem();
		this.btnTestCheckOleDB = new DevExpress.XtraBars.BarLargeButtonItem();
		this.bar3 = new DevExpress.XtraBars.Bar();
		this.barDockControlTop = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlBottom = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlLeft = new DevExpress.XtraBars.BarDockControl();
		this.barDockControlRight = new DevExpress.XtraBars.BarDockControl();
		this.standaloneBarDockControl1 = new DevExpress.XtraBars.StandaloneBarDockControl();
		this.standaloneBarDockControl2 = new DevExpress.XtraBars.StandaloneBarDockControl();
		this.xtraTabControl1 = new DevExpress.XtraTab.XtraTabControl();
		this.xtraTabPage1 = new DevExpress.XtraTab.XtraTabPage();
		this.gridControl1 = new DevExpress.XtraGrid.GridControl();
		this.gridView1 = new DevExpress.XtraGrid.Views.Grid.GridView();
		this.gridColumn22 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.repositoryItemImageComboBox1 = new DevExpress.XtraEditors.Repository.RepositoryItemImageComboBox();
		this.image16x16 = new DevExpress.Utils.ImageCollection(this.components);
		this.gridColumn25 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn1 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn2 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn3 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn4 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn5 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn6 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn7 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn8 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn9 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn10 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn11 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn12 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn13 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn14 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn24 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.xtraTabPage2 = new DevExpress.XtraTab.XtraTabPage();
		this.gridControl2 = new DevExpress.XtraGrid.GridControl();
		this.gridView2 = new DevExpress.XtraGrid.Views.Grid.GridView();
		this.gridColumn23 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.repositoryItemImageComboBox2 = new DevExpress.XtraEditors.Repository.RepositoryItemImageComboBox();
		this.gridColumn15 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn16 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn17 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn18 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn19 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn20 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.gridColumn21 = new DevExpress.XtraGrid.Columns.GridColumn();
		this.barManager2 = new DevExpress.XtraBars.BarManager(this.components);
		this.bar2 = new DevExpress.XtraBars.Bar();
		this.btnBrowseMain = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem2 = new DevExpress.XtraBars.BarStaticItem();
		this.btnClearGridMain = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barDockControl1 = new DevExpress.XtraBars.BarDockControl();
		this.barDockControl2 = new DevExpress.XtraBars.BarDockControl();
		this.barDockControl3 = new DevExpress.XtraBars.BarDockControl();
		this.barDockControl4 = new DevExpress.XtraBars.BarDockControl();
		this.barManager3 = new DevExpress.XtraBars.BarManager(this.components);
		this.bar4 = new DevExpress.XtraBars.Bar();
		this.btnBrowseDetail = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barStaticItem3 = new DevExpress.XtraBars.BarStaticItem();
		this.btnClearGridDetail = new DevExpress.XtraBars.BarLargeButtonItem();
		this.barDockControl5 = new DevExpress.XtraBars.BarDockControl();
		this.barDockControl6 = new DevExpress.XtraBars.BarDockControl();
		this.barDockControl7 = new DevExpress.XtraBars.BarDockControl();
		this.barDockControl8 = new DevExpress.XtraBars.BarDockControl();
		this.splashScreenManager1 = new DevExpress.XtraSplashScreen.SplashScreenManager(this, typeof(BookingInfor.WaitForm1), true, true);
		((System.ComponentModel.ISupportInitialize)this.barManager1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.xtraTabControl1).BeginInit();
		this.xtraTabControl1.SuspendLayout();
		this.xtraTabPage1.SuspendLayout();
		((System.ComponentModel.ISupportInitialize)this.gridControl1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemImageComboBox1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.image16x16).BeginInit();
		this.xtraTabPage2.SuspendLayout();
		((System.ComponentModel.ISupportInitialize)this.gridControl2).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.gridView2).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemImageComboBox2).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.barManager2).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.barManager3).BeginInit();
		base.SuspendLayout();
		this.barManager1.Bars.AddRange(new DevExpress.XtraBars.Bar[2] { this.bar1, this.bar3 });
		this.barManager1.DockControls.Add(this.barDockControlTop);
		this.barManager1.DockControls.Add(this.barDockControlBottom);
		this.barManager1.DockControls.Add(this.barDockControlLeft);
		this.barManager1.DockControls.Add(this.barDockControlRight);
		this.barManager1.DockControls.Add(this.standaloneBarDockControl1);
		this.barManager1.DockControls.Add(this.standaloneBarDockControl2);
		this.barManager1.Form = this;
		this.barManager1.Items.AddRange(new DevExpress.XtraBars.BarItem[6] { this.btnImport, this.btnClearAll, this.barStaticItem1, this.btnExit, this.btnTestCheckOleDB, this.btnCheckDup });
		this.barManager1.MaxItemId = 6;
		this.barManager1.StatusBar = this.bar3;
		this.bar1.BarName = "Tools";
		this.bar1.DockCol = 0;
		this.bar1.DockRow = 0;
		this.bar1.DockStyle = DevExpress.XtraBars.BarDockStyle.Top;
		this.bar1.LinksPersistInfo.AddRange(new DevExpress.XtraBars.LinkPersistInfo[6]
		{
			new DevExpress.XtraBars.LinkPersistInfo(this.btnCheckDup),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnImport),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnClearAll),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem1),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnExit),
			new DevExpress.XtraBars.LinkPersistInfo(DevExpress.XtraBars.BarLinkUserDefines.None, false, this.btnTestCheckOleDB, false)
		});
		this.bar1.OptionsBar.DrawBorder = false;
		this.bar1.OptionsBar.DrawDragBorder = false;
		this.bar1.Text = "Tools";
		this.btnCheckDup.Caption = "Check Duplicate";
		this.btnCheckDup.Glyph = (System.Drawing.Image)resources.GetObject("btnCheckDup.Glyph");
		this.btnCheckDup.Id = 5;
		this.btnCheckDup.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnCheckDup.LargeGlyph");
		this.btnCheckDup.Name = "btnCheckDup";
		this.btnCheckDup.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnCheckDup_ItemClick);
		this.btnImport.Caption = "Import To DB";
		this.btnImport.Glyph = (System.Drawing.Image)resources.GetObject("btnImport.Glyph");
		this.btnImport.Id = 0;
		this.btnImport.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnImport.LargeGlyph");
		this.btnImport.Name = "btnImport";
		this.btnImport.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnImport_ItemClick);
		this.btnClearAll.Caption = "Clear All Grid";
		this.btnClearAll.Glyph = (System.Drawing.Image)resources.GetObject("btnClearAll.Glyph");
		this.btnClearAll.Id = 1;
		this.btnClearAll.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnClearAll.LargeGlyph");
		this.btnClearAll.Name = "btnClearAll";
		this.btnClearAll.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnClearAll_ItemClick);
		this.barStaticItem1.Id = 2;
		this.barStaticItem1.Name = "barStaticItem1";
		this.barStaticItem1.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnExit.Caption = "Exit";
		this.btnExit.Glyph = (System.Drawing.Image)resources.GetObject("btnExit.Glyph");
		this.btnExit.Id = 3;
		this.btnExit.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnExit.LargeGlyph");
		this.btnExit.Name = "btnExit";
		this.btnExit.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnExit_ItemClick);
		this.btnTestCheckOleDB.Caption = "Test Check OleDB";
		this.btnTestCheckOleDB.Glyph = (System.Drawing.Image)resources.GetObject("btnTestCheckOleDB.Glyph");
		this.btnTestCheckOleDB.Id = 4;
		this.btnTestCheckOleDB.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnTestCheckOleDB.LargeGlyph");
		this.btnTestCheckOleDB.Name = "btnTestCheckOleDB";
		this.btnTestCheckOleDB.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnTestCheckOleDB_ItemClick);
		this.bar3.BarName = "Status bar";
		this.bar3.CanDockStyle = DevExpress.XtraBars.BarCanDockStyle.Bottom;
		this.bar3.DockCol = 0;
		this.bar3.DockRow = 0;
		this.bar3.DockStyle = DevExpress.XtraBars.BarDockStyle.Bottom;
		this.bar3.OptionsBar.AllowQuickCustomization = false;
		this.bar3.OptionsBar.DrawDragBorder = false;
		this.bar3.OptionsBar.UseWholeRow = true;
		this.bar3.Text = "Status bar";
		this.barDockControlTop.CausesValidation = false;
		this.barDockControlTop.Dock = System.Windows.Forms.DockStyle.Top;
		this.barDockControlTop.Location = new System.Drawing.Point(0, 0);
		this.barDockControlTop.Size = new System.Drawing.Size(1022, 60);
		this.barDockControlBottom.CausesValidation = false;
		this.barDockControlBottom.Dock = System.Windows.Forms.DockStyle.Bottom;
		this.barDockControlBottom.Location = new System.Drawing.Point(0, 448);
		this.barDockControlBottom.Size = new System.Drawing.Size(1022, 22);
		this.barDockControlLeft.CausesValidation = false;
		this.barDockControlLeft.Dock = System.Windows.Forms.DockStyle.Left;
		this.barDockControlLeft.Location = new System.Drawing.Point(0, 60);
		this.barDockControlLeft.Size = new System.Drawing.Size(0, 388);
		this.barDockControlRight.CausesValidation = false;
		this.barDockControlRight.Dock = System.Windows.Forms.DockStyle.Right;
		this.barDockControlRight.Location = new System.Drawing.Point(1022, 60);
		this.barDockControlRight.Size = new System.Drawing.Size(0, 388);
		this.standaloneBarDockControl1.CausesValidation = false;
		this.standaloneBarDockControl1.Dock = System.Windows.Forms.DockStyle.Top;
		this.standaloneBarDockControl1.Location = new System.Drawing.Point(0, 0);
		this.standaloneBarDockControl1.Name = "standaloneBarDockControl1";
		this.standaloneBarDockControl1.Size = new System.Drawing.Size(1020, 62);
		this.standaloneBarDockControl1.Text = "standaloneBarDockControl1";
		this.standaloneBarDockControl2.CausesValidation = false;
		this.standaloneBarDockControl2.Dock = System.Windows.Forms.DockStyle.Top;
		this.standaloneBarDockControl2.Location = new System.Drawing.Point(0, 0);
		this.standaloneBarDockControl2.Name = "standaloneBarDockControl2";
		this.standaloneBarDockControl2.Size = new System.Drawing.Size(1020, 63);
		this.standaloneBarDockControl2.Text = "standaloneBarDockControl2";
		this.xtraTabControl1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.xtraTabControl1.Location = new System.Drawing.Point(0, 60);
		this.xtraTabControl1.Name = "xtraTabControl1";
		this.xtraTabControl1.SelectedTabPage = this.xtraTabPage1;
		this.xtraTabControl1.Size = new System.Drawing.Size(1022, 388);
		this.xtraTabControl1.TabIndex = 4;
		this.xtraTabControl1.TabPages.AddRange(new DevExpress.XtraTab.XtraTabPage[2] { this.xtraTabPage1, this.xtraTabPage2 });
		this.xtraTabPage1.Controls.Add(this.gridControl1);
		this.xtraTabPage1.Controls.Add(this.standaloneBarDockControl1);
		this.xtraTabPage1.Image = (System.Drawing.Image)resources.GetObject("xtraTabPage1.Image");
		this.xtraTabPage1.Name = "xtraTabPage1";
		this.xtraTabPage1.Size = new System.Drawing.Size(1020, 358);
		this.xtraTabPage1.Text = "Main";
		this.gridControl1.Dock = System.Windows.Forms.DockStyle.Fill;
		this.gridControl1.Location = new System.Drawing.Point(0, 62);
		this.gridControl1.MainView = this.gridView1;
		this.gridControl1.MenuManager = this.barManager1;
		this.gridControl1.Name = "gridControl1";
		this.gridControl1.RepositoryItems.AddRange(new DevExpress.XtraEditors.Repository.RepositoryItem[1] { this.repositoryItemImageComboBox1 });
		this.gridControl1.Size = new System.Drawing.Size(1020, 296);
		this.gridControl1.TabIndex = 6;
		this.gridControl1.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[1] { this.gridView1 });
		this.gridView1.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[17]
		{
			this.gridColumn22, this.gridColumn25, this.gridColumn1, this.gridColumn2, this.gridColumn3, this.gridColumn4, this.gridColumn5, this.gridColumn6, this.gridColumn7, this.gridColumn8,
			this.gridColumn9, this.gridColumn10, this.gridColumn11, this.gridColumn12, this.gridColumn13, this.gridColumn14, this.gridColumn24
		});
		this.gridView1.GridControl = this.gridControl1;
		this.gridView1.Name = "gridView1";
		this.gridView1.OptionsBehavior.Editable = false;
		this.gridView1.OptionsCustomization.AllowColumnMoving = false;
		this.gridView1.OptionsSelection.CheckBoxSelectorColumnWidth = 50;
		this.gridView1.OptionsSelection.MultiSelect = true;
		this.gridView1.OptionsSelection.MultiSelectMode = DevExpress.XtraGrid.Views.Grid.GridMultiSelectMode.CheckBoxRowSelect;
		this.gridView1.OptionsView.EnableAppearanceEvenRow = true;
		this.gridView1.OptionsView.ShowFooter = true;
		this.gridView1.OptionsView.ShowGroupPanel = false;
		this.gridColumn22.Caption = "isDup";
		this.gridColumn22.ColumnEdit = this.repositoryItemImageComboBox1;
		this.gridColumn22.FieldName = "isDup";
		this.gridColumn22.Name = "gridColumn22";
		this.gridColumn22.Visible = true;
		this.gridColumn22.VisibleIndex = 1;
		this.repositoryItemImageComboBox1.AutoHeight = false;
		this.repositoryItemImageComboBox1.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.repositoryItemImageComboBox1.Items.AddRange(new DevExpress.XtraEditors.Controls.ImageComboBoxItem[1]
		{
			new DevExpress.XtraEditors.Controls.ImageComboBoxItem("Dup", "Y", 0)
		});
		this.repositoryItemImageComboBox1.Name = "repositoryItemImageComboBox1";
		this.repositoryItemImageComboBox1.SmallImages = this.image16x16;
		this.image16x16.ImageStream = (DevExpress.Utils.ImageCollectionStreamer)resources.GetObject("image16x16.ImageStream");
		this.image16x16.InsertGalleryImage("cancel_16x16.png", "images/actions/cancel_16x16.png", DevExpress.Images.ImageResourceCache.Default.GetImage("images/actions/cancel_16x16.png"), 0);
		this.image16x16.Images.SetKeyName(0, "cancel_16x16.png");
		this.gridColumn25.Caption = "Agent Code";
		this.gridColumn25.FieldName = "AGENTCODE";
		this.gridColumn25.Name = "gridColumn25";
		this.gridColumn25.Visible = true;
		this.gridColumn25.VisibleIndex = 2;
		this.gridColumn1.Caption = "Agent Name";
		this.gridColumn1.FieldName = "AGENT_NAME";
		this.gridColumn1.Name = "gridColumn1";
		this.gridColumn1.Summary.AddRange(new DevExpress.XtraGrid.GridSummaryItem[1]
		{
			new DevExpress.XtraGrid.GridColumnSummaryItem(DevExpress.Data.SummaryItemType.Count, "AGENT_NAME", "{0}")
		});
		this.gridColumn1.Visible = true;
		this.gridColumn1.VisibleIndex = 3;
		this.gridColumn2.Caption = "Guide Name";
		this.gridColumn2.FieldName = "GUIDENAME";
		this.gridColumn2.Name = "gridColumn2";
		this.gridColumn2.Visible = true;
		this.gridColumn2.VisibleIndex = 4;
		this.gridColumn3.Caption = "Tel Guide";
		this.gridColumn3.FieldName = "TEL_GUIDE";
		this.gridColumn3.Name = "gridColumn3";
		this.gridColumn3.Visible = true;
		this.gridColumn3.VisibleIndex = 5;
		this.gridColumn4.Caption = "PartyCode";
		this.gridColumn4.FieldName = "PARTYCODE";
		this.gridColumn4.Name = "gridColumn4";
		this.gridColumn4.Visible = true;
		this.gridColumn4.VisibleIndex = 6;
		this.gridColumn5.Caption = "Pax";
		this.gridColumn5.FieldName = "PAX";
		this.gridColumn5.Name = "gridColumn5";
		this.gridColumn5.Visible = true;
		this.gridColumn5.VisibleIndex = 7;
		this.gridColumn6.Caption = "Car Code";
		this.gridColumn6.FieldName = "CARCODE";
		this.gridColumn6.Name = "gridColumn6";
		this.gridColumn6.Visible = true;
		this.gridColumn6.VisibleIndex = 8;
		this.gridColumn7.Caption = "Arrive Date";
		this.gridColumn7.FieldName = "ARRIVE_DATE";
		this.gridColumn7.Name = "gridColumn7";
		this.gridColumn7.Visible = true;
		this.gridColumn7.VisibleIndex = 9;
		this.gridColumn8.Caption = "Departure Date";
		this.gridColumn8.FieldName = "DEPARTURE_DATE";
		this.gridColumn8.Name = "gridColumn8";
		this.gridColumn8.Visible = true;
		this.gridColumn8.VisibleIndex = 10;
		this.gridColumn9.Caption = "Nation";
		this.gridColumn9.FieldName = "NATION_CODE";
		this.gridColumn9.Name = "gridColumn9";
		this.gridColumn9.Visible = true;
		this.gridColumn9.VisibleIndex = 11;
		this.gridColumn10.Caption = "Order Date";
		this.gridColumn10.FieldName = "ORDER_DATE";
		this.gridColumn10.Name = "gridColumn10";
		this.gridColumn10.Visible = true;
		this.gridColumn10.VisibleIndex = 12;
		this.gridColumn11.Caption = "Fax No";
		this.gridColumn11.FieldName = "FAX_NO";
		this.gridColumn11.Name = "gridColumn11";
		this.gridColumn11.Visible = true;
		this.gridColumn11.VisibleIndex = 13;
		this.gridColumn12.Caption = "AgentCode Ref";
		this.gridColumn12.FieldName = "AGENTCODE_REF";
		this.gridColumn12.Name = "gridColumn12";
		this.gridColumn12.Visible = true;
		this.gridColumn12.VisibleIndex = 14;
		this.gridColumn13.Caption = "PartyCode Ref";
		this.gridColumn13.FieldName = "PARTYCODE_REF";
		this.gridColumn13.Name = "gridColumn13";
		this.gridColumn13.Visible = true;
		this.gridColumn13.VisibleIndex = 15;
		this.gridColumn14.Caption = "Remark Book";
		this.gridColumn14.FieldName = "BOOK_REMARK";
		this.gridColumn14.Name = "gridColumn14";
		this.gridColumn14.Visible = true;
		this.gridColumn14.VisibleIndex = 16;
		this.gridColumn24.Caption = "Tel Driver";
		this.gridColumn24.FieldName = "TEL_DRIVER";
		this.gridColumn24.Name = "gridColumn24";
		this.gridColumn24.Visible = true;
		this.gridColumn24.VisibleIndex = 17;
		this.xtraTabPage2.Controls.Add(this.gridControl2);
		this.xtraTabPage2.Controls.Add(this.standaloneBarDockControl2);
		this.xtraTabPage2.Image = (System.Drawing.Image)resources.GetObject("xtraTabPage2.Image");
		this.xtraTabPage2.Name = "xtraTabPage2";
		this.xtraTabPage2.Size = new System.Drawing.Size(1020, 358);
		this.xtraTabPage2.Text = "Detail";
		this.gridControl2.Dock = System.Windows.Forms.DockStyle.Fill;
		this.gridControl2.Location = new System.Drawing.Point(0, 63);
		this.gridControl2.MainView = this.gridView2;
		this.gridControl2.MenuManager = this.barManager1;
		this.gridControl2.Name = "gridControl2";
		this.gridControl2.RepositoryItems.AddRange(new DevExpress.XtraEditors.Repository.RepositoryItem[1] { this.repositoryItemImageComboBox2 });
		this.gridControl2.Size = new System.Drawing.Size(1020, 295);
		this.gridControl2.TabIndex = 2;
		this.gridControl2.ViewCollection.AddRange(new DevExpress.XtraGrid.Views.Base.BaseView[1] { this.gridView2 });
		this.gridView2.Columns.AddRange(new DevExpress.XtraGrid.Columns.GridColumn[8] { this.gridColumn23, this.gridColumn15, this.gridColumn16, this.gridColumn17, this.gridColumn18, this.gridColumn19, this.gridColumn20, this.gridColumn21 });
		this.gridView2.GridControl = this.gridControl2;
		this.gridView2.Name = "gridView2";
		this.gridView2.OptionsBehavior.Editable = false;
		this.gridView2.OptionsCustomization.AllowColumnMoving = false;
		this.gridView2.OptionsSelection.CheckBoxSelectorColumnWidth = 50;
		this.gridView2.OptionsSelection.MultiSelect = true;
		this.gridView2.OptionsSelection.MultiSelectMode = DevExpress.XtraGrid.Views.Grid.GridMultiSelectMode.CheckBoxRowSelect;
		this.gridView2.OptionsView.EnableAppearanceEvenRow = true;
		this.gridView2.OptionsView.ShowFooter = true;
		this.gridView2.OptionsView.ShowGroupPanel = false;
		this.gridColumn23.Caption = "isDup";
		this.gridColumn23.ColumnEdit = this.repositoryItemImageComboBox2;
		this.gridColumn23.FieldName = "isDup";
		this.gridColumn23.Name = "gridColumn23";
		this.gridColumn23.Visible = true;
		this.gridColumn23.VisibleIndex = 1;
		this.repositoryItemImageComboBox2.AutoHeight = false;
		this.repositoryItemImageComboBox2.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[1]
		{
			new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)
		});
		this.repositoryItemImageComboBox2.Items.AddRange(new DevExpress.XtraEditors.Controls.ImageComboBoxItem[1]
		{
			new DevExpress.XtraEditors.Controls.ImageComboBoxItem("Dup", "Y", 0)
		});
		this.repositoryItemImageComboBox2.Name = "repositoryItemImageComboBox2";
		this.repositoryItemImageComboBox2.SmallImages = this.image16x16;
		this.gridColumn15.Caption = "Order Date";
		this.gridColumn15.FieldName = "ORDER_DATE";
		this.gridColumn15.Name = "gridColumn15";
		this.gridColumn15.Summary.AddRange(new DevExpress.XtraGrid.GridSummaryItem[1]
		{
			new DevExpress.XtraGrid.GridColumnSummaryItem(DevExpress.Data.SummaryItemType.Count, "ORDER_DATE", "{0}")
		});
		this.gridColumn15.Visible = true;
		this.gridColumn15.VisibleIndex = 2;
		this.gridColumn16.Caption = "Fax No";
		this.gridColumn16.FieldName = "FAX_NO";
		this.gridColumn16.Name = "gridColumn16";
		this.gridColumn16.Visible = true;
		this.gridColumn16.VisibleIndex = 3;
		this.gridColumn17.Caption = "Agent Code";
		this.gridColumn17.FieldName = "AGENT_CODE";
		this.gridColumn17.Name = "gridColumn17";
		this.gridColumn17.Visible = true;
		this.gridColumn17.VisibleIndex = 4;
		this.gridColumn18.Caption = "Code";
		this.gridColumn18.FieldName = "CODE";
		this.gridColumn18.Name = "gridColumn18";
		this.gridColumn18.Visible = true;
		this.gridColumn18.VisibleIndex = 5;
		this.gridColumn19.Caption = "Place";
		this.gridColumn19.FieldName = "PLACE_CODE";
		this.gridColumn19.Name = "gridColumn19";
		this.gridColumn19.Visible = true;
		this.gridColumn19.VisibleIndex = 6;
		this.gridColumn20.Caption = "Start Date";
		this.gridColumn20.FieldName = "START_DATE";
		this.gridColumn20.Name = "gridColumn20";
		this.gridColumn20.Visible = true;
		this.gridColumn20.VisibleIndex = 7;
		this.gridColumn21.Caption = "End Date";
		this.gridColumn21.FieldName = "END_DATE";
		this.gridColumn21.Name = "gridColumn21";
		this.gridColumn21.Visible = true;
		this.gridColumn21.VisibleIndex = 8;
		this.barManager2.Bars.AddRange(new DevExpress.XtraBars.Bar[1] { this.bar2 });
		this.barManager2.DockControls.Add(this.barDockControl1);
		this.barManager2.DockControls.Add(this.barDockControl2);
		this.barManager2.DockControls.Add(this.barDockControl3);
		this.barManager2.DockControls.Add(this.barDockControl4);
		this.barManager2.Form = this;
		this.barManager2.Items.AddRange(new DevExpress.XtraBars.BarItem[3] { this.btnBrowseMain, this.barStaticItem2, this.btnClearGridMain });
		this.barManager2.MaxItemId = 3;
		this.bar2.BarName = "Tools";
		this.bar2.DockCol = 0;
		this.bar2.DockRow = 0;
		this.bar2.DockStyle = DevExpress.XtraBars.BarDockStyle.Standalone;
		this.bar2.LinksPersistInfo.AddRange(new DevExpress.XtraBars.LinkPersistInfo[3]
		{
			new DevExpress.XtraBars.LinkPersistInfo(this.btnBrowseMain),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem2),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnClearGridMain)
		});
		this.bar2.OptionsBar.DrawBorder = false;
		this.bar2.OptionsBar.DrawDragBorder = false;
		this.bar2.StandaloneBarDockControl = this.standaloneBarDockControl1;
		this.bar2.Text = "Tools";
		this.btnBrowseMain.Caption = "Browse Main";
		this.btnBrowseMain.Glyph = (System.Drawing.Image)resources.GetObject("btnBrowseMain.Glyph");
		this.btnBrowseMain.Id = 0;
		this.btnBrowseMain.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnBrowseMain.LargeGlyph");
		this.btnBrowseMain.Name = "btnBrowseMain";
		this.btnBrowseMain.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnBrowseMain_ItemClick);
		this.barStaticItem2.Id = 1;
		this.barStaticItem2.Name = "barStaticItem2";
		this.barStaticItem2.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnClearGridMain.Caption = "Clear Grid Main";
		this.btnClearGridMain.Glyph = (System.Drawing.Image)resources.GetObject("btnClearGridMain.Glyph");
		this.btnClearGridMain.Id = 2;
		this.btnClearGridMain.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnClearGridMain.LargeGlyph");
		this.btnClearGridMain.Name = "btnClearGridMain";
		this.btnClearGridMain.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnClearGridMain_ItemClick);
		this.barDockControl1.CausesValidation = false;
		this.barDockControl1.Dock = System.Windows.Forms.DockStyle.Top;
		this.barDockControl1.Location = new System.Drawing.Point(0, 0);
		this.barDockControl1.Size = new System.Drawing.Size(1022, 0);
		this.barDockControl2.CausesValidation = false;
		this.barDockControl2.Dock = System.Windows.Forms.DockStyle.Bottom;
		this.barDockControl2.Location = new System.Drawing.Point(0, 470);
		this.barDockControl2.Size = new System.Drawing.Size(1022, 0);
		this.barDockControl3.CausesValidation = false;
		this.barDockControl3.Dock = System.Windows.Forms.DockStyle.Left;
		this.barDockControl3.Location = new System.Drawing.Point(0, 0);
		this.barDockControl3.Size = new System.Drawing.Size(0, 470);
		this.barDockControl4.CausesValidation = false;
		this.barDockControl4.Dock = System.Windows.Forms.DockStyle.Right;
		this.barDockControl4.Location = new System.Drawing.Point(1022, 0);
		this.barDockControl4.Size = new System.Drawing.Size(0, 470);
		this.barManager3.Bars.AddRange(new DevExpress.XtraBars.Bar[1] { this.bar4 });
		this.barManager3.DockControls.Add(this.barDockControl5);
		this.barManager3.DockControls.Add(this.barDockControl6);
		this.barManager3.DockControls.Add(this.barDockControl7);
		this.barManager3.DockControls.Add(this.barDockControl8);
		this.barManager3.Form = this;
		this.barManager3.Items.AddRange(new DevExpress.XtraBars.BarItem[3] { this.btnBrowseDetail, this.barStaticItem3, this.btnClearGridDetail });
		this.barManager3.MaxItemId = 3;
		this.bar4.BarName = "Tools";
		this.bar4.DockCol = 0;
		this.bar4.DockRow = 0;
		this.bar4.DockStyle = DevExpress.XtraBars.BarDockStyle.Standalone;
		this.bar4.LinksPersistInfo.AddRange(new DevExpress.XtraBars.LinkPersistInfo[3]
		{
			new DevExpress.XtraBars.LinkPersistInfo(this.btnBrowseDetail),
			new DevExpress.XtraBars.LinkPersistInfo(this.barStaticItem3),
			new DevExpress.XtraBars.LinkPersistInfo(this.btnClearGridDetail)
		});
		this.bar4.OptionsBar.DrawBorder = false;
		this.bar4.OptionsBar.DrawDragBorder = false;
		this.bar4.StandaloneBarDockControl = this.standaloneBarDockControl2;
		this.bar4.Text = "Tools";
		this.btnBrowseDetail.Caption = "Browse Detail";
		this.btnBrowseDetail.Glyph = (System.Drawing.Image)resources.GetObject("btnBrowseDetail.Glyph");
		this.btnBrowseDetail.Id = 0;
		this.btnBrowseDetail.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnBrowseDetail.LargeGlyph");
		this.btnBrowseDetail.Name = "btnBrowseDetail";
		this.btnBrowseDetail.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnBrowseDetail_ItemClick);
		this.barStaticItem3.Id = 1;
		this.barStaticItem3.Name = "barStaticItem3";
		this.barStaticItem3.TextAlignment = System.Drawing.StringAlignment.Near;
		this.btnClearGridDetail.Caption = "Clear Grid Detail";
		this.btnClearGridDetail.Glyph = (System.Drawing.Image)resources.GetObject("btnClearGridDetail.Glyph");
		this.btnClearGridDetail.Id = 2;
		this.btnClearGridDetail.LargeGlyph = (System.Drawing.Image)resources.GetObject("btnClearGridDetail.LargeGlyph");
		this.btnClearGridDetail.Name = "btnClearGridDetail";
		this.btnClearGridDetail.ItemClick += new DevExpress.XtraBars.ItemClickEventHandler(btnClearGridDetail_ItemClick);
		this.barDockControl5.CausesValidation = false;
		this.barDockControl5.Dock = System.Windows.Forms.DockStyle.Top;
		this.barDockControl5.Location = new System.Drawing.Point(0, 0);
		this.barDockControl5.Size = new System.Drawing.Size(1022, 0);
		this.barDockControl6.CausesValidation = false;
		this.barDockControl6.Dock = System.Windows.Forms.DockStyle.Bottom;
		this.barDockControl6.Location = new System.Drawing.Point(0, 470);
		this.barDockControl6.Size = new System.Drawing.Size(1022, 0);
		this.barDockControl7.CausesValidation = false;
		this.barDockControl7.Dock = System.Windows.Forms.DockStyle.Left;
		this.barDockControl7.Location = new System.Drawing.Point(0, 0);
		this.barDockControl7.Size = new System.Drawing.Size(0, 470);
		this.barDockControl8.CausesValidation = false;
		this.barDockControl8.Dock = System.Windows.Forms.DockStyle.Right;
		this.barDockControl8.Location = new System.Drawing.Point(1022, 0);
		this.barDockControl8.Size = new System.Drawing.Size(0, 470);
		this.splashScreenManager1.ClosingDelay = 500;
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(1022, 470);
		base.Controls.Add(this.xtraTabControl1);
		base.Controls.Add(this.barDockControlLeft);
		base.Controls.Add(this.barDockControlRight);
		base.Controls.Add(this.barDockControlBottom);
		base.Controls.Add(this.barDockControlTop);
		base.Controls.Add(this.barDockControl3);
		base.Controls.Add(this.barDockControl4);
		base.Controls.Add(this.barDockControl2);
		base.Controls.Add(this.barDockControl1);
		base.Controls.Add(this.barDockControl7);
		base.Controls.Add(this.barDockControl8);
		base.Controls.Add(this.barDockControl6);
		base.Controls.Add(this.barDockControl5);
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.Name = "FrmImportExcelSeparate";
		this.Text = "Import Excel Separate";
		base.WindowState = System.Windows.Forms.FormWindowState.Maximized;
		((System.ComponentModel.ISupportInitialize)this.barManager1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.xtraTabControl1).EndInit();
		this.xtraTabControl1.ResumeLayout(false);
		this.xtraTabPage1.ResumeLayout(false);
		((System.ComponentModel.ISupportInitialize)this.gridControl1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridView1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemImageComboBox1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.image16x16).EndInit();
		this.xtraTabPage2.ResumeLayout(false);
		((System.ComponentModel.ISupportInitialize)this.gridControl2).EndInit();
		((System.ComponentModel.ISupportInitialize)this.gridView2).EndInit();
		((System.ComponentModel.ISupportInitialize)this.repositoryItemImageComboBox2).EndInit();
		((System.ComponentModel.ISupportInitialize)this.barManager2).EndInit();
		((System.ComponentModel.ISupportInitialize)this.barManager3).EndInit();
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
